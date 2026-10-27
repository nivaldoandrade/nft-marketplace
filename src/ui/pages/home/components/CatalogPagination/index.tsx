import { getRouteApi } from '@tanstack/react-router';

import { ChevronRightIcon } from '@/ui/components/Icons';
import { useCatalog } from '@/ui/pages/home/useCatalog';
import { cn } from '@/ui/utils/cn';
import { scrollToCatalog } from '@/ui/utils/sections';

const route = getRouteApi('/');

const VISIBLE_PAGES = 4;

const itemClassName =
  'flex size-[35px] items-center justify-center rounded border border-border text-[15px] transition-colors hover:border-primary hover:text-accent';

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
          <li>
            <route.Link
              to="."
              search={(previous) => ({ ...previous, page: page - 1 })}
              resetScroll={false}
              onClick={scrollToCatalog}
              aria-label="Página anterior"
              className={itemClassName}
            >
              <ChevronRightIcon className="size-[18px] rotate-180" />
            </route.Link>
          </li>
        )}
        {getVisiblePages(page, totalPages).map((pageNumber) => {
          const isCurrent = pageNumber === page;

          return (
            <li key={pageNumber}>
              <route.Link
                to="."
                search={(previous) => ({ ...previous, page: pageNumber })}
                resetScroll={false}
                onClick={scrollToCatalog}
                aria-label={`Página ${pageNumber}`}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  itemClassName,
                  isCurrent &&
                    'border-primary bg-primary font-bold text-primary-foreground hover:text-primary-foreground',
                )}
              >
                {pageNumber}
              </route.Link>
            </li>
          );
        })}
        {page < totalPages && (
          <li>
            <route.Link
              to="."
              search={(previous) => ({ ...previous, page: page + 1 })}
              resetScroll={false}
              onClick={scrollToCatalog}
              aria-label="Próxima página"
              className={itemClassName}
            >
              <ChevronRightIcon className="size-[18px]" />
            </route.Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
