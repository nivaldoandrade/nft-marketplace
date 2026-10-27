import { ShopIcon } from '@/ui/components/Icons';
import { QuantityStepper } from '@/ui/components/QuantityStepper';
import { formatPrice } from '@/ui/utils/formatPrice';

type MobileBuyBarProps = {
  price: string;
  quantity: number;
  maxQuantity: number;
  isSoldOut: boolean;
  quantityLimitMessage: string | null;
  isAdding: boolean;
  onBuy: () => void;
  onAddToCart: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
};

export function MobileBuyBar({
  price,
  quantity,
  maxQuantity,
  isSoldOut,
  quantityLimitMessage,
  isAdding,
  onBuy,
  onAddToCart,
  onIncrease,
  onDecrease,
}: MobileBuyBarProps) {
  return (
    <section
      aria-label="Compra"
      className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-5 rounded-t-[40px] bg-card px-6 pt-5 pb-[max(16px,env(safe-area-inset-bottom))] shadow-[0_0_20px_rgba(10,6,4,0.45)] md:hidden"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="text-[15px] leading-4 font-medium text-muted-foreground"
            >
              Qtd.
            </span>
            <QuantityStepper
              size="sm"
              quantity={quantity}
              maxQuantity={maxQuantity}
              disabled={isSoldOut}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
            />
          </div>
          <p className="text-xl leading-4 font-bold text-accent">
            <span className="sr-only">Preço: </span>
            {formatPrice(price)}
          </p>
        </div>
        {(isSoldOut || quantityLimitMessage) && (
          <p aria-live="polite" className="text-[13px] leading-4 text-muted-foreground">
            {isSoldOut ? 'Todas as edições estão esgotadas.' : quantityLimitMessage}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          disabled={isSoldOut || isAdding}
          onClick={onBuy}
          className="h-[60px] w-[196px] rounded-[40px] bg-linear-to-br from-primary to-primary/80 text-base font-bold text-primary-foreground pressable disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSoldOut ? 'Esgotado' : 'Comprar NFT'}
        </button>
        <button
          type="button"
          disabled={isSoldOut || isAdding}
          onClick={onAddToCart}
          aria-label="Adicionar ao carrinho"
          className="flex size-[60px] items-center justify-center rounded-[40px] border border-border bg-secondary text-accent pressable disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShopIcon className="size-5" />
        </button>
      </div>
    </section>
  );
}
