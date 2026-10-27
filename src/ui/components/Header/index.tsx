import { Link } from '@tanstack/react-router';

import { AccountMenu } from '@/ui/components/AccountMenu';
import { Container } from '@/ui/components/Container';
import { NavLink } from '@/ui/components/Header/NavLink';
import { useHeader } from '@/ui/components/Header/useHeader';
import { ArrowDownIcon, CartIcon, CloseIcon, LoginIcon, SearchIcon } from '@/ui/components/Icons';
import { Logo } from '@/ui/components/Logo';
import { useCatalogLink } from '@/ui/hooks/useCatalogLink';
import { cn } from '@/ui/utils/cn';
import { notifyUnavailable } from '@/ui/utils/notifyUnavailable';

const navItemClassName =
  'relative flex h-full items-start text-sm text-foreground lg:text-base transition-colors hover:text-accent';

const activeClassName =
  'font-bold text-accent after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:bg-primary';

export function Header() {
  const {
    inputRef,
    openButtonRef,
    isSearchVisible,
    searchTerm,
    isHomeActive,
    isMarketActive,
    isMarketPage,
    setSearchTerm,
    handleOpenSearch,
    handleSearchBlur,
    handleSubmitSearch,
    handleSearchKeyDown,
    handleClearSearch,
    isSignedIn,
    initials,
    firstName,
    openAuthModal,
    cartCount,
    cartLabel,
  } = useHeader();
  const catalogLink = useCatalogLink();

  return (
    <header className="sticky top-0 z-40 hidden bg-background pt-6 md:block">
      <Container>
        <div className="flex h-[45px] items-start justify-between gap-4 border-b border-primary/30">
          <div className="flex shrink-0 pt-2 xl:w-[160px]">
            <Logo />
          </div>

          <nav aria-label="Principal" className="h-full shrink-0">
            <ul className="flex h-full gap-4 lg:gap-10">
              <li className="h-full">
                <NavLink
                  to="/"
                  className={cn(navItemClassName, isHomeActive && activeClassName)}
                  ariaCurrent={isHomeActive ? 'location' : undefined}
                >
                  Início
                </NavLink>
              </li>
              <li className="h-full">
                <NavLink
                  to="/"
                  {...catalogLink}
                  className={cn(navItemClassName, isMarketActive && activeClassName)}
                  ariaCurrent={isMarketPage ? 'page' : isMarketActive ? 'location' : undefined}
                >
                  Mercado
                </NavLink>
              </li>
              <li className="h-full">
                <button
                  type="button"
                  className={navItemClassName}
                  onClick={() => notifyUnavailable('A página de criadores')}
                >
                  Criadores
                </button>
              </li>
              <li className="h-full">
                <button
                  type="button"
                  className={navItemClassName}
                  onClick={() => notifyUnavailable('A página Aprenda')}
                >
                  Aprenda
                </button>
              </li>
            </ul>
          </nav>

          <div className="flex min-w-0 items-center gap-5 lg:gap-7">
            {isSearchVisible ? (
              <form
                role="search"
                onSubmit={handleSubmitSearch}
                onBlur={handleSearchBlur}
                className="flex min-w-0 items-center gap-5 lg:gap-7"
              >
                <div className="relative w-[200px] min-w-[120px] lg:w-56">
                  <label htmlFor="header-search" className="sr-only">
                    Buscar NFTs ou coleções
                  </label>
                  <input
                    ref={inputRef}
                    id="header-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Buscar NFTs..."
                    className="h-[35px] w-full rounded-md border border-input bg-card pr-8 pl-3 text-sm placeholder:text-subtle"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      aria-label="Limpar busca"
                      className="absolute inset-y-0 right-0 flex w-8 items-center justify-center text-subtle hover:text-accent"
                    >
                      <CloseIcon className="size-2.5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  aria-label="Buscar"
                  className="-mx-0.5 flex size-6 shrink-0 items-center justify-center hover:text-accent"
                >
                  <SearchIcon className="size-5" />
                </button>
              </form>
            ) : (
              <button
                ref={openButtonRef}
                type="button"
                onClick={handleOpenSearch}
                aria-label="Abrir busca"
                aria-expanded={false}
                className="-mx-0.5 flex size-6 shrink-0 items-center justify-center hover:text-accent"
              >
                <SearchIcon className="size-5" />
              </button>
            )}

            <Link
              to="/carrinho"
              aria-label={cartLabel}
              className="relative flex h-6 w-[31px] shrink-0 items-center hover:text-accent"
            >
              <CartIcon className="size-6" />
              {cartCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 right-0 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] leading-[13px] font-medium text-primary-foreground outline-2 outline-background"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {isSignedIn ? (
              <AccountMenu>
                <button
                  type="button"
                  aria-label={`Conta de ${firstName}`}
                  className="flex h-[35px] shrink-0 items-center gap-1.5 rounded-full pressable hover:text-accent"
                >
                  <span className="flex size-[35px] shrink-0 items-center justify-center rounded-full border border-primary bg-secondary text-sm font-bold text-accent">
                    {initials}
                  </span>
                  <ArrowDownIcon className="size-3 shrink-0" />
                </button>
              </AccountMenu>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal()}
                title="Entrar"
                className="flex size-[35px] shrink-0 items-center justify-center gap-1 rounded-md bg-primary font-medium text-primary-foreground pressable hover:bg-accent lg:w-[100px]"
              >
                <LoginIcon className="size-5" />
                <span className="max-lg:sr-only">Entrar</span>
              </button>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
