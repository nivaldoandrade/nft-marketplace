import type { NftSummary } from '@/app/types/Nft';
import { useFavoriteAction } from '@/ui/hooks/useFavoriteAction';

type FavoriteRemoveButtonProps = {
  nft: NftSummary;
};

export function FavoriteRemoveButton({ nft }: FavoriteRemoveButtonProps) {
  const { handleToggleFavorite } = useFavoriteAction(nft);

  return (
    <button
      type="button"
      onClick={handleToggleFavorite}
      aria-label={`Remover ${nft.name} da lista de interesse`}
      className="self-start px-2 text-sm text-accent underline-offset-4 hover:underline md:px-0"
    >
      Remover da lista
    </button>
  );
}
