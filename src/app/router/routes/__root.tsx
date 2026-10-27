import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext } from '@tanstack/react-router';

import type { IAuthContext } from '@/app/contexts/AuthContext';
import { authSearchSchema } from '@/app/router/authSearch';
import { AppLayout } from '@/ui/components/AppLayout';
import { NotFound } from '@/ui/pages/notFound';

export interface IRouterContext {
  queryClient: QueryClient;
  auth: IAuthContext;
}

export const Route = createRootRouteWithContext<IRouterContext>()({
  validateSearch: authSearchSchema,
  component: AppLayout,
  notFoundComponent: NotFound,
});
