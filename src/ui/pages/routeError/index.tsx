import { useQueryClient } from '@tanstack/react-query';
import { type ErrorComponentProps, Link, useRouter } from '@tanstack/react-router';

import { queryKeys } from '@/app/libs/queryKeys';
import { Container } from '@/ui/components/Container';

export function RouteError({ reset }: ErrorComponentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleRetry() {
    await queryClient.resetQueries({
      predicate: (query) => query.queryKey[0] !== queryKeys.session()[0],
    });
    reset();
    router.invalidate();
  }

  return (
    <Container
      role="alert"
      className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <h1 className="text-2xl font-bold md:text-3xl">Algo deu errado</h1>
      <p className="max-w-md text-muted-foreground">
        Não foi possível exibir esta página. Tente novamente ou volte para o início.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={handleRetry}
          className="rounded-md bg-primary px-6 py-2.5 font-bold text-primary-foreground pressable hover:bg-accent"
        >
          Tentar novamente
        </button>
        <Link
          to="/"
          reloadDocument
          className="rounded-md border border-primary px-6 py-2.5 font-bold text-accent pressable hover:bg-primary/10"
        >
          Voltar para o início
        </Link>
      </div>
    </Container>
  );
}
