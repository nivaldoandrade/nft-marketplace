import { useEffect, useState } from 'react';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { AuthMode } from '@/app/router/authSearch';
import { ArrowLeftIcon, CloseIcon } from '@/ui/components/Icons';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/ui/components/ui/dialog';
import { useAuthModal } from '@/ui/hooks/useAuthModal';
import { SignInForm } from '@/ui/pages/auth/components/SignInForm';
import { SignUpForm } from '@/ui/pages/auth/components/SignUpForm';
import { SocialLogin } from '@/ui/pages/auth/components/SocialLogin';
import { cn } from '@/ui/utils/cn';

const content = {
  [AuthMode.SIGN_IN]: {
    title: 'Entrar',
    description: 'Entre para gerenciar sua carteira, coleção e perfil de criador.',
    switchText: 'Novo na Kurio?',
    switchAction: 'Crie uma conta',
  },
  [AuthMode.SIGN_UP]: {
    title: 'Criar perfil de colecionador',
    description: 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.',
    switchText: 'Já tem uma conta?',
    switchAction: 'Entre',
  },
};

const tabs = [
  { mode: AuthMode.SIGN_IN, label: 'Entrar' },
  { mode: AuthMode.SIGN_UP, label: 'Criar conta' },
];

export function AuthDialog() {
  const { isSignedIn } = useAuth();
  const { mode } = useAuthModal();

  if (!mode || isSignedIn) {
    return null;
  }

  return <AuthDialogContent mode={mode} />;
}

function AuthDialogContent({ mode }: { mode: AuthMode }) {
  const { switchMode, close, complete } = useAuthModal();
  const [returnFocusTo] = useState(() => document.activeElement as HTMLElement | null);

  useEffect(() => () => returnFocusTo?.focus(), [returnFocusTo]);

  const isSignIn = mode === AuthMode.SIGN_IN;
  const texts = content[mode];

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && close()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-transparent"
        onOpenAutoFocus={(event) => {
          if (window.matchMedia('(pointer: coarse)').matches) {
            return;
          }

          event.preventDefault();
          (event.currentTarget as HTMLElement).querySelector('input')?.focus();
        }}
        className={cn(
          'inset-0 top-0 left-0 block h-dvh max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none border-0 bg-background p-0 sm:max-w-none',
          'md:inset-auto md:top-1/2 md:left-1/2 md:h-auto md:max-h-[calc(100dvh-2rem)] md:w-[500px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-lg md:bg-card',
        )}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Voltar"
          className="absolute top-[23px] left-7 flex size-[35px] items-center justify-center rounded-full border border-border bg-secondary pressable hover:text-accent md:hidden"
        >
          <ArrowLeftIcon className="size-5" />
        </button>
        <button
          type="button"
          onClick={close}
          aria-label="Fechar"
          className="absolute top-[7px] right-[7px] hidden size-8 items-center justify-center text-primary hover:text-accent md:flex"
        >
          <CloseIcon className="size-3" />
        </button>

        <div
          className={cn(
            'flex min-h-full flex-col gap-10 px-7 pt-20 pb-6 md:min-h-0 md:gap-0 md:px-0 md:pt-12',
            isSignIn ? 'md:pb-[103px]' : 'md:pb-[75px]',
          )}
        >
          <p
            aria-hidden="true"
            className="flex h-[136px] items-center justify-center text-[32px] leading-[42px] font-bold tracking-[0.1em] md:hidden"
          >
            KURIO
          </p>

          <div className="flex flex-col items-center md:gap-10 md:px-12">
            <DialogTitle className="text-center text-lg leading-4 font-bold md:sr-only">
              {isSignIn ? 'Entrar' : texts.title}
            </DialogTitle>
            <nav aria-label="Acesso à conta" className="hidden items-center gap-2 md:flex">
              {tabs.map((tab, index) => (
                <div key={tab.mode} className="flex items-center gap-2">
                  {index > 0 && <span aria-hidden="true" className="h-5 w-px bg-coral" />}
                  <button
                    type="button"
                    aria-current={tab.mode === mode ? 'page' : undefined}
                    onClick={() => switchMode(tab.mode)}
                    className={cn(
                      'text-xl leading-4 font-medium transition-colors hover:text-accent',
                      tab.mode === mode && 'text-accent',
                    )}
                  >
                    {tab.label}
                  </button>
                </div>
              ))}
            </nav>
            <DialogDescription className="sr-only text-center text-[13px] leading-4 text-foreground md:not-sr-only">
              {texts.description}
            </DialogDescription>
          </div>

          <div className="flex flex-col gap-10 md:gap-6 md:px-20 md:pt-6">
            {isSignIn ? <SignInForm onSuccess={complete} /> : <SignUpForm onSuccess={complete} />}
            <SocialLogin isSignUp={!isSignIn} />
          </div>

          <p className="text-center text-[15px] leading-5 text-muted-foreground md:hidden">
            {texts.switchText}{' '}
            <button
              type="button"
              onClick={() => switchMode(isSignIn ? AuthMode.SIGN_UP : AuthMode.SIGN_IN)}
              className="underline underline-offset-4 hover:text-accent"
            >
              {texts.switchAction}
            </button>
          </p>
        </div>

        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 hidden h-2.5 bg-primary md:block"
        />
      </DialogContent>
    </Dialog>
  );
}
