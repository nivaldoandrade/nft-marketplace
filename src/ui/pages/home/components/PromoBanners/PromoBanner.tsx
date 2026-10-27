import { Link } from '@tanstack/react-router';

import type { NftCategory, NftSummary, NftTab } from '@/app/types/Nft';
import { ArrowRightIcon } from '@/ui/components/Icons';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { useCatalogLink } from '@/ui/hooks/useCatalogLink';
import { getLargeImage } from '@/ui/utils/image';

export type Promo = {
  title: string;
  description: string;
  search: { tab?: NftTab; category?: NftCategory[] };
};

type PromoBannerProps = {
  promo: Promo;
  nft: NftSummary | undefined;
  isPending: boolean;
};

export function PromoBanner({ promo, nft, isPending }: PromoBannerProps) {
  const catalogLink = useCatalogLink();

  return (
    <li className="relative isolate flex flex-col overflow-hidden rounded-lg bg-card sm:min-h-[250px] sm:flex-row xl:h-[250px]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[142px] left-[-191px] z-10 hidden size-64 rounded-full border-2 border-primary sm:block"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[134px] left-[-199px] z-10 hidden size-64 rounded-full border border-primary sm:block"
      />
      <div className="relative h-48 shrink-0 sm:h-auto sm:w-[45%] xl:w-[287px]">
        {isPending || !nft ? (
          <Skeleton className="size-full rounded-[18px] sm:absolute sm:inset-0" />
        ) : (
          <img
            src={getLargeImage(nft.image)}
            alt={`${nft.name}, coleção ${nft.collection.name}`}
            width={800}
            height={800}
            loading="lazy"
            decoding="async"
            className="size-full rounded-[18px] object-cover sm:absolute sm:inset-0"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col items-start p-6 sm:items-end sm:pt-[37px] sm:pr-[30px] sm:pl-2 sm:text-right">
        <h2 className="text-lg leading-6 font-bold whitespace-pre-line">{promo.title}</h2>
        <p className="mt-[9px] max-w-[263px] text-sm leading-6 text-muted-foreground">
          {promo.description}
        </p>
        <Link
          to="/"
          search={promo.search}
          {...catalogLink}
          className="mt-3 flex h-10 w-[140px] shrink-0 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground pressable hover:bg-accent sm:mt-0"
        >
          Explorar
          <ArrowRightIcon className="size-[18px]" />
        </Link>
      </div>
    </li>
  );
}
