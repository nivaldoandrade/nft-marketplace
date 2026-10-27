import type { NftsService } from '@/app/services/NftsService';
import type { OrdersService } from '@/app/services/OrdersService';

export const queryKeys = {
  session: () => ['session'] as const,

  nfts: {
    all: () => ['nfts'] as const,
    list: (params: NftsService.ListParams) => ['nfts', 'list', params] as const,
    featured: () => ['nfts', 'featured'] as const,
    detail: (nftId: string) => ['nfts', 'detail', nftId] as const,
    related: (nftId: string) => ['nfts', 'detail', nftId, 'related'] as const,
    reviews: (nftId: string) => ['nfts', 'detail', nftId, 'reviews'] as const,
  },

  guest: {
    cart: () => ['guest', 'cart'] as const,
    quotes: () => ['guest', 'quote'] as const,
    quote: (params: object) => ['guest', 'quote', params] as const,
  },

  user: (userId: string) => ({
    all: () => ['user', userId] as const,
    favorites: () => ['user', userId, 'favorites'] as const,
    cart: () => ['user', userId, 'cart'] as const,
    quotes: () => ['user', userId, 'quote'] as const,
    quote: (params: object) => ['user', userId, 'quote', params] as const,
    orders: {
      all: () => ['user', userId, 'orders'] as const,
      list: (params: OrdersService.ListParams) =>
        ['user', userId, 'orders', 'list', params] as const,
      detail: (orderId: string) => ['user', userId, 'orders', 'detail', orderId] as const,
    },
    profile: () => ['user', userId, 'profile'] as const,
    wallets: () => ['user', userId, 'wallets'] as const,
  }),
};
