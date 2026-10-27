import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useEffect } from 'react';

import { AuthProvider } from '@/app/contexts/AuthContext';
import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { queryClient } from '@/app/libs/queryClient';
import { toast } from '@/app/libs/toast';
import { router } from '@/app/router';
import { AuthMode } from '@/app/router/authSearch';

function handleSessionExpired() {
  toast.error('Sua sessão expirou. Entre novamente para continuar.');
  router.navigate({
    to: '.',
    search: (previous) => ({ ...previous, auth: AuthMode.SIGN_IN }),
    resetScroll: false,
  });
}

function AppRouter() {
  const auth = useAuth();

  useEffect(() => {
    router.invalidate();
  }, [auth.isSignedIn]);

  return <RouterProvider router={router} context={{ auth }} />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider onSessionExpired={handleSessionExpired}>
        <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  );
}
