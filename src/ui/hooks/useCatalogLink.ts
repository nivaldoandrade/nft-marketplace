import { useRouterState } from '@tanstack/react-router';

import { CATALOG_SECTION_ID, scrollToCatalog } from '@/ui/utils/sections';

export function useCatalogLink() {
  const isHome = useRouterState({ select: (state) => state.location.pathname === '/' });

  if (!isHome) {
    return { hash: CATALOG_SECTION_ID };
  }

  return {
    hash: CATALOG_SECTION_ID,
    resetScroll: false,
    hashScrollIntoView: false,
    onClick: scrollToCatalog,
  };
}
