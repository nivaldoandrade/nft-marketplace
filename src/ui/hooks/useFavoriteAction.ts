import { useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { useToggleFavorite } from '@/app/hooks/mutations/favorites/useToggleFavorite';
import { favoritesQueryOptions, useFavorites } from '@/app/hooks/queries/favorites/useFavorites';
import { queryKeys } from '@/app/libs/queryKeys';
import { toast } from '@/app/libs/toast';
import { AuthMode } from '@/app/router/authSearch';
import type { AuthService } from '@/app/services/AuthService';
import type { NftSummary } from '@/app/types/Nft';
import { useAuthModal } from '@/ui/hooks/useAuthModal';

export function useFavoriteAction(nft: NftSummary | undefined) {
  const queryClient = useQueryClient();
  const { isSignedIn } = useAuth();
  const { favoriteIds } = useFavorites();
  const { toggleFavorite } = useToggleFavorite();
  const { open: openAuthModal } = useAuthModal();

  const isFavorite = !!nft && favoriteIds.has(nft.id);

  async function addAfterSignIn(target: NftSummary) {
    const userId = queryClient.getQueryData<AuthService.Session>(queryKeys.session())?.user.id;

    if (!userId) {
      return;
    }

    const favorites = await queryClient.query(favoritesQueryOptions(userId)).catch(() => null);

    if (favorites?.items.some((item) => item.id === target.id)) {
      toast.info('Este NFT já está na sua lista de interesse.');
      return;
    }

    toggleFavorite({ nft: target, isFavorite: false });
  }

  function handleToggleFavorite() {
    if (!nft) {
      return;
    }

    if (!isSignedIn) {
      openAuthModal(AuthMode.SIGN_IN, { afterSignIn: () => addAfterSignIn(nft) });
      return;
    }

    toggleFavorite({ nft, isFavorite });
  }

  return { isFavorite, handleToggleFavorite };
}
