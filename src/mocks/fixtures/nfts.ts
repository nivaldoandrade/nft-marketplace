import { Network, NftCategory, type NftCollection } from '@/app/types/Nft';
import type { NftRecord } from '@/mocks/db/types';
import { createRandom, pick, randomInt } from '@/mocks/utils/random';

type Artwork = 'emerald-ape' | 'sage-nomad' | 'ivory-baron' | 'golden-beat';

const collections: Record<Artwork, NftCollection> = {
  'emerald-ape': { id: 'kurio-apes', name: 'Kurio Apes' },
  'sage-nomad': { id: 'nomad-society', name: 'Nomad Society' },
  'ivory-baron': { id: 'ivory-club', name: 'Ivory Club' },
  'golden-beat': { id: 'golden-frequencies', name: 'Golden Frequencies' },
};

type FeaturedSeed = {
  name: string;
  artwork: Artwork;
  price: string;
  compareAtPrice?: string;
  isRare?: boolean;
  category: NftCategory;
  network: Network;
};

const featuredSeeds: FeaturedSeed[] = [
  {
    name: 'Emerald Ape #042',
    artwork: 'emerald-ape',
    price: '1.19',
    category: NftCategory.DIGITAL_ART,
    network: Network.ETHEREUM,
  },
  {
    name: 'Sage Nomad #009',
    artwork: 'sage-nomad',
    price: '1.69',
    category: NftCategory.DIGITAL_ART,
    network: Network.ETHEREUM,
  },
  {
    name: 'Neon Vessel #552',
    artwork: 'ivory-baron',
    price: '1.99',
    compareAtPrice: '2.29',
    isRare: true,
    category: NftCategory.COLLECTIBLES,
    network: Network.ETHEREUM,
  },
  {
    name: 'Cosmic Bloom #118',
    artwork: 'sage-nomad',
    price: '1.29',
    category: NftCategory.GENERATIVE,
    network: Network.POLYGON,
  },
  {
    name: 'Violet Nomad #314',
    artwork: 'sage-nomad',
    price: '1.39',
    category: NftCategory.DIGITAL_ART,
    network: Network.POLYGON,
  },
  {
    name: 'Ivory Baron #088',
    artwork: 'ivory-baron',
    price: '1.79',
    category: NftCategory.ART_3D,
    network: Network.ETHEREUM,
  },
  {
    name: 'Golden Beat #207',
    artwork: 'golden-beat',
    price: '0.99',
    category: NftCategory.MUSIC,
    network: Network.SOLANA,
  },
  {
    name: 'Golden Frequency #071',
    artwork: 'sage-nomad',
    price: '0.59',
    category: NftCategory.MUSIC,
    network: Network.SOLANA,
  },
  {
    name: 'Golden Signal #160',
    artwork: 'golden-beat',
    price: '0.39',
    category: NftCategory.MUSIC,
    network: Network.POLYGON,
  },
];

const prefixes = [
  'Amber',
  'Copper',
  'Crimson',
  'Dusk',
  'Echo',
  'Ember',
  'Jade',
  'Lunar',
  'Mint',
  'Onyx',
  'Rust',
  'Saffron',
  'Solar',
  'Velvet',
  'Wild',
];

const suffixes: Record<Artwork, string[]> = {
  'emerald-ape': ['Ape', 'Captain', 'Rebel'],
  'sage-nomad': ['Nomad', 'Bloom', 'Drifter'],
  'ivory-baron': ['Baron', 'Vessel', 'Count'],
  'golden-beat': ['Beat', 'Signal', 'Frequency'],
};

const artworks = Object.keys(collections) as Artwork[];
const categories = Object.values(NftCategory);
const networks = Object.values(Network);

const TOTAL_NFTS = 120;
const BASE_DATE = Date.UTC(2026, 9, 20);
const DAY_MS = 24 * 60 * 60 * 1000;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/#/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function imageUrl(artwork: Artwork) {
  return `/images/nfts/${artwork}-400.webp`;
}

function buildNft(seed: FeaturedSeed, index: number, random: () => number): NftRecord {
  return {
    id: slugify(seed.name),
    name: seed.name,
    image: imageUrl(seed.artwork),
    price: seed.price,
    compareAtPrice: seed.compareAtPrice ?? null,
    isRare: seed.isRare ?? false,
    category: seed.category,
    network: seed.network,
    collection: collections[seed.artwork],
    createdAt: new Date(BASE_DATE - index * DAY_MS).toISOString(),
    popularity: randomInt(random, 0, 1000),
  };
}

export function createNftFixtures() {
  const random = createRandom(42);
  const nfts = featuredSeeds.map((seed, index) => buildNft(seed, index, random));
  const usedNames = new Set(nfts.map((nft) => nft.name));

  while (nfts.length < TOTAL_NFTS) {
    const artwork = pick(random, artworks);
    const name = `${pick(random, prefixes)} ${pick(random, suffixes[artwork])} #${String(
      randomInt(random, 1, 999),
    ).padStart(3, '0')}`;

    if (usedNames.has(name)) {
      continue;
    }

    usedNames.add(name);

    const price = (randomInt(random, 5, 1230) / 100).toFixed(2);
    const hasDiscount = random() > 0.85;

    nfts.push(
      buildNft(
        {
          name,
          artwork,
          price,
          compareAtPrice: hasDiscount ? (Number(price) * 1.15).toFixed(2) : undefined,
          isRare: random() > 0.88,
          category: pick(random, categories),
          network: pick(random, networks),
        },
        nfts.length,
        random,
      ),
    );
  }

  return nfts;
}

export const FEATURED_NFT_IDS = {
  hero: ['emerald-ape-042', 'sage-nomad-009', 'golden-beat-207'],
  spotlight: 'sage-nomad-009',
  promos: ['emerald-ape-042', 'ivory-baron-088'],
};
