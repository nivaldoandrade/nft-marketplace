import { createFileRoute } from '@tanstack/react-router';

import { requireAuth } from '@/app/router/requireAuth';
import { ProfileLayout } from '@/ui/components/ProfileLayout';

export const Route = createFileRoute('/perfil')({
  beforeLoad: requireAuth,
  component: ProfileLayout,
});
