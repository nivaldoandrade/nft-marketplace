import { useId } from 'react';

import { cn } from '@/ui/utils/cn';

type CheckoutFieldProps = {
  label: string;
  isRequired?: boolean;
  isLabelHidden?: boolean;
  error?: string;
  className?: string;
  children: (props: {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby'?: string;
  }) => React.ReactNode;
};

export const checkoutInputClassName =
  'h-10 w-full rounded-[3px] border border-border bg-transparent px-3 text-sm text-foreground placeholder:text-subtle focus-visible:border-primary focus-visible:outline-none aria-invalid:border-coral';

export function CheckoutField({
  label,
  isRequired = false,
  isLabelHidden = false,
  error,
  className,
  children,
}: CheckoutFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={cn('flex flex-col', className)}>
      <label
        htmlFor={id}
        className={cn(
          'flex h-[29px] items-center text-[15px] leading-[15px]',
          isLabelHidden && 'sr-only',
        )}
      >
        {label}
        {isRequired && (
          <span aria-hidden="true" className="ml-px text-[22px] leading-[29px] text-coral">
            *
          </span>
        )}
      </label>
      {children({ id, 'aria-invalid': !!error, 'aria-describedby': error ? errorId : undefined })}
      {error && (
        <p id={errorId} className="mt-1 text-[13px] leading-4 text-coral">
          {error}
        </p>
      )}
    </div>
  );
}
