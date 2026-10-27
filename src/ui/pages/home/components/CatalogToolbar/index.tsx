import { NftTab } from '@/app/types/Nft';
import { FilterIcon } from '@/ui/components/Icons';
import { CatalogTab } from '@/ui/pages/home/components/CatalogToolbar/CatalogTab';
import { FiltersSheet } from '@/ui/pages/home/components/FiltersSheet';
import { SortSelect } from '@/ui/pages/home/components/SortSelect';
import { useCatalog } from '@/ui/pages/home/useCatalog';
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
          {Object.values(NftTab).map((tab, index) => (
            <CatalogTab
              key={tab}
              label={tabLabels[tab]}
              isActive={search.tab === tab}
              isFirst={index === 0}
              onSelect={() => setFilters({ tab })}
            />
          ))}
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
