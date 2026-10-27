import type { NftSummary } from '@/app/types/Nft';

export type NftRecord = NftSummary & { createdAt: string; popularity: number };

export type MockDb = {
  nfts: Record<string, NftRecord>;
};
