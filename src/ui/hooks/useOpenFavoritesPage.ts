import { useNavigate } from '@tanstack/react-router';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { AuthMode } from '@/app/router/authSearch';
import { useAuthModal } from '@/ui/hooks/useAuthModal';

const FAVORITES_PATH = '/perfil/lista-de-interesse';

export function useOpenFavoritesPage() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { open: openAuthModal } = useAuthModal();

  return function openFavoritesPage() {
    if (isSignedIn) {
      navigate({ to: FAVORITES_PATH });
      return;
    }

    openAuthModal(AuthMode.SIGN_IN, { redirect: FAVORITES_PATH });
  };
}
