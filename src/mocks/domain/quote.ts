import type { Network } from '@/app/types/Nft';
import { type Quote, type QuoteIssue, QuoteIssueType } from '@/app/types/Quote';
import { addEth, compareEth, multiplyEth, percentOfEth, subtractEth } from '@/app/utils/eth';
import { QUOTE_DURATION_MS } from '@/mocks/config';
import { db } from '@/mocks/db';
import type { CartRecord } from '@/mocks/db/types';
import { findCoupon, isCouponExpired } from '@/mocks/domain/cart';
import { getEdition } from '@/mocks/domain/nfts';
import { hashSeed } from '@/mocks/utils/random';

export const networkFees: Record<Network, string> = {
  ethereum: '0.016',
  polygon: '0.002',
  solana: '0.001',
};

export function buildQuote(cart: CartRecord, network: Network): Quote {
  const issues: QuoteIssue[] = [];

  const items = cart.items.flatMap((item) => {
    const nft = db.nfts[item.nftId];
    const edition = nft ? getEdition(nft, item.editionType) : undefined;

    if (!nft || !edition) {
      return [];
    }

    if (compareEth(nft.price, item.addedUnitPrice) !== 0) {
      issues.push({
        type: QuoteIssueType.PRICE_CHANGED,
        itemId: item.id,
        previousValue: item.addedUnitPrice,
        currentValue: nft.price,
      });
    }

    if (edition.available === 0) {
      issues.push({ type: QuoteIssueType.UNAVAILABLE, itemId: item.id });
    } else if (item.quantity > edition.available) {
      issues.push({
        type: QuoteIssueType.QUANTITY_EXCEEDED,
        itemId: item.id,
        previousValue: String(item.quantity),
        currentValue: String(edition.available),
      });
    }

    return [
      {
        itemId: item.id,
        nftId: nft.id,
        editionType: item.editionType,
        name: nft.name,
        tokenId: nft.tokenId,
        image: nft.image,
        quantity: item.quantity,
        unitPrice: nft.price,
        lineTotal: multiplyEth(nft.price, item.quantity),
        available: edition.available,
      },
    ];
  });

  const coupon = cart.couponCode ? findCoupon(cart.couponCode) : undefined;
  const couponIsValid = coupon && !isCouponExpired(coupon.code);

  if (cart.couponCode && !couponIsValid) {
    issues.push({ type: QuoteIssueType.COUPON_EXPIRED, currentValue: cart.couponCode });
  }

  const purchasable = items.filter((item) => item.available > 0);
  const subtotal = purchasable.length ? addEth(...purchasable.map((item) => item.lineTotal)) : '0';
  const discount = couponIsValid ? percentOfEth(subtotal, coupon.percentOff) : '0';
  const networkFee = purchasable.length ? networkFees[network] : '0';
  const total = addEth(subtractEth(subtotal, discount), networkFee);
  const now = Date.now();
  const content = {
    cartVersion: cart.version,
    network,
    items,
    coupon,
    subtotal,
    discount,
    networkFee,
    total,
    issues,
  };

  const quote: Quote = {
    // the id reflects the quoted values, so an order can check that nothing changed since the review
    id: `quo_${hashSeed(JSON.stringify(content)).toString(36)}`,
    cartVersion: cart.version,
    network,
    items,
    coupon: couponIsValid ? { code: coupon.code, percentOff: coupon.percentOff } : null,
    subtotal,
    discount,
    networkFee,
    total,
    issues,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + QUOTE_DURATION_MS).toISOString(),
  };

  return quote;
}
