import { FacebookColorIcon, GoogleIcon } from '@/ui/components/Icons';
import { cn } from '@/ui/utils/cn';
import { notifyUnavailable } from '@/ui/utils/notifyUnavailable';

const buttonClassName =
  'flex h-10 w-full items-center justify-center gap-3 rounded-[5px] border border-border text-[13px] leading-4 font-medium text-muted-foreground transition-colors pressable hover:border-primary/60';

type SocialLoginProps = {
  isSignUp: boolean;
};

export function SocialLogin({ isSignUp }: SocialLoginProps) {
  return (
    <div className={cn('flex flex-col gap-3', isSignUp && 'md:gap-4')}>
      <div className="flex items-center gap-2.5 md:-mx-20 md:gap-3">
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        <p className="text-[13px] leading-4">Ou continue com</p>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>
      <div className={cn('flex flex-col gap-4', !isSignUp && 'md:gap-3')}>
        <button
          type="button"
          onClick={() => notifyUnavailable('O login com Google')}
          className={buttonClassName}
        >
          <GoogleIcon className="size-5" />
          Continuar com Google
        </button>
        <button
          type="button"
          onClick={() => notifyUnavailable('O login com Facebook')}
          className={buttonClassName}
        >
          <FacebookColorIcon className="size-5" />
          Continuar com Facebook
        </button>
      </div>
    </div>
  );
}
