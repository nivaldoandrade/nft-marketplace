import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { toast } from '@/app/libs/toast';
import { notifyUnavailable } from '@/ui/utils/notifyUnavailable';

export function useAccountMenu() {
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    toast.success('Você saiu da sua conta.');
  }

  return {
    user,
    handleSignOut,
    handleUnavailable: notifyUnavailable,
  };
}
