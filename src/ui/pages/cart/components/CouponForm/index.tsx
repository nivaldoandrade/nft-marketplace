import { useCouponForm } from '@/ui/pages/cart/components/CouponForm/useCouponForm';

export function CouponForm() {
  const { coupon, register, error, isApplying, isRemoving, handleSubmit, handleRemove } =
    useCouponForm();

  return (
    <div className="flex flex-col gap-2">
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label htmlFor="coupon-code" className="hidden text-sm leading-4 font-bold md:block">
          Código promocional
        </label>
        <div className="flex h-[50px] overflow-hidden rounded-[40px] border border-border bg-card shadow-[0_6px_20px_rgba(10,6,4,0.45)] md:h-10 md:rounded-[3px] md:border-primary md:shadow-none">
          <label htmlFor="coupon-code" className="sr-only md:hidden">
            Código promocional
          </label>
          <input
            id="coupon-code"
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="Digite o código promocional..."
            aria-invalid={!!error}
            aria-describedby={error ? 'coupon-error' : undefined}
            className="min-w-0 flex-1 bg-transparent pl-4 text-base text-ellipsis uppercase placeholder:text-[13px] placeholder:text-subtle placeholder:normal-case focus-visible:outline-offset-[-2px] md:pl-2 md:text-sm md:placeholder:text-xs"
            {...register('code')}
          />
          <button
            type="submit"
            disabled={isApplying}
            className="w-[97px] shrink-0 rounded-[40px] bg-linear-to-br from-primary/55 to-primary text-[15px] font-bold text-foreground pressable disabled:opacity-60 md:w-[102px] md:rounded-none md:bg-primary md:bg-none md:text-primary-foreground md:hover:bg-accent"
          >
            {isApplying ? 'Aplicando...' : 'Aplicar'}
          </button>
        </div>
        {error && (
          <p id="coupon-error" role="alert" className="text-[13px] leading-4 text-coral">
            {error}
          </p>
        )}
      </form>
      {coupon && (
        <p className="flex flex-wrap items-center gap-x-2 text-[13px] leading-5 text-muted-foreground">
          Cupom <strong className="text-accent">{coupon.code}</strong> aplicado ({coupon.percentOff}
          % de desconto).
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-accent underline underline-offset-4 disabled:opacity-60"
          >
            Remover cupom
          </button>
        </p>
      )}
    </div>
  );
}
