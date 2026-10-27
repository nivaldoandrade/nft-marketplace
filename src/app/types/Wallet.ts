import type { Network } from '@/app/types/Nft';
import type { ValueOf } from '@/app/utils/ValueOf';

export const WalletProvider = {
  WALLETCONNECT: 'walletconnect',
  METAMASK: 'metamask',
  COINBASE: 'coinbase',
} as const;

export type WalletProvider = ValueOf<typeof WalletProvider>;

export const WalletSlot = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
} as const;

export type WalletSlot = ValueOf<typeof WalletSlot>;

export type Wallet = {
  id: string;
  slot: WalletSlot;
  displayName: string;
  nickname: string;
  profileName: string;
  network: Network;
  address: string;
  secondaryAddress: string | null;
  provider: WalletProvider;
  referralCode: string;
  email: string;
  ensName: string;
  updatedAt: string;
};

export type WalletConnection = {
  walletId: string;
  provider: WalletProvider;
  connectedAt: string;
};

export type Wallets = {
  primary: Wallet | null;
  secondary: Wallet | null;
  connection: WalletConnection | null;
};
