import { createFileRoute } from '@tanstack/react-router';

import { Favorites } from '@/ui/pages/favorites';

export const Route = createFileRoute('/perfil/lista-de-interesse')({
  component: Favorites,
});
