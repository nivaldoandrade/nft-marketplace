import { Link } from '@tanstack/react-router';

export function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-semibold">Página não encontrada</h1>
      <p className="text-muted-foreground">O endereço acessado não existe ou foi removido.</p>
      <Link to="/" className="font-medium underline underline-offset-4">
        Voltar para o início
      </Link>
    </main>
  );
}
