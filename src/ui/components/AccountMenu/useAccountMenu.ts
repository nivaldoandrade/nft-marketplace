import { useNavigate, useRouterState } from '@tanstack/react-router';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { toast } from '@/app/libs/toast';
import { notifyUnavailable } from '@/ui/utils/notifyUnavailable';

export function useAccountMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isPrivatePage = useRouterState({
    select: (state) => state.location.pathname.startsWith('/perfil'),
  });

  async function handleSignOut() {
    if (isPrivatePage) {
      await navigate({ to: '/' });
    }

    await signOut();
    toast.success('Você saiu da sua conta.');
  }

  return {
    user,
    handleSignOut,
    handleUnavailable: notifyUnavailable,
  };
}
