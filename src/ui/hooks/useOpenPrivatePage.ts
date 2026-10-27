import { useNavigate } from '@tanstack/react-router';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { AuthMode } from '@/app/router/authSearch';
import { useAuthModal } from '@/ui/hooks/useAuthModal';

type PrivatePath = '/perfil/dados' | '/perfil/carteiras' | '/perfil/lista-de-interesse';

// signed-out collectors sign in first and are then taken to the page
export function useOpenPrivatePage() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { open: openAuthModal } = useAuthModal();

  return function openPrivatePage(path: PrivatePath) {
    if (isSignedIn) {
      navigate({ to: path });
      return;
    }

    openAuthModal(AuthMode.SIGN_IN, { redirect: path });
  };
}
