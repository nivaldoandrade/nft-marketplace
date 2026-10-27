import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useSaveWallet } from '@/app/hooks/mutations/wallets/useWalletMutations';
import { toast } from '@/app/libs/toast';
import type { User } from '@/app/types/User';
import type { Wallet, WalletSlot } from '@/app/types/Wallet';
import { walletSchema, type WalletSchema } from '@/ui/pages/wallets/schema';
import { applyApiErrors } from '@/ui/utils/applyApiErrors';

type UseWalletFormParams = {
  slot: WalletSlot;
  wallet: Wallet | null;
  user: User;
  onSaved: () => void;
};

function toFormValues(wallet: Wallet | null, user: User) {
  return {
    displayName: wallet?.displayName ?? user.displayName,
    nickname: wallet?.nickname ?? '',
    network: wallet?.network,
    profileName: wallet?.profileName ?? user.username,
    address: wallet?.address ?? '',
    secondaryAddress: wallet?.secondaryAddress ?? '',
    provider: wallet?.provider,
    referralCode: wallet?.referralCode ?? '',
    email: wallet?.email ?? user.email,
    ensName: wallet?.ensName ?? '',
  } as WalletSchema;
}

export function useWalletForm({ slot, wallet, user, onSaved }: UseWalletFormParams) {
  const { saveWallet } = useSaveWallet();

  const form = useForm<WalletSchema>({
    resolver: zodResolver(walletSchema),
    defaultValues: toFormValues(wallet, user),
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const saved = await saveWallet({ slot, ...values });
      form.reset(toFormValues(saved[slot], user));
      toast.success(wallet ? 'Carteira atualizada.' : 'Carteira adicionada.');
      onSaved();
    } catch (error) {
      applyApiErrors(form, error);
    }
  });

  return {
    register: form.register,
    control: form.control,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit,
  };
}
