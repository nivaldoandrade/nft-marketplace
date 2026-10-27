import type { NftSummary } from '@/app/types/Nft';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { cn } from '@/ui/utils/cn';
import { formatPrice } from '@/ui/utils/formatPrice';

type NftCardProps = {
  nft: NftSummary;
  priority?: boolean;
  className?: string;
};

const mediaClassName =
  'relative flex aspect-[175/200] items-center justify-center rounded-[20px] bg-linear-to-br from-card to-secondary p-1 md:aspect-[258/300] md:rounded-none md:bg-card md:bg-none';

export function NftCard({ nft, priority = false, className }: NftCardProps) {
  return (
    <article className={cn('flex flex-col', className)}>
      <div className={mediaClassName}>
        {nft.isRare && (
          <span className="absolute top-4 left-0 z-10 flex h-8 w-[68px] items-center bg-primary pl-2 text-[13px] leading-4 font-medium text-primary-foreground md:hidden">
            RARO
          </span>
        )}
        <img
          src={nft.image}
          alt={`${nft.name}, coleção ${nft.collection.name}`}
          width={400}
          height={400}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          className="aspect-square w-full rounded-2xl object-cover md:rounded-[15px]"
        />
      </div>
      <div className="flex flex-col gap-1 px-2 pt-2 md:gap-3 md:px-0 md:pt-3">
        <h3 className="truncate text-[15px] leading-5 md:text-base md:leading-4">{nft.name}</h3>
        <p className="flex flex-wrap items-baseline gap-x-3 text-base leading-4 font-bold text-accent md:text-lg">
          <span>{formatPrice(nft.price)}</span>
          {nft.compareAtPrice && (
            <span className="font-normal text-subtle">
              <span className="sr-only">Preço anterior: </span>
              {formatPrice(nft.compareAtPrice)}
            </span>
          )}
        </p>
      </div>
    </article>
  );
}

export function NftCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col', className)}>
      <Skeleton className="aspect-[175/200] rounded-[20px] md:aspect-[258/300] md:rounded-none" />
      <div className="flex flex-col gap-1 px-2 pt-2 md:gap-3 md:px-0 md:pt-3">
        <Skeleton className="h-5 w-3/4 md:h-4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
