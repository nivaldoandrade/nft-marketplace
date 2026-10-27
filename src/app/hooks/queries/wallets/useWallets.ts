import { queryOptions, useQuery } from '@tanstack/react-query';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { queryKeys } from '@/app/libs/queryKeys';
import { WalletsService } from '@/app/services/WalletsService';
import type { Wallet } from '@/app/types/Wallet';

export function walletsQueryOptions(userId: string) {
  return queryOptions({
    queryKey: queryKeys.user(userId).wallets(),
    queryFn: ({ signal }) => WalletsService.list(signal),
  });
}

export function useWallets() {
  const { user } = useAuth();
  const { data, isPending, isError, refetch } = useQuery({
    ...walletsQueryOptions(user?.id ?? ''),
    enabled: !!user,
  });

  const wallets = [data?.primary, data?.secondary].filter((wallet): wallet is Wallet => !!wallet);
  const connection = data?.connection ?? null;

  return {
    wallets,
    primary: data?.primary ?? null,
    secondary: data?.secondary ?? null,
    connection,
    connectedWallet: wallets.find((wallet) => wallet.id === connection?.walletId) ?? null,
    isPending: !!user && isPending,
    isError,
    refetch,
  };
}
