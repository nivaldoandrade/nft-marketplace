import { createFileRoute } from '@tanstack/react-router';

import { Home } from '@/ui/pages/home';

export const Route = createFileRoute('/')({
  component: Home,
});
