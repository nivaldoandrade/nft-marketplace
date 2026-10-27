import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { ErrorCode, getApiErrorCode } from '@/app/errors/apiErrors';
import { useSession } from '@/app/hooks/queries/session/useSession';
import { AuthTokenManager } from '@/app/libs/AuthTokenManager';
import { queryClient } from '@/app/libs/queryClient';
import { queryKeys } from '@/app/libs/queryKeys';
import { AuthService } from '@/app/services/AuthService';
import { Service } from '@/app/services/Service';
import type { User } from '@/app/types/User';

const MAX_TIMEOUT_MS = 2 ** 31 - 1;

export interface IAuthContext {
  user: User | null;
  isSignedIn: boolean;
  signIn: (params: AuthService.SignIn['params']) => Promise<void>;
  signUp: (params: AuthService.SignUp['params']) => Promise<void>;
  signOut: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<IAuthContext | null>(null);

interface IAuthProviderProps {
  onSessionExpired: () => void;
  children: React.ReactNode;
}

export function AuthProvider({ onSessionExpired, children }: IAuthProviderProps) {
  const [hasStoredToken] = useState(() => !!AuthTokenManager.get());
  const { user, expiresAt, isFetched, loadSession } = useSession();
  const isReady = !hasStoredToken || isFetched;

  const clearSession = useCallback(() => {
    AuthTokenManager.remove();
    Service.removeAuthorizationToken();
    Service.removeInterceptor();
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== queryKeys.session()[0],
    });
    queryClient.setQueryData(queryKeys.session(), null);
  }, []);

  const setupAuth = useCallback(
    (accessToken: string) => {
      Service.setAuthorizationToken(accessToken);
      Service.setupUnauthorizedInterceptor(() => {
        clearSession();
        onSessionExpired();
      });
    },
    [clearSession, onSessionExpired],
  );

  const startSession = useCallback(
    (response: AuthService.AuthResponse) => {
      AuthTokenManager.save(response.accessToken);
      setupAuth(response.accessToken);
      queryClient.setQueryData<AuthService.Session>(queryKeys.session(), {
        user: response.user,
        expiresAt: response.expiresAt,
      });
    },
    [setupAuth],
  );

  const signIn = useCallback(
    async (params: AuthService.SignIn['params']) => {
      startSession(await AuthService.signIn(params));
    },
    [startSession],
  );

  const signUp = useCallback(
    async (params: AuthService.SignUp['params']) => {
      startSession(await AuthService.signUp(params));
    },
    [startSession],
  );

  const signOut = useCallback(async () => {
    await AuthService.signOut().catch(() => undefined);
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    async function restoreSession() {
      const accessToken = AuthTokenManager.get();

      if (!accessToken) {
        return;
      }

      Service.setAuthorizationToken(accessToken);
      const { error } = await loadSession();
      const code = getApiErrorCode(error);

      if (code === ErrorCode.UNAUTHORIZED || code === ErrorCode.SESSION_EXPIRED) {
        clearSession();
      } else {
        setupAuth(accessToken);
      }
    }

    restoreSession();
  }, [clearSession, loadSession, setupAuth]);

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    const timeout = setTimeout(
      () => {
        clearSession();
        onSessionExpired();
      },
      Math.min(Date.parse(expiresAt) - Date.now(), MAX_TIMEOUT_MS),
    );

    return () => clearTimeout(timeout);
  }, [clearSession, expiresAt, onSessionExpired]);

  const value = useMemo(
    () => ({ user, isSignedIn: !!user, signIn, signUp, signOut }),
    [user, signIn, signUp, signOut],
  );

  if (!isReady) {
    return null;
  }

  return <AuthContext value={value}>{children}</AuthContext>;
}
