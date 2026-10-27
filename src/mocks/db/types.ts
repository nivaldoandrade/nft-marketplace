import type { Nft, NftReview } from '@/app/types/Nft';

export type NftRecord = Nft & { createdAt: string; popularity: number; reviews: NftReview[] };

export type MockDb = {
  nfts: Record<string, NftRecord>;
};
