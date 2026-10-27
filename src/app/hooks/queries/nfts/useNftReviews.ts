import { queryOptions, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/app/libs/queryKeys';
import { NftsService } from '@/app/services/NftsService';

export function nftReviewsQueryOptions(nftId: string) {
  return queryOptions({
    queryKey: queryKeys.nfts.reviews(nftId),
    queryFn: ({ signal }) => NftsService.getReviews(nftId, signal),
    staleTime: 5 * 60_000,
  });
}

export function useNftReviews(nftId: string, enabled: boolean) {
  const { data, isPending, isError, refetch } = useQuery({
    ...nftReviewsQueryOptions(nftId),
    enabled,
  });

  return {
    reviews: data?.items ?? [],
    isPending,
    isError,
    refetch,
  };
}
