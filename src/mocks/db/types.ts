import type { EditionType, Nft, NftReview } from '@/app/types/Nft';

export type NftRecord = Nft & { createdAt: string; popularity: number; reviews: NftReview[] };

export type UserRecord = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  salt: string;
  passwordHash: string;
  createdAt: string;
};

export type SessionRecord = {
  token: string;
  userId: string;
  expiresAt: number;
};

export type CartItemRecord = {
  id: string;
  nftId: string;
  editionType: EditionType;
  quantity: number;
  addedUnitPrice: string;
};

export type CartRecord = {
  id: string;
  ownerId: string | null;
  items: CartItemRecord[];
  couponCode: string | null;
  version: number;
  updatedAt: string;
};

export type MockDb = {
  version: number;
  sequence: number;
  nfts: Record<string, NftRecord>;
  users: Record<string, UserRecord>;
  sessions: Record<string, SessionRecord>;
  favorites: Record<string, string[]>;
  carts: Record<string, CartRecord>;
};
