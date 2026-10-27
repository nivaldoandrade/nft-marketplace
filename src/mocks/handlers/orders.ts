import { delay, http, HttpResponse } from 'msw';

import { Network } from '@/app/types/Nft';
import { type Order, type OrderCollector, OrderStatus } from '@/app/types/Order';
import { QuoteIssueType } from '@/app/types/Quote';
import { addEth } from '@/app/utils/eth';
import { apiPath, ORDER_PROCESSING_MS } from '@/mocks/config';
import { db, nextId, persist } from '@/mocks/db';
import { getOrCreateCart } from '@/mocks/domain/cart';
import { buildQuote } from '@/mocks/domain/quote';
import { requireUser } from '@/mocks/domain/session';
import { findUserWallet } from '@/mocks/handlers/wallets';
import { updateNft } from '@/mocks/realtime/nftUpdates';
import { scheduleOrder } from '@/mocks/realtime/orderUpdates';
import { consumeOnce, getScenarioConfig } from '@/mocks/scenarios';
import { hashSeed } from '@/mocks/utils/random';
import { apiError, validationError } from '@/mocks/utils/responses';
import { isEmail, isFilled, readJson } from '@/mocks/utils/validators';

const IDEMPOTENCY_HEADER = 'Idempotency-Key';
const RESPONSE_LOST_DELAY_MS = 12_000;
const CHECKOUT_PRICE_INCREASE = '0.05';

type CreateOrderBody = {
  quoteId: string;
  walletId: string;
  network: Network;
  collector: OrderCollector;
};

const requiredCollectorFields: [keyof OrderCollector, string][] = [
  ['displayName', 'Informe o nome de exibição.'],
  ['username', 'Informe o nome de usuário.'],
  ['profileName', 'Informe o nome do perfil.'],
  ['referralCode', 'Informe o código de indicação.'],
  ['ensName', 'Informe o nome ENS.'],
];

function validateCollector(collector: Partial<OrderCollector> | undefined) {
  const fields: Record<string, string> = {};

  requiredCollectorFields.forEach(([field, message]) => {
    if (!isFilled(collector?.[field])) {
      fields[`collector.${field}`] = message;
    }
  });

  if (!isEmail(collector?.email)) {
    fields['collector.email'] = 'Informe um e-mail válido.';
  }

  if (!/^0x[0-9a-fA-F]{40}$/.test(collector?.walletAddress ?? '')) {
    fields['collector.walletAddress'] = 'Informe um endereço 0x válido.';
  }

  return fields;
}

// scenarios that change the cart between the review and the order, through the realtime events
function simulateCheckoutChanges(cartId: string) {
  const config = getScenarioConfig();
  const item = db.carts[cartId]?.items[0];

  if (!item) {
    return;
  }

  if (config.priceChangeOnCheckout && consumeOnce('price-change-on-checkout')) {
    updateNft(item.nftId, { price: addEth(db.nfts[item.nftId].price, CHECKOUT_PRICE_INCREASE) });
  }

  if (config.soldOutOnCheckout && consumeOnce('sold-out-on-checkout')) {
    updateNft(item.nftId, { editions: { [item.editionType]: 0 } });
  }
}

export const orderHandlers = [
  http.post(apiPath('/orders'), async ({ request }) => {
    const auth = requireUser(request);

    if ('error' in auth) {
      return auth.error;
    }

    const idempotencyKey = request.headers.get(IDEMPOTENCY_HEADER);

    if (!idempotencyKey) {
      return apiError(400, 'BAD_REQUEST');
    }

    const body = await readJson<CreateOrderBody>(request);
    const fingerprint = String(hashSeed(JSON.stringify(body)));
    const previous = db.idempotency[idempotencyKey];

    // a retry with the same key returns the order already created instead of a new one
    if (previous) {
      if (previous.userId !== auth.user.id || previous.fingerprint !== fingerprint) {
        return apiError(409, 'IDEMPOTENCY_CONFLICT');
      }

      return HttpResponse.json(db.orders[previous.orderId].order);
    }

    const network = Object.values(Network).includes(body.network as Network)
      ? (body.network as Network)
      : null;
    const fields = {
      ...validateCollector(body.collector),
      ...(!network && { network: 'Selecione uma rede.' }),
    };

    if (Object.keys(fields).length || !network) {
      return validationError(fields);
    }

    const wallet = findUserWallet(auth.user.id, body.walletId);

    if (!wallet) {
      return apiError(404, 'WALLET_NOT_FOUND');
    }

    const connection = db.walletConnections[auth.user.id];

    if (connection?.walletId !== wallet.id) {
      return apiError(409, 'WALLET_NOT_CONNECTED');
    }

    const cart = getOrCreateCart(request, auth.user.id);
    simulateCheckoutChanges(cart.id);

    const quote = buildQuote(cart, network);

    if (!quote.items.length) {
      return apiError(422, 'CART_EMPTY');
    }

    if (quote.id !== body.quoteId) {
      return apiError(409, 'QUOTE_OUTDATED', { quote });
    }

    if (quote.issues.some((issue) => issue.type !== QuoteIssueType.PRICE_CHANGED)) {
      return apiError(409, 'QUANTITY_UNAVAILABLE', { quote });
    }

    const now = new Date().toISOString();
    const order: Order = {
      id: nextId('ord'),
      status: OrderStatus.PENDING,
      network,
      items: quote.items,
      subtotal: quote.subtotal,
      discount: quote.discount,
      networkFee: quote.networkFee,
      total: quote.total,
      couponCode: quote.coupon?.code ?? null,
      wallet: {
        id: wallet.id,
        nickname: wallet.nickname,
        provider: connection.provider,
        address: body.collector!.walletAddress,
      },
      collector: body.collector as OrderCollector,
      transactionHash: null,
      declineReason: null,
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    db.orders[order.id] = {
      order,
      userId: auth.user.id,
      cartId: cart.id,
      processAt: Date.now() + ORDER_PROCESSING_MS,
      outcome: getScenarioConfig().paymentDeclined ? OrderStatus.DECLINED : OrderStatus.CONFIRMED,
    };
    db.idempotency[idempotencyKey] = { userId: auth.user.id, fingerprint, orderId: order.id };
    persist();
    scheduleOrder(order.id);

    // the order exists, but the response never reaches the client
    if (getScenarioConfig().orderTimeout && consumeOnce('order-timeout')) {
      await delay(RESPONSE_LOST_DELAY_MS);
      return HttpResponse.error();
    }

    return HttpResponse.json(order, { status: 201 });
  }),

  http.get(apiPath('/orders'), ({ request }) => {
    const auth = requireUser(request);

    if ('error' in auth) {
      return auth.error;
    }

    const status = new URL(request.url).searchParams.get('status');
    const items = Object.values(db.orders)
      .filter((record) => record.userId === auth.user.id)
      .map((record) => record.order)
      .filter((order) => !status || order.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return HttpResponse.json({ items });
  }),

  http.get(apiPath('/orders/:orderId'), ({ request, params }) => {
    const auth = requireUser(request);

    if ('error' in auth) {
      return auth.error;
    }

    const record = db.orders[params.orderId as string];

    // another user's order is reported as missing, so its existence does not leak
    if (!record || record.userId !== auth.user.id) {
      return apiError(404, 'RESOURCE_NOT_FOUND');
    }

    return HttpResponse.json(record.order);
  }),
];
