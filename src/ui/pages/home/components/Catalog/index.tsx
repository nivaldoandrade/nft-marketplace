import { Container } from '@/ui/components/Container';
import { useOutOfRangePage } from '@/ui/pages/home/components/Catalog/useOutOfRangePage';
import { CatalogFilters } from '@/ui/pages/home/components/CatalogFilters';
import { CatalogPagination } from '@/ui/pages/home/components/CatalogPagination';
import { CatalogToolbar } from '@/ui/pages/home/components/CatalogToolbar';
import { NftGrid } from '@/ui/pages/home/components/NftGrid';
import { Spotlight } from '@/ui/pages/home/components/Spotlight';
import { CATALOG_SECTION_ID } from '@/ui/utils/sections';

export function Catalog() {
  useOutOfRangePage();

  return (
    <section
      id={CATALOG_SECTION_ID}
      aria-labelledby="catalog-title"
      className="mt-4 scroll-mt-6 md:mt-24 md:scroll-mt-24"
    >
      <h2 id="catalog-title" className="sr-only">
        Catálogo de NFTs
      </h2>
      <Container className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-10 xl:grid-cols-[310px_1fr] xl:gap-12">
        <div className="hidden flex-col gap-6 lg:flex">
          <CatalogFilters />
          <Spotlight />
        </div>

        <div className="flex flex-col gap-4 md:gap-[25px]">
          <CatalogToolbar />
          <NftGrid />
          <div className="md:mt-[63px]">
            <CatalogPagination />
          </div>
        </div>
      </Container>
    </section>
  );
}
