import { Network, NftCategory } from '@/app/types/Nft';
import { FacetList } from '@/ui/pages/home/components/CatalogFilters/FacetList';
import { PriceRangeFilter } from '@/ui/pages/home/components/CatalogFilters/PriceRangeFilter';
import { useCatalog } from '@/ui/pages/home/useCatalog';
import { cn } from '@/ui/utils/cn';
import { categoryLabels, networkLabels } from '@/ui/utils/labels';

type CatalogFiltersProps = {
  className?: string;
};

function toggle<T>(items: T[] | undefined, item: T) {
  const next = items?.includes(item)
    ? items.filter((current) => current !== item)
    : [...(items ?? []), item];

  return next.length ? next : undefined;
}

export function CatalogFilters({ className }: CatalogFiltersProps) {
  const { search, facets, isPending, hasActiveFilters, setFilters, clearFilters } = useCatalog();

  const categoryOptions = Object.values(NftCategory).map((id) => ({
    id,
    label: categoryLabels[id],
    count: facets?.categories.find((facet) => facet.id === id)?.count ?? 0,
  }));

  const networkOptions = Object.values(Network).map((id) => ({
    id,
    label: networkLabels[id],
    count: facets?.networks.find((facet) => facet.id === id)?.count ?? 0,
  }));

  return (
    <div className={cn('flex flex-col gap-10 bg-card p-5', className)}>
      <FacetList
        title="Coleções"
        options={categoryOptions}
        selected={search.category ?? []}
        isLoading={isPending}
        emphasizeCount
        onToggle={(id) => setFilters({ category: toggle(search.category, id) })}
      />
      <PriceRangeFilter range={facets?.priceRange} />
      <FacetList
        title="Rede"
        options={networkOptions}
        selected={search.network ?? []}
        isLoading={isPending}
        flushRight
        onToggle={(id) => setFilters({ network: toggle(search.network, id) })}
      />
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="w-fit text-sm font-bold text-accent underline-offset-4 hover:underline"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
