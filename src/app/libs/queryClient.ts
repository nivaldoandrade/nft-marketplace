import { QueryClient } from '@tanstack/react-query';

import { isTransientError } from '@/app/errors/apiErrors';

const MAX_RETRIES = 2;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => failureCount < MAX_RETRIES && isTransientError(error),
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
    },
    mutations: {
      retry: false,
    },
  },
});
