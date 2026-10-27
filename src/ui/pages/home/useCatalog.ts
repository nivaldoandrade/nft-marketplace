import { useListNfts } from '@/app/hooks/queries/nfts/useListNfts';
import { useCatalogSearch } from '@/ui/pages/home/useCatalogSearch';

export function useCatalog() {
  const catalogSearch = useCatalogSearch();
  const list = useListNfts(catalogSearch.params);

  return {
    ...catalogSearch,
    ...list,
  };
}
