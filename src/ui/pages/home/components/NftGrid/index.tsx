import { getApiErrorCode, getErrorMessage } from '@/app/errors/apiErrors';
import { NftCard, NftCardSkeleton } from '@/ui/components/NftCard';
import { CATALOG_PER_PAGE } from '@/ui/pages/home/schema';
import { useCatalog } from '@/ui/pages/home/useCatalog';
import { cn } from '@/ui/utils/cn';

const gridClassName =
  'grid grid-cols-2 gap-x-4 gap-y-6 pb-8 max-md:[&>*:nth-child(even)]:translate-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-12 md:pb-0 xl:gap-x-[34px] xl:gap-y-[72px]';

// the first row on desktop and the first two rows on mobile are visible without scrolling
const PRIORITY_CARDS = 4;
export function NftGrid() {
  const {
    nfts,
    isPending,
    isError,
    error,
    isEmpty,
    isFetching,
    isPlaceholderData,
    hasActiveFilters,
    refetch,
    clearFilters,
  } = useCatalog();

  if (isPending) {
    return (
      <div className={gridClassName} aria-busy="true" aria-label="Carregando NFTs">
        {Array.from({ length: CATALOG_PER_PAGE }, (_, index) => (
          <NftCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError && !nfts.length) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-md border border-border bg-card px-6 py-16 text-center"
      >
        <h3 className="text-lg font-bold">Não foi possível carregar os NFTs</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          {getErrorMessage(getApiErrorCode(error))}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-10 rounded-md bg-primary px-6 font-bold text-primary-foreground pressable hover:bg-accent disabled:opacity-60"
        >
          {isFetching ? 'Tentando...' : 'Tentar novamente'}
        </button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-md border border-border bg-card px-6 py-16 text-center">
        <h3 className="text-lg font-bold">Nenhum NFT encontrado</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          {hasActiveFilters
            ? 'Nenhum resultado corresponde aos filtros selecionados. Ajuste a busca ou limpe os filtros.'
            : 'Ainda não há NFTs disponíveis nesta lista. Volte em breve.'}
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="h-10 rounded-md bg-primary px-6 font-bold text-primary-foreground pressable hover:bg-accent"
          >
            Limpar filtros
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {isError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-coral/50 bg-card px-4 py-3 text-sm"
        >
          <span>Não foi possível atualizar a lista. {getErrorMessage(getApiErrorCode(error))}</span>
          <button type="button" onClick={() => refetch()} className="font-bold text-accent">
            Tentar novamente
          </button>
        </div>
      )}
      <div
        aria-busy={isFetching && isPlaceholderData}
        className={cn(
          gridClassName,
          'transition-opacity',
          isFetching && isPlaceholderData && 'opacity-60',
        )}
      >
        {nfts.map((nft, index) => (
          <NftCard key={nft.id} nft={nft} priority={index < PRIORITY_CARDS} />
        ))}
      </div>
    </div>
  );
}
