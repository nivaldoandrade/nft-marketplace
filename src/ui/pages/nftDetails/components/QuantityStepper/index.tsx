import { MinusIcon, PlusIcon } from '@/ui/components/Icons';
import { cn } from '@/ui/utils/cn';

type QuantityStepperProps = {
  quantity: number;
  maxQuantity: number;
  disabled?: boolean;
  size?: 'lg' | 'sm';
  onIncrease: () => void;
  onDecrease: () => void;
  className?: string;
};

const buttonClassName =
  'flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground pressable hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40';

export function QuantityStepper({
  quantity,
  maxQuantity,
  disabled = false,
  size = 'lg',
  onIncrease,
  onDecrease,
  className,
}: QuantityStepperProps) {
  const isLarge = size === 'lg';

  return (
    <div role="group" aria-label="Quantidade" className={cn('flex items-center gap-3', className)}>
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled || quantity <= 1}
        aria-label="Diminuir quantidade"
        className={cn(
          buttonClassName,
          isLarge
            ? 'h-[49px] w-[33px] shadow-[0_6.6px_19.8px_-3.3px_rgba(20,13,10,0.15)]'
            : 'h-[30px] w-5 shadow-[0_4px_12px_-2px_rgba(20,13,10,0.15)]',
        )}
      >
        <MinusIcon className={isLarge ? 'size-[26px]' : 'size-4'} />
      </button>
      <output
        aria-live="polite"
        className={cn(
          'min-w-3 text-center',
          isLarge ? 'text-xl leading-7' : 'text-lg leading-[25px] font-medium',
        )}
      >
        {quantity}
      </output>
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled || quantity >= maxQuantity}
        aria-label="Aumentar quantidade"
        className={cn(
          buttonClassName,
          isLarge
            ? 'h-[49px] w-[33px] shadow-[0_6.6px_19.8px_-3.3px_rgba(20,13,10,0.15)]'
            : 'h-[30px] w-5 shadow-[0_4px_12px_-2px_rgba(20,13,10,0.15)]',
        )}
      >
        <PlusIcon className={isLarge ? 'size-[26px]' : 'size-4'} />
      </button>
    </div>
  );
}
