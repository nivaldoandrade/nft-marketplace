import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { getCartKeys } from '@/app/hooks/queries/cart/cartKeys';
import { CartService } from '@/app/services/CartService';
import { Network } from '@/app/types/Nft';

export function useCartQuote({
  enabled,
  network = Network.ETHEREUM,
}: {
  enabled: boolean;
  network?: Network;
}) {
  const { user } = useAuth();
  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: getCartKeys(user?.id).quote(network),
    queryFn: ({ signal }) => CartService.getQuote(network, signal),
    placeholderData: keepPreviousData,
    enabled,
  });

  return { quote: data, isPending: enabled && isPending, isFetching, isError, refetch };
}
