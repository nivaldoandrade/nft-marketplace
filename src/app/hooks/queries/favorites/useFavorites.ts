import { queryOptions, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { queryKeys } from '@/app/libs/queryKeys';
import { FavoritesService } from '@/app/services/FavoritesService';

export function favoritesQueryOptions(userId: string) {
  return queryOptions({
    queryKey: queryKeys.user(userId).favorites(),
    queryFn: ({ signal }) => FavoritesService.list(signal),
  });
}

export function useFavorites() {
  const { user } = useAuth();
  const { data, isPending, isError, refetch } = useQuery({
    ...favoritesQueryOptions(user?.id ?? ''),
    enabled: !!user,
  });

  const favoriteIds = useMemo(() => new Set(data?.items.map((nft) => nft.id)), [data]);

  return {
    favorites: data?.items ?? [],
    favoriteIds,
    isPending: !!user && isPending,
    isError,
    refetch,
  };
}
