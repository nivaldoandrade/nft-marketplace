import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';

import { NotFound } from '@/ui/pages/notFound';

export interface IRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<IRouterContext>()({
  component: Outlet,
  notFoundComponent: NotFound,
});
