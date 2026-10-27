import type { Nft, NftSummary } from '@/app/types/Nft';
import type { NftRecord } from '@/mocks/db/types';

export function toNftSummary(nft: NftRecord): NftSummary {
  return {
    id: nft.id,
    name: nft.name,
    image: nft.image,
    price: nft.price,
    compareAtPrice: nft.compareAtPrice,
    isRare: nft.isRare,
    category: nft.category,
    network: nft.network,
    collection: nft.collection,
  };
}

export function toNft(nft: NftRecord): Nft {
  const { createdAt: _createdAt, popularity: _popularity, reviews: _reviews, ...detail } = nft;

  return detail;
}
