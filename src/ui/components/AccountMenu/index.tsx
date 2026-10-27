import { Link } from '@tanstack/react-router';

import { useAccountMenu } from '@/ui/components/AccountMenu/useAccountMenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/components/ui/dropdown-menu';

type AccountMenuProps = {
  side?: 'top' | 'bottom';
  children: React.ReactNode;
};

export function AccountMenu({ side = 'bottom', children }: AccountMenuProps) {
  const { user, handleSignOut } = useAccountMenu();

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent side={side} align="end">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="text-sm font-bold">{user.displayName}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/perfil/dados">Meu perfil</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/perfil/carteiras">Minhas carteiras</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/perfil/lista-de-interesse">Lista de interesse</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut}>Sair</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
