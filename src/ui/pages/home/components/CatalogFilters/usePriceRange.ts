import { useMemo, useState } from 'react';

import type { NftsService } from '@/app/services/NftsService';
import { useCatalogSearch } from '@/ui/pages/home/useCatalogSearch';

type PriceRange = NftsService.ListResponse['facets']['priceRange'];

function toBounds(range: PriceRange | undefined): [number, number] {
  return range ? [Number(range.min), Number(range.max)] : [0, 0];
}

export function usePriceRange(range: PriceRange | undefined) {
  const { search, setFilters } = useCatalogSearch();
  const bounds = useMemo(() => toBounds(range), [range]);

  const selectedRange = useMemo<[number, number]>(
    () => [
      search.minPrice ? Number(search.minPrice) : bounds[0],
      search.maxPrice ? Number(search.maxPrice) : bounds[1],
    ],
    [bounds, search.maxPrice, search.minPrice],
  );

  const [value, setValue] = useState(selectedRange);
  const [previousRange, setPreviousRange] = useState(selectedRange);

  if (previousRange !== selectedRange) {
    setPreviousRange(selectedRange);
    setValue(selectedRange);
  }

  function handleApply() {
    const [min, max] = value;

    setFilters({
      minPrice: min > bounds[0] ? min.toFixed(2) : undefined,
      maxPrice: max < bounds[1] ? max.toFixed(2) : undefined,
    });
  }

  return {
    bounds,
    value,
    setValue,
    handleApply,
  };
}
