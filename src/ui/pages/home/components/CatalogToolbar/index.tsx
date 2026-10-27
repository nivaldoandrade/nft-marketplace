import { NftTab } from '@/app/types/Nft';
import { FilterIcon } from '@/ui/components/Icons';
import { FiltersSheet } from '@/ui/pages/home/components/FiltersSheet';
import { SortSelect } from '@/ui/pages/home/components/SortSelect';
import { useCatalog } from '@/ui/pages/home/useCatalog';
import { cn } from '@/ui/utils/cn';
import { tabLabels } from '@/ui/utils/labels';

export function CatalogToolbar() {
  const { search, total, isPending, isFetching, isPlaceholderData, isError, setFilters } =
    useCatalog();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-3">
        <div
          role="group"
          aria-label="Listas de NFTs"
          className="flex max-w-full [scrollbar-width:none] gap-4 overflow-x-auto md:gap-5"
        >
          {Object.values(NftTab).map((tab, index) => {
            const isActive = search.tab === tab;

            return (
              <button
                key={tab}
                type="button"
                aria-pressed={isActive}
                onClick={() => setFilters({ tab })}
                className={cn(
                  'relative shrink-0 pb-1 text-sm leading-4 text-foreground transition-colors hover:text-accent md:pb-1.5 md:text-[15px] md:font-medium',
                  index === 0 && 'max-md:-mr-3',
                  isActive &&
                    'font-bold text-accent after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary md:font-medium md:after:w-[86%]',
                )}
              >
                {tabLabels[tab]}
              </button>
            );
          })}
        </div>

        <SortSelect id="catalog-sort" className="hidden md:flex" />
      </div>

      <p aria-live="polite" className="sr-only">
        {isPending
          ? 'Carregando NFTs...'
          : !isError && `${total} ${total === 1 ? 'NFT encontrado' : 'NFTs encontrados'}`}
        {isFetching && isPlaceholderData && <span> · Atualizando...</span>}
      </p>

      <div className="hidden justify-end md:flex lg:hidden">
        <FiltersSheet>
          <button
            type="button"
            className="flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:border-primary"
          >
            <FilterIcon className="size-4" />
            Filtros
          </button>
        </FiltersSheet>
      </div>
    </div>
  );
}
