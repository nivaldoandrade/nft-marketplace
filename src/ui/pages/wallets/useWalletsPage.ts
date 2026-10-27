import { useState } from 'react';

import { getApiErrorCode, getApiErrorFields, getErrorMessage } from '@/app/errors/apiErrors';
import { useSaveWallet } from '@/app/hooks/mutations/wallets/useWalletMutations';
import { useWallets } from '@/app/hooks/queries/wallets/useWallets';
import { toast } from '@/app/libs/toast';
import { WalletSlot } from '@/app/types/Wallet';

export function useWalletsPage() {
  const { primary, secondary, isPending, isError, refetch } = useWallets();
  const { saveWallet, isSaving } = useSaveWallet();
  const [addingSlot, setAddingSlot] = useState<WalletSlot | null>(null);

  async function handleCopyPrimary() {
    try {
      await saveWallet({ slot: WalletSlot.SECONDARY, sameAsPrimary: true });
      toast.success('Carteira secundária igual à principal.');
      setAddingSlot(null);
    } catch (error) {
      toast.error(
        getApiErrorFields(error)?.sameAsPrimary ?? getErrorMessage(getApiErrorCode(error)),
      );
    }
  }

  return {
    primary,
    secondary,
    isPending,
    isError,
    refetch,
    isAddingPrimary: addingSlot === WalletSlot.PRIMARY,
    isAddingSecondary: addingSlot === WalletSlot.SECONDARY,
    isCopyingPrimary: isSaving,
    handleAdd: setAddingSlot,
    handleCancelAdd: () => setAddingSlot(null),
    handleCopyPrimary,
  };
}
