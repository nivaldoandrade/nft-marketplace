import { Link } from '@tanstack/react-router';

import { CATALOG_SECTION_ID } from '@/ui/utils/sections';

type NftDetailsFeedbackProps = {
  variant: 'not-found' | 'error';
  onRetry?: () => void;
};

const actionClassName =
  'rounded-md bg-primary px-6 py-2.5 font-bold text-primary-foreground pressable hover:bg-accent';

export function NftDetailsFeedback({ variant, onRetry }: NftDetailsFeedbackProps) {
  const isNotFound = variant === 'not-found';

  return (
    <div
      role={isNotFound ? undefined : 'alert'}
      className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 py-16 text-center"
    >
      {isNotFound && <p className="text-sm font-medium tracking-[0.1em] text-accent">ERRO 404</p>}
      <h1 className="text-2xl font-bold md:text-3xl">
        {isNotFound ? 'NFT não encontrado' : 'Não foi possível carregar o NFT'}
      </h1>
      <p className="max-w-md text-muted-foreground">
        {isNotFound
          ? 'O NFT procurado não existe ou foi removido do catálogo.'
          : 'Verifique sua conexão e tente novamente.'}
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {!isNotFound && onRetry && (
          <button type="button" onClick={onRetry} className={actionClassName}>
            Tentar novamente
          </button>
        )}
        <Link
          to="/"
          hash={CATALOG_SECTION_ID}
          className={
            isNotFound
              ? actionClassName
              : 'rounded-md border border-primary px-6 py-2.5 font-bold text-accent pressable hover:bg-primary/10'
          }
        >
          Voltar para o catálogo
        </Link>
      </div>
    </div>
  );
}
