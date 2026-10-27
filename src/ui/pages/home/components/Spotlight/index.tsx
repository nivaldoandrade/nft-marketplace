import { useFeaturedNfts } from '@/app/hooks/queries/nfts/useFeaturedNfts';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { getLargeImage } from '@/ui/utils/image';

export function Spotlight() {
  const { spotlight, isPending } = useFeaturedNfts();

  if (!isPending && !spotlight) {
    return null;
  }

  return (
    <aside
      aria-labelledby="spotlight-title"
      className="relative isolate flex flex-col gap-4 overflow-hidden bg-linear-to-b from-primary/10 to-primary/[0.03] pt-6 pb-1"
    >
      <div className="flex flex-col gap-4 px-5">
        <h2 id="spotlight-title" className="text-2xl leading-8 font-bold text-accent">
          NFT EM DESTAQUE
        </h2>
        <p className="text-center text-[22px] leading-4 font-bold">OFERTA LIMITADA</p>
      </div>

      {isPending || !spotlight ? (
        <Skeleton className="h-[368px] w-full rounded-[22px]" />
      ) : (
        <img
          src={getLargeImage(spotlight.image)}
          alt={`${spotlight.name}, coleção ${spotlight.collection.name}`}
          width={800}
          height={800}
          loading="lazy"
          decoding="async"
          className="h-[368px] w-full rounded-[22px] object-cover"
        />
      )}

      <span
        aria-hidden="true"
        className="absolute top-[105px] left-[38px] size-[15px] rounded-[29px] bg-linear-to-br from-primary to-transparent opacity-30"
      />
      <span
        aria-hidden="true"
        className="absolute top-[299px] left-4 size-[22px] rounded-[7px] bg-primary opacity-20"
      />
      <span
        aria-hidden="true"
        className="absolute top-[343px] right-[-3px] size-[45px] rounded-[29px] bg-linear-to-br from-primary to-transparent opacity-30"
      />
    </aside>
  );
}
