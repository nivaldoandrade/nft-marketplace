import { queryOptions, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/app/libs/queryKeys';
import { NftsService } from '@/app/services/NftsService';

export function relatedNftsQueryOptions(nftId: string) {
  return queryOptions({
    queryKey: queryKeys.nfts.related(nftId),
    queryFn: ({ signal }) => NftsService.getRelated(nftId, signal),
    staleTime: 5 * 60_000,
  });
}

export function useRelatedNfts(nftId: string) {
  const { data, isPending, isError, refetch } = useQuery(relatedNftsQueryOptions(nftId));

  return {
    related: data?.items ?? [],
    isPending,
    isError,
    refetch,
  };
}
