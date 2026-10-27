import { useState } from 'react';

import { FormField } from '@/ui/components/FormField';
import { fieldInputClassName } from '@/ui/components/FormField/styles';
import { EyeIcon, EyeOffIcon } from '@/ui/components/Icons';
import { cn } from '@/ui/utils/cn';

type PasswordFieldProps = Omit<React.ComponentProps<'input'>, 'className' | 'type'> & {
  label: string;
  error?: string;
};

export function PasswordField({ label, error, ...props }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <FormField label={label} error={error} className="gap-3 [&>label]:h-[15px]">
      {(fieldProps) => (
        <div className="relative">
          <input
            {...fieldProps}
            {...props}
            type={isVisible ? 'text' : 'password'}
            className={cn(fieldInputClassName, 'pr-12')}
          />
          <button
            type="button"
            onClick={() => setIsVisible((visible) => !visible)}
            aria-label={
              isVisible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`
            }
            aria-pressed={isVisible}
            className="absolute inset-y-0 right-2 flex w-9 items-center justify-center text-subtle hover:text-accent"
          >
            {isVisible ? <EyeIcon className="size-5" /> : <EyeOffIcon className="size-5" />}
          </button>
        </div>
      )}
    </FormField>
  );
}
