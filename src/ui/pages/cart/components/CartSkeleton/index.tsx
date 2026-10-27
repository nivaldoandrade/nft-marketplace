import { Skeleton } from '@/ui/components/ui/skeleton';

export function CartSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando carrinho" className="flex flex-col gap-5 md:gap-3">
      <Skeleton className="hidden h-7 w-full md:block" />
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-[100px] rounded-[14px] md:h-[70px] md:rounded-none" />
      ))}
    </div>
  );
}
