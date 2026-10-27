import type { ValueOf } from '@/app/utils/ValueOf';

export const NftCategory = {
  DIGITAL_ART: 'digital-art',
  PHOTOGRAPHY: 'photography',
  MUSIC: 'music',
  ART_3D: '3d-art',
  COLLECTIBLES: 'collectibles',
  GENERATIVE: 'generative',
  GAMES: 'games',
  SUBSCRIPTIONS: 'subscriptions',
  UTILITY: 'utility',
} as const;

export type NftCategory = ValueOf<typeof NftCategory>;

export const Network = {
  ETHEREUM: 'ethereum',
  POLYGON: 'polygon',
  SOLANA: 'solana',
} as const;

export type Network = ValueOf<typeof Network>;

export const EditionType = {
  UNIQUE: '1/1',
  LIMITED_10: '1/10',
  LIMITED_50: '1/50',
  OPEN: 'open',
} as const;

export type EditionType = ValueOf<typeof EditionType>;

export const NftTab = {
  ALL: 'all',
  NEW: 'new',
  TRENDING: 'trending',
} as const;

export type NftTab = ValueOf<typeof NftTab>;

export const NftSort = {
  RECENT: 'recent',
  PRICE_ASC: 'price-asc',
  PRICE_DESC: 'price-desc',
  NAME: 'name',
} as const;

export type NftSort = ValueOf<typeof NftSort>;

export type NftCollection = {
  id: string;
  name: string;
};

export type NftSummary = {
  id: string;
  name: string;
  image: string;
  price: string;
  compareAtPrice: string | null;
  isRare: boolean;
  category: NftCategory;
  network: Network;
  collection: NftCollection;
};

export type NftEdition = {
  type: EditionType;
  available: number;
  maxPerOrder: number;
};

export type Nft = NftSummary & {
  tokenId: string;
  gallery: string[];
  description: string;
  details: string[];
  attributes: string[];
  rating: number;
  reviewsCount: number;
  contractAddress: string;
  royaltyPercent: number;
  editions: NftEdition[];
};

export type NftReview = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
};
