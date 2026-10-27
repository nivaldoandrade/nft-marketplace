import { useNavigate, useRouter, useRouterState, useSearch } from '@tanstack/react-router';
import { useCallback } from 'react';

import { AuthMode } from '@/app/router/authSearch';

export function useAuthModal() {
  const router = useRouter();
  const navigate = useNavigate();
  const { auth: mode, redirect } = useSearch({ strict: false });
  const openedFromApp = useRouterState({
    select: (state) => !!state.location.state.openedAuthModal,
  });

  const open = useCallback(
    (nextMode: AuthMode = AuthMode.SIGN_IN) => {
      navigate({
        to: '.',
        search: (previous) => ({ ...previous, auth: nextMode }),
        state: (previous) => ({ ...previous, openedAuthModal: true }),
        resetScroll: false,
      });
    },
    [navigate],
  );

  const switchMode = useCallback(
    (nextMode: AuthMode) => {
      navigate({
        to: '.',
        search: (previous) => ({ ...previous, auth: nextMode }),
        state: (previous) => previous,
        replace: true,
        resetScroll: false,
      });
    },
    [navigate],
  );

  const close = useCallback(() => {
    if (openedFromApp) {
      router.history.back();
      return;
    }

    navigate({
      to: '.',
      search: ({ auth: _auth, redirect: _redirect, ...rest }) => rest,
      replace: true,
      resetScroll: false,
    });
  }, [navigate, openedFromApp, router]);

  const complete = useCallback(() => {
    if (redirect) {
      navigate({ href: redirect, replace: true });
      return;
    }

    close();
  }, [close, navigate, redirect]);

  return { mode, open, switchMode, close, complete };
}
