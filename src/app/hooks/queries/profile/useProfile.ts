import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { queryKeys } from '@/app/libs/queryKeys';
import { ProfileService } from '@/app/services/ProfileService';

export function useProfile() {
  const userId = useAuth().user?.id ?? '';
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.user(userId).profile(),
    queryFn: ({ signal }) => ProfileService.get(signal),
    enabled: !!userId,
  });

  return { profile: data, isPending, isError, refetch };
}
