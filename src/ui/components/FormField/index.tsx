import { useId } from 'react';

import { cn } from '@/ui/utils/cn';

type FormFieldProps = {
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

export function FormField({
  label,
  isRequired = false,
  isLabelHidden = false,
  error,
  className,
  children,
}: FormFieldProps) {
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
