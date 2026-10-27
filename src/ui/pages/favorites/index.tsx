import { Link } from '@tanstack/react-router';

import { useFavorites } from '@/app/hooks/queries/favorites/useFavorites';
import { NftCard, NftCardSkeleton } from '@/ui/components/NftCard';
import { FavoriteRemoveButton } from '@/ui/pages/favorites/components/FavoriteRemoveButton';
import { CATALOG_SECTION_ID } from '@/ui/utils/sections';

const gridClassName = 'grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-x-7 md:gap-y-8';

export function Favorites() {
  const { favorites, isPending, isError, refetch } = useFavorites();

  return (
    <section aria-labelledby="favorites-title" className="flex flex-col gap-6 md:gap-8">
      <div className="flex items-baseline justify-between gap-4">
        <h1 id="favorites-title" className="text-xl leading-4 font-bold md:text-base">
          Lista de interesse
        </h1>
        {!isPending && !isError && (
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {favorites.length === 1 ? '1 NFT' : `${favorites.length} NFTs`}
          </p>
        )}
      </div>

      {isError ? (
        <div role="alert" className="flex flex-col items-start gap-3">
          <p className="text-muted-foreground">Não foi possível carregar a lista de interesse.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="h-10 rounded-md bg-primary px-5 font-bold text-primary-foreground pressable hover:bg-accent"
          >
            Tentar novamente
          </button>
        </div>
      ) : isPending ? (
        <ul aria-busy="true" aria-label="Carregando lista de interesse" className={gridClassName}>
          {Array.from({ length: 3 }, (_, index) => (
            <li key={index}>
              <NftCardSkeleton />
            </li>
          ))}
        </ul>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-md bg-card px-6 py-12 text-center">
          <h2 className="text-lg font-bold">Sua lista de interesse está vazia</h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Favorite NFTs no catálogo ou na página de detalhe para acompanhá-los aqui.
          </p>
          <Link
            to="/"
            hash={CATALOG_SECTION_ID}
            className="mt-2 rounded-md bg-primary px-6 py-2.5 font-bold text-primary-foreground pressable hover:bg-accent"
          >
            Explorar o catálogo
          </Link>
        </div>
      ) : (
        <ul className={gridClassName}>
          {favorites.map((nft) => (
            <li key={nft.id} className="flex flex-col gap-3">
              <NftCard nft={nft} compact />
              <FavoriteRemoveButton nft={nft} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
