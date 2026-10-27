import type { Cart } from '@/app/types/Cart';
import { multiplyEth } from '@/app/utils/eth';
import { db, nextId, persist } from '@/mocks/db';
import type { CartRecord } from '@/mocks/db/types';
import { getEdition } from '@/mocks/domain/nfts';
import { couponFixtures } from '@/mocks/fixtures/coupons';

export const GUEST_CART_HEADER = 'X-Guest-Cart-Id';

function createCart(ownerId: string | null): CartRecord {
  const cart: CartRecord = {
    id: nextId('cart'),
    ownerId,
    items: [],
    couponCode: null,
    version: 1,
    updatedAt: new Date().toISOString(),
  };

  db.carts[cart.id] = cart;
  persist();

  return cart;
}

export function findUserCart(userId: string) {
  return Object.values(db.carts).find((cart) => cart.ownerId === userId);
}

export function getOrCreateCart(request: Request, userId: string | null): CartRecord {
  if (userId) {
    return findUserCart(userId) ?? createCart(userId);
  }

  const guestCartId = request.headers.get(GUEST_CART_HEADER);
  const guestCart = guestCartId ? db.carts[guestCartId] : undefined;

  if (guestCart && guestCart.ownerId === null) {
    return guestCart;
  }

  return createCart(null);
}

export function touchCart(cart: CartRecord) {
  cart.version += 1;
  cart.updatedAt = new Date().toISOString();
  persist();
}

export function findCoupon(code: string) {
  return couponFixtures.find((coupon) => coupon.code === code.trim().toUpperCase());
}

export function isCouponExpired(code: string) {
  const coupon = findCoupon(code);

  return !coupon || new Date(coupon.expiresAt).getTime() <= Date.now();
}

export function toCartView(cart: CartRecord): Cart {
  const coupon = cart.couponCode ? findCoupon(cart.couponCode) : undefined;

  return {
    id: cart.id,
    version: cart.version,
    updatedAt: cart.updatedAt,
    coupon: coupon ? { code: coupon.code, percentOff: coupon.percentOff } : null,
    items: cart.items.flatMap((item) => {
      const nft = db.nfts[item.nftId];
      const edition = nft ? getEdition(nft, item.editionType) : undefined;

      if (!nft || !edition) {
        return [];
      }

      return [
        {
          id: item.id,
          nftId: nft.id,
          editionType: item.editionType,
          quantity: item.quantity,
          name: nft.name,
          tokenId: nft.tokenId,
          image: nft.image,
          network: nft.network,
          unitPrice: nft.price,
          addedUnitPrice: item.addedUnitPrice,
          lineTotal: multiplyEth(nft.price, item.quantity),
          available: edition.available,
          maxPerOrder: edition.maxPerOrder,
        },
      ];
    }),
  };
}
