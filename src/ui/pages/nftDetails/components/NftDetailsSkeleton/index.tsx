import { NftCardSkeleton } from '@/ui/components/NftCard';
import { Skeleton } from '@/ui/components/ui/skeleton';

export function NftDetailsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando NFT" className="flex flex-col">
      <Skeleton data-top-tint className="-mx-6 h-[506px] rounded-none md:hidden" />

      <div className="relative -mx-6 -mt-[114px] flex flex-col gap-4 rounded-t-[31px] bg-card px-6 pt-8 pb-6 md:mx-0 md:mt-0 md:grid md:grid-cols-2 md:gap-8 md:rounded-none md:bg-transparent md:p-0 lg:grid-cols-[minmax(0,573fr)_minmax(0,595fr)]">
        <div className="hidden gap-4 md:flex md:flex-col-reverse lg:flex-row lg:gap-7">
          <div className="flex gap-4 lg:flex-col">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton
                key={index}
                className="aspect-square w-[calc((100%-48px)/4)] rounded-lg lg:w-[100px]"
              />
            ))}
          </div>
          <Skeleton className="aspect-square flex-1" />
        </div>

        <div className="flex flex-col gap-4">
          <Skeleton className="h-5 w-2/3 md:h-9" />
          <Skeleton className="hidden h-5 w-1/2 md:block" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-7 w-12 rounded-full" />
            ))}
          </div>
          <Skeleton className="hidden h-12 w-full md:block" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-5 w-64" />
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-16 md:mt-24 md:gap-24">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-7 w-full max-w-md" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-6 h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="mt-3 h-12 w-full max-w-xl" />
          <Skeleton className="h-12 w-full max-w-xl" />
          <Skeleton className="h-12 w-full max-w-xl" />
        </div>
        <div className="flex flex-col gap-8">
          <Skeleton className="h-7 w-full" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-7 lg:grid-cols-5">
            {Array.from({ length: 5 }, (_, index) => (
              <NftCardSkeleton
                key={index}
                className={
                  index >= 3 ? 'hidden lg:flex' : index === 2 ? 'hidden md:flex' : undefined
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
