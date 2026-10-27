import { Link } from '@tanstack/react-router';
import { Fragment } from 'react';

import { CATALOG_SECTION_ID } from '@/ui/utils/sections';

type BreadcrumbProps = {
  current?: string;
  className?: string;
};

export function Breadcrumb({ current, className }: BreadcrumbProps) {
  const items = [
    { label: 'Início', hash: undefined },
    { label: 'Mercado', hash: CATALOG_SECTION_ID },
  ];

  return (
    <nav aria-label="Trilha de navegação" className={className}>
      <ol className="flex gap-1.5 text-[15px] leading-4 font-bold">
        {items.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 && <li aria-hidden="true">/</li>}
            <li>
              <Link to="/" hash={item.hash} className="hover:text-accent">
                {item.label}
              </Link>
            </li>
          </Fragment>
        ))}
        {current && (
          <>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{current}</li>
          </>
        )}
      </ol>
    </nav>
  );
}
