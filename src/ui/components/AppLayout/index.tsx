import { Outlet, useRouterState } from '@tanstack/react-router';

import { Footer } from '@/ui/components/Footer';
import { Header } from '@/ui/components/Header';
import { MobileNav } from '@/ui/components/MobileNav';
import { Toaster } from '@/ui/components/Toaster';

export function AppLayout() {
  const isNftDetails = useRouterState({
    select: (state) => state.location.pathname.startsWith('/nft/'),
  });

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 font-bold text-primary-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer
        className={
          isNftDetails ? 'pb-[calc(10.5rem+env(safe-area-inset-bottom))] md:pb-6' : undefined
        }
      />
      {!isNftDetails && <MobileNav />}
      <Toaster />
    </>
  );
}
