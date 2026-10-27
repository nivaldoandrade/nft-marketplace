import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ErrorCode, getApiErrorCode } from '@/app/errors/apiErrors';
import { queryKeys } from '@/app/libs/queryKeys';
import { toast } from '@/app/libs/toast';
import type { AuthService } from '@/app/services/AuthService';
import { FavoritesService } from '@/app/services/FavoritesService';
import type { NftSummary } from '@/app/types/Nft';

type ToggleFavoriteParams = {
  nft: NftSummary;
  isFavorite: boolean;
};

const MUTATION_KEY = ['favorites', 'toggle'];

const SESSION_ERRORS: (ErrorCode | undefined)[] = [
  ErrorCode.UNAUTHORIZED,
  ErrorCode.SESSION_EXPIRED,
];

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  const getFavoritesKey = () => {
    const userId = queryClient.getQueryData<AuthService.Session>(queryKeys.session())?.user.id;

    return queryKeys.user(userId ?? '').favorites();
  };

  const { mutate } = useMutation({
    mutationKey: MUTATION_KEY,
    scope: { id: 'favorites' },
    mutationFn: ({ nft, isFavorite }: ToggleFavoriteParams) =>
      isFavorite ? FavoritesService.remove(nft.id) : FavoritesService.add(nft.id),
    onMutate: async ({ nft, isFavorite }) => {
      const queryKey = getFavoritesKey();
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<FavoritesService.ListResponse>(queryKey);
      const items = (previous?.items ?? []).filter((item) => item.id !== nft.id);

      queryClient.setQueryData<FavoritesService.ListResponse>(queryKey, {
        items: isFavorite ? items : [nft, ...items],
      });

      return { queryKey, previous };
    },
    onSuccess: (_data, { isFavorite }) => {
      toast.success(
        isFavorite ? 'Removido da lista de interesse.' : 'Adicionado à lista de interesse.',
      );
    },
    onError: (error, { isFavorite }, context) => {
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }

      if (!SESSION_ERRORS.includes(getApiErrorCode(error))) {
        toast.error(
          isFavorite
            ? 'Não foi possível remover da lista de interesse. Tente novamente.'
            : 'Não foi possível adicionar à lista de interesse. Tente novamente.',
        );
      }
    },
    onSettled: (_data, _error, _variables, context) => {
      if (context && queryClient.isMutating({ mutationKey: MUTATION_KEY }) === 1) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });

  return { toggleFavorite: mutate };
}
