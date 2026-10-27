import { ChevronRightIcon } from '@/ui/components/Icons';
import { PageLink } from '@/ui/pages/home/components/CatalogPagination/PageLink';
import { useCatalog } from '@/ui/pages/home/useCatalog';

const VISIBLE_PAGES = 4;

function getVisiblePages(page: number, totalPages: number) {
  const start = Math.max(1, Math.min(page - 1, totalPages - VISIBLE_PAGES + 1));
  const end = Math.min(totalPages, start + VISIBLE_PAGES - 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function CatalogPagination() {
  const { search, totalPages, isPending, isError } = useCatalog();
  const page = search.page;

  if (isPending || isError || totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="Paginação do catálogo" className="flex justify-end">
      <ul className="flex gap-2">
        {page > 1 && (
          <PageLink page={page - 1} label="Página anterior">
            <ChevronRightIcon className="size-[18px] rotate-180" />
          </PageLink>
        )}
        {getVisiblePages(page, totalPages).map((pageNumber) => (
          <PageLink
            key={pageNumber}
            page={pageNumber}
            label={`Página ${pageNumber}`}
            isCurrent={pageNumber === page}
          >
            {pageNumber}
          </PageLink>
        ))}
        {page < totalPages && (
          <PageLink page={page + 1} label="Próxima página">
            <ChevronRightIcon className="size-[18px]" />
          </PageLink>
        )}
      </ul>
    </nav>
  );
}
