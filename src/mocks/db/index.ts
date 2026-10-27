import type { MockDb } from '@/mocks/db/types';
import { createNftFixtures } from '@/mocks/fixtures/nfts';

export const db: MockDb = {
  nfts: Object.fromEntries(createNftFixtures().map((nft) => [nft.id, nft])),
};
