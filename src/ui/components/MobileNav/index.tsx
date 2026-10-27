import { Link, useRouterState } from '@tanstack/react-router';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { AccountMenu } from '@/ui/components/AccountMenu';
import { HeartIcon, HomeIcon, ScanIcon, ShopIcon, UserIcon } from '@/ui/components/Icons';
import { useAuthModal } from '@/ui/hooks/useAuthModal';
import { useOpenFavoritesPage } from '@/ui/hooks/useOpenFavoritesPage';
import { cn } from '@/ui/utils/cn';
import { notifyUnavailable } from '@/ui/utils/notifyUnavailable';
import { SEARCH_INPUT_ID, scrollToCatalog } from '@/ui/utils/sections';

const itemClassName =
  'absolute top-7 flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-accent';

export function MobileNav() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isHome = pathname === '/';
  const isFavoritesPage = pathname === '/perfil/lista-de-interesse';
  const { isSignedIn } = useAuth();
  const { open: openAuthModal } = useAuthModal();
  const openFavoritesPage = useOpenFavoritesPage();

  function handleSearch() {
    const input = document.getElementById(SEARCH_INPUT_ID);

    if (input) {
      input.focus();
      return;
    }

    scrollToCatalog();
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-x-0 bottom-0 z-30 h-[calc(46px+env(safe-area-inset-bottom))] bg-card shadow-[0_120px_0_120px_var(--card)] md:hidden"
      />
      <nav
        aria-label="Navegação inferior"
        className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 bottom-0 flex drop-shadow-[0_-10px_15px_rgba(10,6,4,0.45)]"
        >
          <div className="-mr-px flex-1 rounded-tl-[29px] bg-card" />
          <div className="flex w-[152px] shrink-0 flex-col">
            <svg viewBox="0 0 151.7 94.95" preserveAspectRatio="none" className="h-[95px] w-full">
              <path
                d="M0 0C13.75 0 25.98 8.2 31.83 20.65C39.59 37.18 56.39 48.62 75.85 48.62C95.31 48.62 112.11 37.17 119.87 20.65C125.72 8.2 137.94 0 151.7 0V94.95H0Z"
                className="fill-card"
              />
            </svg>
            <div className="-mt-px flex-1 bg-card" />
          </div>
          <div className="-ml-px flex-1 rounded-tr-[29px] bg-card" />
        </div>

        <div className="relative h-[95px]">
          <Link
            to="/"
            aria-label="Início"
            aria-current={isHome ? 'page' : undefined}
            className={cn(
              itemClassName,
              'left-[calc((50%-76px)*0.351-22px)]',
              isHome && 'text-accent',
            )}
          >
            <HomeIcon className="size-5" />
          </Link>
          <button
            type="button"
            aria-label="Lista de interesse"
            aria-current={isFavoritesPage ? 'page' : undefined}
            className={cn(
              itemClassName,
              'left-[calc((50%-76px)*0.901-22px)]',
              isFavoritesPage && 'text-accent',
            )}
            onClick={openFavoritesPage}
          >
            <HeartIcon className="h-[18px] w-5" />
          </button>
          <button
            type="button"
            onClick={handleSearch}
            aria-label="Buscar NFTs"
            className="absolute -top-[31px] left-1/2 flex size-[65px] -translate-x-1/2 items-center justify-center rounded-full bg-linear-to-b from-primary/40 to-primary text-foreground pressable"
          >
            <ScanIcon className="h-6 w-[27px]" />
          </button>

          <button
            type="button"
            aria-label="Carrinho"
            className={cn(itemClassName, 'left-[calc(50%+76px+(50%-76px)*0.145-22px)]')}
            onClick={() => notifyUnavailable('O carrinho')}
          >
            <ShopIcon className="size-5" />
          </button>
          {isSignedIn ? (
            <AccountMenu side="top">
              <button
                type="button"
                aria-label="Conta"
                className={cn(
                  itemClassName,
                  'left-[calc(50%+76px+(50%-76px)*0.618-22px)] text-accent',
                )}
              >
                <UserIcon className="size-5" />
              </button>
            </AccountMenu>
          ) : (
            <button
              type="button"
              aria-label="Entrar"
              className={cn(itemClassName, 'left-[calc(50%+76px+(50%-76px)*0.618-22px)]')}
              onClick={() => openAuthModal()}
            >
              <UserIcon className="size-5" />
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
