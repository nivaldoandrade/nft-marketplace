import type { EditionType, Network } from '@/app/types/Nft';

export type CartItem = {
  id: string;
  nftId: string;
  editionType: EditionType;
  quantity: number;
  name: string;
  tokenId: string;
  image: string;
  network: Network;
  unitPrice: string;
  addedUnitPrice: string;
  lineTotal: string;
  available: number;
  maxPerOrder: number;
};

export type AppliedCoupon = {
  code: string;
  percentOff: number;
};

export type Cart = {
  id: string;
  items: CartItem[];
  coupon: AppliedCoupon | null;
  version: number;
  updatedAt: string;
};
