import { useRelatedNfts } from '@/app/hooks/queries/nfts/useRelatedNfts';
import { NftCard, NftCardSkeleton } from '@/ui/components/NftCard';
import { useCarousel } from '@/ui/pages/nftDetails/components/RelatedNfts/useCarousel';
import { cn } from '@/ui/utils/cn';

type RelatedNftsProps = {
  nftId: string;
};

const itemClassName =
  'w-[calc((100%-16px)/2)] shrink-0 snap-start md:w-[calc((100%-56px)/3)] lg:w-[calc((100%-112px)/5)]';

export function RelatedNfts({ nftId }: RelatedNftsProps) {
  const { related, isPending, isError } = useRelatedNfts(nftId);
  const { trackRef, page, pageCount, handleScroll, handleGoToPage } = useCarousel(related.length);

  if (isError || (!isPending && related.length === 0)) {
    return null;
  }

  return (
    <section aria-labelledby="related-title" className="flex flex-col gap-8">
      <h2
        id="related-title"
        className="border-b border-primary/30 pb-3 text-[15px] leading-4 font-bold text-accent md:text-[17px]"
      >
        Mais desta coleção
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
          : related.map((nft) => (
              <li key={nft.id} className={itemClassName}>
                <NftCard nft={nft} compact />
              </li>
            ))}
      </ul>

      {!isPending && pageCount > 1 && (
        <div
          role="group"
          aria-label="Páginas de NFTs relacionados"
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
