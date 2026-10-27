import {
  EditionType,
  Network,
  NftCategory,
  type NftCollection,
  type NftEdition,
  type NftReview,
} from '@/app/types/Nft';
import type { NftRecord } from '@/mocks/db/types';
import { createRandom, hashSeed, pick, randomHex, randomInt } from '@/mocks/utils/random';

type Artwork = 'emerald-ape' | 'sage-nomad' | 'ivory-baron' | 'golden-beat';

const collections: Record<Artwork, NftCollection> = {
  'emerald-ape': { id: 'kurio-apes', name: 'Kurio Apes' },
  'sage-nomad': { id: 'nomad-society', name: 'Nomad Society' },
  'ivory-baron': { id: 'ivory-club', name: 'Ivory Club' },
  'golden-beat': { id: 'golden-frequencies', name: 'Golden Frequencies' },
};

const creators: Record<Artwork, string> = {
  'emerald-ape': 'Nova Sato',
  'sage-nomad': 'Iris Valença',
  'ivory-baron': 'Theo Marlow',
  'golden-beat': 'Lia Okafor',
};

const attributesByArtwork: Record<Artwork, string[]> = {
  'emerald-ape': ['Óculos', 'Esmeralda'],
  'sage-nomad': ['Chapéu bucket', 'Moletom'],
  'ivory-baron': ['Blazer', 'Gola alta'],
  'golden-beat': ['Headphone', 'Pelagem dourada'],
};

const networkNames: Record<Network, string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  solana: 'Solana',
};

const reviewAuthors = [
  'Ana Ribeiro',
  'Bruno Tanaka',
  'Carla Mendes',
  'Diego Alves',
  'Elisa Moura',
  'Felipe Costa',
  'Gabriela Rocha',
  'Henrique Lima',
  'Isabela Nunes',
  'João Pereira',
  'Larissa Duarte',
  'Mateus Farias',
];

const reviewComments = [
  'A arte em alta resolução é impressionante, cada detalhe aparece na tela.',
  'Entrega imediata na carteira e metadados bem organizados.',
  'Uma das peças mais bonitas da coleção. Valeu cada ETH.',
  'Ótima procedência e contrato verificado, comprei sem receio.',
  'Os lançamentos exclusivos para colecionadores fazem a diferença.',
  'Paleta de cores incrível, combina com o resto da minha coleção.',
  'Processo de compra simples e transparente.',
  'Gostei muito dos atributos, deixam a obra única.',
];

type FeaturedSeed = {
  name: string;
  artwork: Artwork;
  price: string;
  compareAtPrice?: string;
  isRare?: boolean;
  category: NftCategory;
  network: Network;
  editions?: Partial<Record<EditionType, number>>;
  rating?: number;
  reviewsCount?: number;
  contractAddress?: string;
};

const featuredSeeds: FeaturedSeed[] = [
  {
    name: 'Emerald Ape #042',
    artwork: 'emerald-ape',
    price: '1.19',
    category: NftCategory.DIGITAL_ART,
    network: Network.ETHEREUM,
    editions: { '1/1': 0, '1/10': 3, '1/50': 12 },
    rating: 4.8,
    reviewsCount: 19,
    contractAddress: '0x7A42C1D9E4B8F02A6C35D7E1B940A8F3C26D19E8',
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
    editions: { '1/1': 0, '1/10': 0, '1/50': 0 },
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

function buildEditions(
  random: () => number,
  overrides: Partial<Record<EditionType, number>> = {},
): NftEdition[] {
  const defaults: Record<EditionType, number> = {
    '1/1': random() > 0.5 ? 1 : 0,
    '1/10': randomInt(random, 0, 10),
    '1/50': randomInt(random, 5, 50),
    open: 999,
  };

  return Object.values(EditionType).map((type) => ({
    type,
    available: overrides[type] ?? defaults[type],
    maxPerOrder: 10,
  }));
}

function buildReviews(nftId: string, random: () => number, count: number, target: number) {
  const fiveStars = Math.round((target - 4) * count);

  return Array.from({ length: count }, (_, index): NftReview => {
    const daysAgo = randomInt(random, 1, 180);

    return {
      id: `${nftId}-review-${index + 1}`,
      author: pick(random, reviewAuthors),
      rating: index < fiveStars ? 5 : 4,
      comment: pick(random, reviewComments),
      createdAt: new Date(BASE_DATE - daysAgo * DAY_MS).toISOString(),
    };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function buildDetails(id: string, seed: FeaturedSeed) {
  const random = createRandom(hashSeed(id));
  const collection = collections[seed.artwork];
  const network = networkNames[seed.network];
  const royaltyPercent = 5;
  const reviews = buildReviews(
    id,
    random,
    seed.reviewsCount ?? randomInt(random, 3, 24),
    seed.rating ?? randomInt(random, 40, 50) / 10,
  );
  const rating = reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;

  return {
    tokenId: `#${(seed.name.split('#')[1] ?? '0').padStart(4, '0')}`,
    gallery: Array.from({ length: 4 }, () => imageUrl(seed.artwork)),
    description: `Um colecionável digital finalizado à mão da coleção ${collection.name}, verificado na ${network}, com arte desbloqueável e acesso para colecionadores.`,
    details: [
      `${seed.name} é uma obra digital finalizada à mão da coleção ${collection.name}. Cada atributo fica armazenado nos metadados do token e verificado na ${network}. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.`,
      `A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrado na rede. ${creators[seed.artwork]} recebe ${royaltyPercent}% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.`,
    ],
    attributes: [...attributesByArtwork[seed.artwork], seed.isRare ? 'Raro' : 'Comum'],
    rating: Math.round(rating * 10) / 10,
    reviewsCount: reviews.length,
    reviews,
    contractAddress: seed.contractAddress ?? `0x${randomHex(random, 40).toUpperCase()}`,
    royaltyPercent,
    editions: buildEditions(random, seed.editions),
  };
}

function buildNft(seed: FeaturedSeed, index: number, random: () => number): NftRecord {
  const id = slugify(seed.name);

  return {
    id,
    name: seed.name,
    image: imageUrl(seed.artwork),
    price: seed.price,
    compareAtPrice: seed.compareAtPrice ?? null,
    isRare: seed.isRare ?? false,
    category: seed.category,
    network: seed.network,
    collection: collections[seed.artwork],
    version: 1,
    createdAt: new Date(BASE_DATE - index * DAY_MS).toISOString(),
    popularity: randomInt(random, 0, 1000),
    ...buildDetails(id, seed),
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
