import type { Network } from '@/app/types/Nft';
import type { QuoteItem } from '@/app/types/Quote';
import type { WalletProvider } from '@/app/types/Wallet';
import type { ValueOf } from '@/app/utils/ValueOf';

export const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DECLINED: 'declined',
} as const;

export type OrderStatus = ValueOf<typeof OrderStatus>;

export type OrderCollector = {
  displayName: string;
  username: string;
  profileName: string;
  email: string;
  walletAddress: string;
  secondaryAddress: string;
  referralCode: string;
  ensName: string;
  note: string;
};

export type OrderWallet = {
  id: string;
  nickname: string;
  provider: WalletProvider;
  address: string;
};

export type Order = {
  id: string;
  status: OrderStatus;
  network: Network;
  items: QuoteItem[];
  subtotal: string;
  discount: string;
  networkFee: string;
  total: string;
  couponCode: string | null;
  wallet: OrderWallet;
  collector: OrderCollector;
  transactionHash: string | null;
  declineReason: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};
