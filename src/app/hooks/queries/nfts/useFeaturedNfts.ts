import { queryOptions, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/app/libs/queryKeys';
import { NftsService } from '@/app/services/NftsService';

export function featuredNftsQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.nfts.featured(),
    queryFn: ({ signal }) => NftsService.getFeatured(signal),
    staleTime: 5 * 60_000,
  });
}

export function useFeaturedNfts() {
  const { data, isPending, isError, refetch } = useQuery(featuredNftsQueryOptions());

  return {
    hero: data?.hero ?? [],
    spotlight: data?.spotlight ?? null,
    promos: data?.promos ?? [],
    isPending,
    isError,
    refetch,
  };
}
