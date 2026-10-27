import type { AppliedCoupon } from '@/app/types/Cart';
import type { EditionType, Network } from '@/app/types/Nft';
import type { ValueOf } from '@/app/utils/ValueOf';

export const QuoteIssueType = {
  PRICE_CHANGED: 'PRICE_CHANGED',
  UNAVAILABLE: 'UNAVAILABLE',
  QUANTITY_EXCEEDED: 'QUANTITY_EXCEEDED',
  COUPON_EXPIRED: 'COUPON_EXPIRED',
} as const;

export type QuoteIssueType = ValueOf<typeof QuoteIssueType>;

export type QuoteIssue = {
  type: QuoteIssueType;
  itemId?: string;
  previousValue?: string;
  currentValue?: string;
};

export type QuoteItem = {
  itemId: string;
  nftId: string;
  editionType: EditionType;
  name: string;
  tokenId: string;
  image: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  available: number;
};

export type Quote = {
  id: string;
  cartVersion: number;
  network: Network;
  items: QuoteItem[];
  coupon: AppliedCoupon | null;
  subtotal: string;
  discount: string;
  networkFee: string;
  total: string;
  issues: QuoteIssue[];
  createdAt: string;
  expiresAt: string;
};
