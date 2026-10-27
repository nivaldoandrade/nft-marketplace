import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/app/libs/queryKeys';
import { AuthService } from '@/app/services/AuthService';

export function useSession() {
  const { data, isFetched, refetch } = useQuery({
    queryKey: queryKeys.session(),
    queryFn: ({ signal }) => AuthService.getSession(signal),
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return {
    user: data?.user ?? null,
    expiresAt: data?.expiresAt ?? null,
    isFetched,
    loadSession: refetch,
  };
}
