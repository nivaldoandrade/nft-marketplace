import { createRouter } from '@tanstack/react-router';

import { queryClient } from '@/app/libs/queryClient';
import { routeTree } from '@/app/router/routeTree.gen';

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
