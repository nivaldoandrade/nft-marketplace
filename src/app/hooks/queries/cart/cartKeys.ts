import type { QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/app/libs/queryKeys';
import type { AuthService } from '@/app/services/AuthService';
import type { Network } from '@/app/types/Nft';

export function getCartKeys(userId: string | null | undefined) {
  return userId
    ? {
        cart: queryKeys.user(userId).cart(),
        quote: (network: Network) => queryKeys.user(userId).quote({ network }),
        quotes: queryKeys.user(userId).quotes(),
      }
    : {
        cart: queryKeys.guest.cart(),
        quote: (network: Network) => queryKeys.guest.quote({ network }),
        quotes: queryKeys.guest.quotes(),
      };
}

export function getCurrentCartKeys(queryClient: QueryClient) {
  const session = queryClient.getQueryData<AuthService.Session | null>(queryKeys.session());

  return getCartKeys(session?.user.id);
}
