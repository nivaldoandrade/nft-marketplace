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

const unavailableItems = [
  { label: 'Dados do perfil', feature: 'A página de dados do perfil', icon: UserOutlineIcon },
  { label: 'Carteiras', feature: 'A página de carteiras', icon: LocationIcon },
  { label: 'Atividade', feature: 'A página de atividade', icon: CartIcon },
];

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
            {unavailableItems.map(({ label, feature, icon: Icon }) => (
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
            <li>
              <Link
                to="/perfil/lista-de-interesse"
                className={cn(
                  itemClassName,
                  'data-[status=active]:border-primary data-[status=active]:[&_svg]:text-primary',
                )}
              >
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

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </Container>
  );
}
