export const CATALOG_SECTION_ID = 'catalogo';
export const SEARCH_INPUT_ID = 'catalog-search';

export function scrollToCatalog() {
  document.getElementById(CATALOG_SECTION_ID)?.scrollIntoView({ block: 'start' });
}
