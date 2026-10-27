import { Link } from '@tanstack/react-router';

import type { Quote } from '@/app/types/Quote';
import { formatEth } from '@/app/utils/eth';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { CouponForm } from '@/ui/pages/cart/components/CouponForm';
import { cn } from '@/ui/utils/cn';
import { formatPrice } from '@/ui/utils/formatPrice';
import { CATALOG_SECTION_ID } from '@/ui/utils/sections';

type CartSummaryProps = {
  quote: Quote | undefined;
  isPending: boolean;
  isUpdating: boolean;
  hasBlockingIssues: boolean;
  checkoutLabel: string;
  onCheckout: () => void;
};

const rowClassName = 'flex items-baseline justify-between gap-4 text-[15px] leading-5';
const valueClassName = 'text-base leading-4 whitespace-nowrap md:text-lg';

export function CartSummary({
  quote,
  isPending,
  isUpdating,
  hasBlockingIssues,
  checkoutLabel,
  onCheckout,
}: CartSummaryProps) {
  const value = (amount: string | undefined, className?: string) =>
    isPending || !amount ? (
      <Skeleton className="h-4 w-20" />
    ) : (
      <span className={cn(valueClassName, className)}>{formatPrice(amount)}</span>
    );

  return (
    <section
      aria-labelledby="summary-title"
      className="-mx-4 rounded-t-[40px] bg-card px-6 pt-6 pb-9 min-[360px]:-mx-7 md:mx-0 md:w-[332px] md:self-end md:rounded-none md:bg-transparent md:p-0 lg:w-auto lg:self-auto"
    >
      <div className="mx-auto flex w-full max-w-[400px] flex-col gap-3 md:max-w-none md:gap-6">
        <h2
          id="summary-title"
          className="hidden border-b border-primary/30 pb-[11px] text-lg leading-4 font-bold md:block"
        >
          Resumo do pedido
        </h2>

        <CouponForm />

        <dl
          aria-busy={isPending || isUpdating}
          className={cn('flex flex-col gap-3 transition-opacity', isUpdating && 'opacity-60')}
        >
          <div className={rowClassName}>
            <dt>Subtotal</dt>
            <dd>{value(quote?.subtotal)}</dd>
          </div>
          <div className={rowClassName}>
            <dt>Desconto do lançamento</dt>
            <dd className="text-[15px] leading-5 whitespace-nowrap">
              {isPending || !quote ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <>
                  (-) {formatEth(quote.discount)} <span className="sr-only">ETH</span>
                </>
              )}
            </dd>
          </div>
          <div className="flex flex-col md:gap-3">
            <div className={rowClassName}>
              <dt>Taxa de rede</dt>
              <dd>{value(quote?.networkFee)}</dd>
            </div>
            <p className="self-end text-xs leading-4 text-accent">Taxa estimada</p>
          </div>
          <div className={cn(rowClassName, 'items-center leading-4 font-bold md:mt-3')}>
            <dt className="text-base leading-4">Total</dt>
            <dd>{value(quote?.total, 'font-bold text-accent')}</dd>
          </div>
        </dl>

        <p aria-live="polite" className="sr-only">
          {quote && !isUpdating ? `Total do pedido: ${formatPrice(quote.total)}` : ''}
        </p>

        <div className="mt-5 flex flex-col gap-3 md:mt-0">
          {hasBlockingIssues && (
            <p role="alert" className="text-[13px] leading-4 text-coral">
              Ajuste os itens indisponíveis para finalizar.
            </p>
          )}
          <button
            type="button"
            onClick={onCheckout}
            disabled={hasBlockingIssues || isPending}
            className="h-[60px] rounded-[40px] bg-linear-to-br from-primary to-primary/80 text-base font-bold text-primary-foreground pressable disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:rounded-[3px] md:bg-primary md:bg-none md:text-[15px] md:hover:bg-accent"
          >
            {checkoutLabel}
          </button>
          <Link
            to="/"
            hash={CATALOG_SECTION_ID}
            className="hidden text-center text-[15px] leading-5 text-accent hover:underline md:block"
          >
            Continuar explorando
          </Link>
        </div>
      </div>
    </section>
  );
}
