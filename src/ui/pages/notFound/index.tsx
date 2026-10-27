import { Link } from '@tanstack/react-router';

import { Container } from '@/ui/components/Container';
import { usePageTitle } from '@/ui/hooks/usePageTitle';

export function NotFound() {
  usePageTitle('Página não encontrada');
  return (
    <Container className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-sm font-medium tracking-[0.1em] text-accent">ERRO 404</p>
      <h1 className="text-3xl font-bold">Página não encontrada</h1>
      <p className="max-w-md text-muted-foreground">
        O endereço acessado não existe ou foi removido.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-md bg-primary px-6 py-2.5 font-bold text-primary-foreground pressable hover:bg-accent"
      >
        Voltar para o início
      </Link>
    </Container>
  );
}
