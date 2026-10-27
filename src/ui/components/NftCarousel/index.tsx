import type { NftSummary } from '@/app/types/Nft';
import { NftCard, NftCardSkeleton } from '@/ui/components/NftCard';
import { useCarousel } from '@/ui/components/NftCarousel/useCarousel';
import { cn } from '@/ui/utils/cn';

type NftCarouselProps = {
  id: string;
  title: string;
  nfts: NftSummary[];
  isPending: boolean;
};

const itemClassName =
  'w-[calc((100%-16px)/2)] shrink-0 snap-start md:w-[calc((100%-56px)/3)] lg:w-[calc((100%-112px)/5)]';

export function NftCarousel({ id, title, nfts, isPending }: NftCarouselProps) {
  const { trackRef, page, pageCount, handleScroll, handleGoToPage } = useCarousel(nfts.length);
  const titleId = `${id}-title`;

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-8">
      <h2
        id={titleId}
        className="border-b border-primary/30 pb-3 text-[15px] leading-4 font-bold text-accent md:text-[17px]"
      >
        {title}
      </h2>

      <ul
        ref={trackRef}
        onScroll={handleScroll}
        aria-busy={isPending}
        className="flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto md:gap-7"
      >
        {isPending
          ? Array.from({ length: 5 }, (_, index) => (
              <li key={index} className={itemClassName}>
                <NftCardSkeleton />
              </li>
            ))
          : nfts.map((nft) => (
              <li key={nft.id} className={itemClassName}>
                <NftCard nft={nft} compact />
              </li>
            ))}
      </ul>

      {!isPending && pageCount > 1 && (
        <div
          role="group"
          aria-label={`Páginas de ${title}`}
          className="-mt-1.5 flex justify-center gap-2"
        >
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleGoToPage(index)}
              aria-label={`Página ${index + 1} de ${pageCount}`}
              aria-current={index === page}
              className="flex size-6 items-center justify-center"
            >
              <span
                className={cn(
                  'size-3 rounded-full border-[1.3px] border-primary transition-colors',
                  index === page && 'bg-primary',
                )}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
