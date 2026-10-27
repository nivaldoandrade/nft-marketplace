import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { queryKeys } from '@/app/libs/queryKeys';
import { WalletsService } from '@/app/services/WalletsService';
import type { Wallets } from '@/app/types/Wallet';

function useSetWallets() {
  const queryClient = useQueryClient();
  const userId = useAuth().user?.id ?? '';

  return (wallets: Wallets) => queryClient.setQueryData(queryKeys.user(userId).wallets(), wallets);
}

export function useConnectWallet() {
  const setWallets = useSetWallets();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: WalletsService.connect.bind(WalletsService),
    onSuccess: setWallets,
  });

  return { connectWallet: mutateAsync, isConnecting: isPending };
}

export function useSaveWallet() {
  const setWallets = useSetWallets();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: WalletsService.save.bind(WalletsService),
    onSuccess: setWallets,
  });

  return { saveWallet: mutateAsync, isSaving: isPending };
}

export function useDisconnectWallet() {
  const setWallets = useSetWallets();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => WalletsService.disconnect(),
    onSuccess: setWallets,
  });

  return { disconnectWallet: mutateAsync, isDisconnecting: isPending };
}
