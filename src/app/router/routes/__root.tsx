import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext } from '@tanstack/react-router';

import { AppLayout } from '@/ui/components/AppLayout';
import { NotFound } from '@/ui/pages/notFound';

export interface IRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<IRouterContext>()({
  component: AppLayout,
  notFoundComponent: NotFound,
});
