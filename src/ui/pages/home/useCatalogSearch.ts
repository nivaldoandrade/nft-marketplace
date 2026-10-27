import { getRouteApi } from '@tanstack/react-router';
import { useCallback } from 'react';

import { type CatalogSearch, toListParams } from '@/ui/pages/home/schema';

const route = getRouteApi('/');

type FilterChanges = Partial<Omit<CatalogSearch, 'page'>>;

export function useCatalogSearch() {
  const search = route.useSearch();
  const navigate = route.useNavigate();

  const setFilters = useCallback(
    (changes: FilterChanges) => {
      navigate({
        search: (previous) => ({ ...previous, ...changes, page: 1 }),
        resetScroll: false,
      });
    },
    [navigate],
  );

  const clearFilters = useCallback(() => {
    navigate({
      search: (previous) => ({ tab: previous.tab, sort: previous.sort, page: 1 }),
      resetScroll: false,
    });
  }, [navigate]);

  const hasActiveFilters = Boolean(
    search.q ||
    search.category?.length ||
    search.network?.length ||
    search.minPrice ||
    search.maxPrice,
  );

  return {
    search,
    params: toListParams(search),
    hasActiveFilters,
    setFilters,
    clearFilters,
  };
}
