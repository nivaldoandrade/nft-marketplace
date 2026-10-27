import { MinusIcon, PlusIcon } from '@/ui/components/Icons';
import { cn } from '@/ui/utils/cn';

type QuantityStepperProps = {
  quantity: number;
  maxQuantity: number;
  disabled?: boolean;
  size?: 'lg' | 'sm' | 'outline';
  label?: string;
  removeLabel?: string;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove?: () => void;
  className?: string;
  valueClassName?: string;
};

const variants = {
  lg: {
    button:
      'h-[49px] w-[33px] rounded-full bg-primary text-primary-foreground shadow-[0_6.6px_19.8px_-3.3px_rgba(20,13,10,0.15)] hover:bg-accent disabled:opacity-40',
    icon: 'size-[26px]',
    value: 'text-xl leading-7',
  },
  sm: {
    button:
      'h-[30px] w-5 rounded-full bg-primary text-primary-foreground shadow-[0_4px_12px_-2px_rgba(20,13,10,0.15)] hover:bg-accent disabled:opacity-40',
    icon: 'size-4',
    value: 'text-lg leading-[25px] font-medium',
  },
  outline: {
    button:
      'size-6 rounded-full border border-border bg-secondary text-foreground hover:border-primary disabled:text-input',
    icon: 'size-4',
    value: 'text-base leading-[22px]',
  },
};

export function QuantityStepper({
  quantity,
  maxQuantity,
  disabled = false,
  size = 'lg',
  label = 'Quantidade',
  removeLabel = 'Remover item',
  onIncrease,
  onDecrease,
  onRemove,
  className,
  valueClassName,
}: QuantityStepperProps) {
  const variant = variants[size];
  const isRemoveMode = !!onRemove && quantity <= 1;
  const buttonClassName = cn(
    'flex shrink-0 items-center justify-center pressable disabled:cursor-not-allowed',
    variant.button,
  );

  return (
    <div role="group" aria-label={label} className={cn('flex items-center gap-3', className)}>
      <button
        type="button"
        onClick={isRemoveMode ? onRemove : onDecrease}
        disabled={disabled || (!isRemoveMode && quantity <= 1)}
        aria-label={isRemoveMode ? removeLabel : 'Diminuir quantidade'}
        className={cn(buttonClassName, isRemoveMode && 'text-coral hover:border-coral')}
      >
        <MinusIcon className={variant.icon} />
      </button>
      <output
        aria-live="polite"
        className={cn('min-w-3 shrink-0 text-center tabular-nums', variant.value, valueClassName)}
      >
        {quantity}
      </output>
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled || quantity >= maxQuantity}
        aria-label="Aumentar quantidade"
        className={buttonClassName}
      >
        <PlusIcon className={variant.icon} />
      </button>
    </div>
  );
}
