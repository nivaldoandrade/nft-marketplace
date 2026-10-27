import type { QueryClient } from '@tanstack/react-query';
import { type ParsedLocation, redirect } from '@tanstack/react-router';

import { queryKeys } from '@/app/libs/queryKeys';
import { AuthMode } from '@/app/router/authSearch';
import type { AuthService } from '@/app/services/AuthService';

type RequireAuthParams = {
  context: { queryClient: QueryClient };
  location: ParsedLocation;
};

// Reads the session from the query cache, which is updated synchronously on sign in,
// while the router context only receives the new auth state on the next render
export function requireAuth({ context, location }: RequireAuthParams) {
  const session = context.queryClient.getQueryData<AuthService.Session | null>(queryKeys.session());

  if (!session?.user) {
    throw redirect({
      to: '/',
      search: { auth: AuthMode.SIGN_IN, redirect: location.href },
    });
  }
}
