import { createFileRoute } from '@tanstack/react-router';

import { Profile } from '@/ui/pages/profile';

export const Route = createFileRoute('/perfil/dados')({
  component: Profile,
});
