import { getRouteApi } from '@tanstack/react-router';

import { cn } from '@/ui/utils/cn';
import { scrollToCatalog } from '@/ui/utils/sections';

const route = getRouteApi('/');

type PageLinkProps = {
  page: number;
  label: string;
  isCurrent?: boolean;
  children: React.ReactNode;
};

export function PageLink({ page, label, isCurrent = false, children }: PageLinkProps) {
  return (
    <li>
      <route.Link
        to="."
        search={(previous) => ({ ...previous, page })}
        resetScroll={false}
        activeOptions={{ exact: true }}
        onClick={scrollToCatalog}
        aria-label={label}
        aria-current={isCurrent ? 'page' : undefined}
        className={cn(
          'flex size-[35px] items-center justify-center rounded border border-border text-[15px] transition-colors hover:border-primary hover:text-accent',
          isCurrent &&
            'border-primary bg-primary font-bold text-primary-foreground hover:text-primary-foreground',
        )}
      >
        {children}
      </route.Link>
    </li>
  );
}
