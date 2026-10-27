import { createFileRoute } from '@tanstack/react-router';

import { Wallets } from '@/ui/pages/wallets';

export const Route = createFileRoute('/perfil/carteiras')({
  component: Wallets,
});
