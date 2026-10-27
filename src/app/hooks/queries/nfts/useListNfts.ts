import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/app/libs/queryKeys';
import { NftsService } from '@/app/services/NftsService';

export function listNftsQueryOptions(params: NftsService.ListParams) {
  return queryOptions({
    queryKey: queryKeys.nfts.list(params),
    queryFn: ({ signal }) => NftsService.list(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useListNfts(params: NftsService.ListParams) {
  const { data, isPending, isFetching, isPlaceholderData, isError, error, refetch } = useQuery(
    listNftsQueryOptions(params),
  );

  return {
    nfts: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    facets: data?.facets,
    isPending,
    isFetching,
    isPlaceholderData,
    isEmpty: !isPending && !isError && data?.items.length === 0,
    isError,
    error,
    refetch,
  };
}
