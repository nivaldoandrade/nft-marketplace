import { useId, useState } from 'react';

import { EyeIcon, EyeOffIcon } from '@/ui/components/Icons';
import { cn } from '@/ui/utils/cn';

type AuthFieldProps = Omit<React.ComponentProps<'input'>, 'className'> & {
  label: string;
  error?: string;
};

export function AuthField({ label, error, type = 'text', ...props }: AuthFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const isPassword = type === 'password';
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && isPasswordVisible ? 'text' : type}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'h-[50px] w-full rounded-[10px] border border-border bg-transparent px-4 text-base text-foreground placeholder:text-subtle focus-visible:border-primary focus-visible:outline-none md:h-10 md:rounded-[5px] md:text-sm',
            isPassword && 'pr-12',
            error && 'border-coral',
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={isPasswordVisible}
            className="absolute inset-y-0 right-1 flex w-10 items-center justify-center text-subtle hover:text-accent"
          >
            {isPasswordVisible ? (
              <EyeIcon className="h-5 w-[22px]" />
            ) : (
              <EyeOffIcon className="h-5 w-[22px]" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-[13px] leading-4 text-coral">
          {error}
        </p>
      )}
    </div>
  );
}
