import { queryOptions, useQuery } from '@tanstack/react-query';

import { ErrorCode, getApiErrorCode } from '@/app/errors/apiErrors';
import { queryKeys } from '@/app/libs/queryKeys';
import { NftsService } from '@/app/services/NftsService';

export function nftQueryOptions(nftId: string) {
  return queryOptions({
    queryKey: queryKeys.nfts.detail(nftId),
    queryFn: ({ signal }) => NftsService.getById(nftId, signal),
  });
}

export function useGetNftById(nftId: string) {
  const { data, isPending, isError, error, refetch } = useQuery(nftQueryOptions(nftId));

  return {
    nft: data,
    isPending,
    isError,
    isNotFound: getApiErrorCode(error) === ErrorCode.RESOURCE_NOT_FOUND,
    refetch,
  };
}
