import { Link, Outlet } from '@tanstack/react-router';

import { useAccountMenu } from '@/ui/components/AccountMenu/useAccountMenu';
import { Container } from '@/ui/components/Container';
import {
  ActivityIcon,
  CartIcon,
  DownloadIcon,
  HeartOutlineIcon,
  LocationIcon,
  LoginIcon,
  UserOutlineIcon,
  WarningIcon,
} from '@/ui/components/Icons';
import { cn } from '@/ui/utils/cn';

const itemClassName =
  'flex h-[45px] w-full items-center gap-3 border-l-4 border-transparent px-4 text-[15px] text-accent transition-colors hover:bg-secondary';

const activeClassName =
  'data-[status=active]:border-primary data-[status=active]:[&_svg]:text-primary';

const accountLinks = [
  {
    label: 'Dados do perfil',
    to: '/perfil/dados',
    icon: UserOutlineIcon,
    iconClassName: 'size-[18px]',
  },
  { label: 'Carteiras', to: '/perfil/carteiras', icon: LocationIcon, iconClassName: 'size-5' },
] as const;

const mobileLinks = [
  { label: 'Dados', to: '/perfil/dados' },
  { label: 'Carteiras', to: '/perfil/carteiras' },
  { label: 'Lista de interesse', to: '/perfil/lista-de-interesse' },
] as const;

const outOfScopeItems = [
  { label: 'Ofertas', feature: 'A página de ofertas', icon: ActivityIcon },
  { label: 'Arquivos baixados', feature: 'A página de arquivos baixados', icon: DownloadIcon },
  { label: 'Suporte', feature: 'O suporte', icon: WarningIcon },
];

export function ProfileLayout() {
  const { handleSignOut, handleUnavailable } = useAccountMenu();

  return (
    <Container className="flex gap-7 pt-8 md:pt-8">
      <aside className="hidden w-[310px] shrink-0 self-start bg-card py-2 lg:block">
        <nav aria-labelledby="profile-nav-title">
          <h2 id="profile-nav-title" className="p-2.5 text-lg leading-4 font-bold">
            Meu perfil
          </h2>
          <ul>
            {accountLinks.map(({ label, to, icon: Icon, iconClassName }) => (
              <li key={to}>
                <Link to={to} className={cn(itemClassName, activeClassName)}>
                  <Icon className={cn(iconClassName, 'shrink-0 text-subtle')} />
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => handleUnavailable('A página de atividade')}
                className={itemClassName}
              >
                <CartIcon className="size-[18px] shrink-0 text-subtle" />
                Atividade
              </button>
            </li>
            <li>
              <Link to="/perfil/lista-de-interesse" className={cn(itemClassName, activeClassName)}>
                <HeartOutlineIcon className="size-4 shrink-0 text-subtle" />
                Lista de interesse
              </Link>
            </li>
            {outOfScopeItems.map(({ label, feature, icon: Icon }) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => handleUnavailable(feature)}
                  className={itemClassName}
                >
                  <Icon className="size-[18px] shrink-0 text-subtle" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-primary/30">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex h-10 w-full items-center gap-2 px-4 text-[15px] font-bold text-accent transition-colors hover:bg-secondary"
            >
              <LoginIcon className="size-5 shrink-0 text-primary" />
              Sair
            </button>
          </div>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <nav aria-label="Meu perfil" className="-mx-4 overflow-x-auto px-4 lg:hidden">
          <ul className="flex gap-2">
            {mobileLinks.map(({ label, to }) => (
              <li key={to} className="shrink-0">
                <Link
                  to={to}
                  className="flex h-9 items-center rounded-full border border-border px-4 text-sm text-muted-foreground transition-colors hover:text-accent data-[status=active]:border-primary data-[status=active]:bg-secondary data-[status=active]:font-bold data-[status=active]:text-accent"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Outlet />
      </div>
    </Container>
  );
}
