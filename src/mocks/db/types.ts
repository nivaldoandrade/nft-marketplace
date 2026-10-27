import type { EditionType, Nft, NftReview } from '@/app/types/Nft';
import type { Order, OrderStatus } from '@/app/types/Order';
import type { Wallet, WalletConnection } from '@/app/types/Wallet';

export type NftRecord = Nft & { createdAt: string; popularity: number; reviews: NftReview[] };

export type UserRecord = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  ensName: string;
  walletNickname: string;
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

export type WalletsRecord = {
  primary: Wallet | null;
  secondary: Wallet | null;
};

export type OrderRecord = {
  order: Order;
  userId: string;
  cartId: string;
  processAt: number;
  outcome: Exclude<OrderStatus, 'pending'>;
};

export type IdempotencyRecord = {
  userId: string;
  fingerprint: string;
  orderId: string;
};

export type MockDb = {
  version: number;
  sequence: number;
  nfts: Record<string, NftRecord>;
  users: Record<string, UserRecord>;
  sessions: Record<string, SessionRecord>;
  favorites: Record<string, string[]>;
  carts: Record<string, CartRecord>;
  wallets: Record<string, WalletsRecord>;
  walletConnections: Record<string, WalletConnection>;
  orders: Record<string, OrderRecord>;
  idempotency: Record<string, IdempotencyRecord>;
};
