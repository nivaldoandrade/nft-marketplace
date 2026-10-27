import { HeartOutlineIcon } from '@/ui/components/Icons';
import { QuantityStepper } from '@/ui/pages/nftDetails/components/QuantityStepper';
import { notifyUnavailable } from '@/ui/utils/notifyUnavailable';

type PurchaseActionsProps = {
  quantity: number;
  maxQuantity: number;
  isSoldOut: boolean;
  quantityLimitMessage: string | null;
  onIncrease: () => void;
  onDecrease: () => void;
};

export function PurchaseActions({
  quantity,
  maxQuantity,
  isSoldOut,
  quantityLimitMessage,
  onIncrease,
  onDecrease,
}: PurchaseActionsProps) {
  return (
    <div className="hidden flex-col gap-2 md:flex">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <QuantityStepper
          quantity={quantity}
          maxQuantity={maxQuantity}
          disabled={isSoldOut}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
        />
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isSoldOut}
            onClick={() => notifyUnavailable('A compra')}
            className="h-10 w-[130px] rounded-md bg-primary text-sm font-bold text-primary-foreground pressable hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSoldOut ? 'ESGOTADO' : 'COMPRAR'}
          </button>
          <button
            type="button"
            onClick={() => notifyUnavailable('A lista de favoritos')}
            className="flex h-10 w-[130px] items-center justify-center gap-2 rounded-md border border-primary text-sm font-medium text-accent pressable hover:bg-primary/10"
          >
            <HeartOutlineIcon className="size-5" />
            Favoritar
          </button>
        </div>
      </div>
      <p aria-live="polite" className="text-[13px] leading-4 text-muted-foreground empty:-mt-2">
        {isSoldOut ? 'Todas as edições deste NFT estão esgotadas.' : quantityLimitMessage}
      </p>
    </div>
  );
}
