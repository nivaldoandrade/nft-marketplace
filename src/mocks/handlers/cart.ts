import { http, HttpResponse } from 'msw';

import { EditionType, Network } from '@/app/types/Nft';
import { apiPath } from '@/mocks/config';
import { db, nextId, persist } from '@/mocks/db';
import type { CartRecord } from '@/mocks/db/types';
import {
  findCoupon,
  getOrCreateCart,
  isCouponExpired,
  toCartView,
  touchCart,
} from '@/mocks/domain/cart';
import { getEdition } from '@/mocks/domain/nfts';
import { buildQuote } from '@/mocks/domain/quote';
import { getOptionalUser, requireUser } from '@/mocks/domain/session';
import { apiError, validationError } from '@/mocks/utils/responses';
import { readJson } from '@/mocks/utils/validators';

type AddItemBody = { nftId: string; editionType: EditionType; quantity: number };
type UpdateItemBody = { quantity: number };

function isValidQuantity(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function resolveCart(request: Request) {
  const user = getOptionalUser(request);

  return getOrCreateCart(request, user?.id ?? null);
}

function checkAvailability(nftId: string, editionType: EditionType, quantity: number) {
  const nft = db.nfts[nftId];

  if (!nft) {
    return apiError(404, 'RESOURCE_NOT_FOUND');
  }

  const edition = getEdition(nft, editionType);

  if (!edition || edition.available === 0) {
    return apiError(409, 'EDITION_UNAVAILABLE');
  }

  const limit = Math.min(edition.available, edition.maxPerOrder);

  if (quantity > limit) {
    return apiError(409, 'QUANTITY_UNAVAILABLE', { available: limit });
  }

  return null;
}

function respond(cart: CartRecord) {
  return HttpResponse.json(toCartView(cart));
}

export const cartHandlers = [
  http.get(apiPath('/cart'), ({ request }) => respond(resolveCart(request))),

  http.post(apiPath('/cart/items'), async ({ request }) => {
    const body = await readJson<AddItemBody>(request);

    if (
      typeof body.nftId !== 'string' ||
      !Object.values(EditionType).includes(body.editionType as EditionType) ||
      !isValidQuantity(body.quantity)
    ) {
      return validationError({ quantity: 'Informe uma quantidade válida.' });
    }

    const cart = resolveCart(request);
    const existing = cart.items.find(
      (item) => item.nftId === body.nftId && item.editionType === body.editionType,
    );
    const quantity = (existing?.quantity ?? 0) + body.quantity;
    const unavailable = checkAvailability(body.nftId, body.editionType!, quantity);

    if (unavailable) {
      return unavailable;
    }

    if (existing) {
      existing.quantity = quantity;
    } else {
      cart.items.push({
        id: nextId('item'),
        nftId: body.nftId,
        editionType: body.editionType!,
        quantity: body.quantity,
        addedUnitPrice: db.nfts[body.nftId].price,
      });
    }

    touchCart(cart);

    return respond(cart);
  }),

  http.patch(apiPath('/cart/items/:itemId'), async ({ request, params }) => {
    const body = await readJson<UpdateItemBody>(request);

    if (!isValidQuantity(body.quantity)) {
      return validationError({ quantity: 'Informe uma quantidade válida.' });
    }

    const cart = resolveCart(request);
    const item = cart.items.find((entry) => entry.id === params.itemId);

    if (!item) {
      return apiError(404, 'RESOURCE_NOT_FOUND');
    }

    const unavailable = checkAvailability(item.nftId, item.editionType, body.quantity);

    if (unavailable) {
      return unavailable;
    }

    item.quantity = body.quantity;
    touchCart(cart);

    return respond(cart);
  }),

  http.delete(apiPath('/cart/items/:itemId'), ({ request, params }) => {
    const cart = resolveCart(request);

    if (!cart.items.some((item) => item.id === params.itemId)) {
      return apiError(404, 'RESOURCE_NOT_FOUND');
    }

    cart.items = cart.items.filter((item) => item.id !== params.itemId);
    touchCart(cart);

    return respond(cart);
  }),

  http.post(apiPath('/cart/merge'), async ({ request }) => {
    const auth = requireUser(request);

    if ('error' in auth) {
      return auth.error;
    }

    const body = await readJson<{ guestCartId: string }>(request);
    const cart = getOrCreateCart(request, auth.user.id);
    const guestCart = body.guestCartId ? db.carts[body.guestCartId] : undefined;

    if (!guestCart || guestCart.ownerId !== null) {
      return respond(cart);
    }

    for (const guestItem of guestCart.items) {
      const nft = db.nfts[guestItem.nftId];
      const edition = nft ? getEdition(nft, guestItem.editionType) : undefined;

      if (!nft || !edition || edition.available === 0) {
        continue;
      }

      const limit = Math.min(edition.available, edition.maxPerOrder);
      const existing = cart.items.find(
        (item) => item.nftId === guestItem.nftId && item.editionType === guestItem.editionType,
      );

      if (existing) {
        existing.quantity = Math.min(existing.quantity + guestItem.quantity, limit);
      } else {
        cart.items.push({ ...guestItem, quantity: Math.min(guestItem.quantity, limit) });
      }
    }

    cart.couponCode = cart.couponCode ?? guestCart.couponCode;
    delete db.carts[guestCart.id];
    touchCart(cart);
    persist();

    return respond(cart);
  }),

  http.put(apiPath('/cart/coupon'), async ({ request }) => {
    const body = await readJson<{ code: string }>(request);
    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';

    if (!code) {
      return validationError({ code: 'Informe o código promocional.' });
    }

    if (!findCoupon(code)) {
      return apiError(422, 'COUPON_INVALID', { fields: { code: 'Cupom inválido.' } });
    }

    if (isCouponExpired(code)) {
      return apiError(422, 'COUPON_EXPIRED', { fields: { code: 'Este cupom expirou.' } });
    }

    const cart = resolveCart(request);
    cart.couponCode = code;
    touchCart(cart);

    return respond(cart);
  }),

  http.delete(apiPath('/cart/coupon'), ({ request }) => {
    const cart = resolveCart(request);
    cart.couponCode = null;
    touchCart(cart);

    return respond(cart);
  }),

  http.get(apiPath('/cart/quote'), ({ request }) => {
    const user = getOptionalUser(request);
    const cart = getOrCreateCart(request, user?.id ?? null);
    const networkParam = new URL(request.url).searchParams.get('network');
    const network = Object.values(Network).includes(networkParam as Network)
      ? (networkParam as Network)
      : Network.ETHEREUM;

    return HttpResponse.json(buildQuote(cart, network));
  }),
];
