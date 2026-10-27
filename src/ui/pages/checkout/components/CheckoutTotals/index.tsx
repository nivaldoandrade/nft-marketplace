import { Link } from '@tanstack/react-router';

import type { Quote } from '@/app/types/Quote';
import { formatEth } from '@/app/utils/eth';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { cn } from '@/ui/utils/cn';
import { formatPrice } from '@/ui/utils/formatPrice';

type CheckoutTotalsProps = {
  quote: Quote | undefined;
  isUpdating: boolean;
};

const rowClassName = 'flex items-baseline justify-between gap-4 text-[15px] leading-5';

export function CheckoutTotals({ quote, isUpdating }: CheckoutTotalsProps) {
  const value = (amount: string | undefined, className?: string) =>
    amount ? (
      <span className={cn('text-lg leading-4 whitespace-nowrap', className)}>
        {formatPrice(amount)}
      </span>
    ) : (
      <Skeleton className="h-4 w-20" />
    );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-sm leading-4">
        {quote?.coupon ? (
          <>Cupom {quote.coupon.code} aplicado.</>
        ) : (
          <>
            Tem um código promocional?{' '}
            <Link to="/carrinho" className="text-accent hover:underline">
              Aplique aqui
            </Link>
          </>
        )}
      </p>

      <dl
        aria-busy={isUpdating}
        className={cn('flex flex-col gap-3 transition-opacity', isUpdating && 'opacity-60')}
      >
        <div className={rowClassName}>
          <dt>Subtotal</dt>
          <dd>{value(quote?.subtotal)}</dd>
        </div>
        <div className={rowClassName}>
          <dt>Desconto do lançamento</dt>
          <dd className="whitespace-nowrap">
            {quote ? (
              <>
                (-) {formatEth(quote.discount)} <span className="sr-only">ETH</span>
              </>
            ) : (
              <Skeleton className="h-4 w-20" />
            )}
          </dd>
        </div>
        <div className={rowClassName}>
          <dt>Taxa de rede</dt>
          <dd>{value(quote?.networkFee)}</dd>
        </div>
        <p className="text-center text-xs leading-4 text-accent">Taxa estimada</p>
        <div
          className={cn(
            rowClassName,
            'items-center border-t border-primary/30 pt-3 font-bold md:px-[42px]',
          )}
        >
          <dt className="text-base leading-4">Total</dt>
          <dd>{value(quote?.total, 'font-bold text-accent')}</dd>
        </div>
      </dl>
    </div>
  );
}
