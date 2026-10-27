import { OrderStatus } from '@/app/types/Order';
import { type OrderUpdatedEvent, RealtimeEventType } from '@/app/types/Realtime';
import { db, nextId, persist } from '@/mocks/db';
import type { OrderRecord } from '@/mocks/db/types';
import { touchCart } from '@/mocks/domain/cart';
import { updateNft } from '@/mocks/realtime/nftUpdates';
import { emitToUser } from '@/mocks/realtime/server';
import { createRandom, randomHex } from '@/mocks/utils/random';

const DECLINE_REASON = 'A carteira recusou a assinatura da transação.';

const timers = new Map<string, ReturnType<typeof setTimeout>>();

function toEvent(record: OrderRecord): OrderUpdatedEvent {
  return {
    eventId: nextId('evt'),
    type: RealtimeEventType.ORDER_UPDATED,
    resource: { type: 'order', id: record.order.id },
    version: record.order.version,
    occurredAt: record.order.updatedAt,
    data: record.order,
  };
}

// only the purchased quantities leave the cart, and the coupon is consumed with them
function removePurchasedItems(record: OrderRecord) {
  const cart = db.carts[record.cartId];

  if (!cart) {
    return;
  }

  cart.items = cart.items.flatMap((cartItem) => {
    const purchased = record.order.items.find(
      (item) => item.nftId === cartItem.nftId && item.editionType === cartItem.editionType,
    );
    const remaining = cartItem.quantity - (purchased?.quantity ?? 0);

    return remaining > 0 ? [{ ...cartItem, quantity: remaining }] : [];
  });

  if (record.order.couponCode && cart.couponCode === record.order.couponCode) {
    cart.couponCode = null;
  }

  touchCart(cart);
}

function resolveOrder(orderId: string) {
  const record = db.orders[orderId];
  timers.delete(orderId);

  if (!record || record.order.status !== OrderStatus.PENDING) {
    return;
  }

  const isConfirmed = record.outcome === OrderStatus.CONFIRMED;
  const random = createRandom(record.processAt);

  record.order = {
    ...record.order,
    status: record.outcome,
    transactionHash: isConfirmed ? `0x${randomHex(random, 64)}` : null,
    declineReason: isConfirmed ? null : DECLINE_REASON,
    updatedAt: new Date(record.processAt).toISOString(),
    version: record.order.version + 1,
  };

  if (isConfirmed) {
    removePurchasedItems(record);
  }

  persist();
  emitToUser(record.userId, RealtimeEventType.ORDER_UPDATED, toEvent(record));

  if (isConfirmed) {
    record.order.items.forEach((item) => {
      const edition = db.nfts[item.nftId]?.editions.find(({ type }) => type === item.editionType);

      if (edition) {
        updateNft(item.nftId, {
          editions: { [item.editionType]: edition.available - item.quantity },
        });
      }
    });
  }
}

export function scheduleOrder(orderId: string) {
  const record = db.orders[orderId];

  if (!record || record.order.status !== OrderStatus.PENDING || timers.has(orderId)) {
    return;
  }

  timers.set(
    orderId,
    setTimeout(() => resolveOrder(orderId), Math.max(record.processAt - Date.now(), 0)),
  );
}

// timers do not survive a reload, so pending orders are rescheduled when the mocks start
Object.keys(db.orders).forEach(scheduleOrder);
