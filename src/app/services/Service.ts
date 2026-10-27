import { AxiosError, create, isAxiosError } from 'axios';

import { env } from '@/app/config/env';
import { type ApiError, ErrorCode } from '@/app/errors/apiErrors';

function createClient() {
  const client = create({
    baseURL: env.VITE_API_URL,
    timeout: 10_000,
  });

  client.interceptors.response.use((response) => {
    const contentType = String(response.headers['content-type'] ?? '');

    if (response.status !== 204 && !contentType.includes('application/json')) {
      return Promise.reject(
        new AxiosError(
          'Unexpected response format',
          ErrorCode.INVALID_RESPONSE,
          response.config,
          response.request,
          response,
        ),
      );
    }

    return response;
  });

  return client;
}

export abstract class Service {
  private static interceptorId: number | undefined;

  protected static client = createClient();

  static setAuthorizationToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  static removeAuthorizationToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  static removeInterceptor() {
    if (this.interceptorId === undefined) {
      return;
    }

    this.client.interceptors.response.eject(this.interceptorId);
    this.interceptorId = undefined;
  }

  static setupUnauthorizedInterceptor(onUnauthorized: () => void) {
    this.removeInterceptor();

    this.interceptorId = this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (!isAxiosError<ApiError>(error)) {
          return Promise.reject(error);
        }

        const code = error.response?.data?.error?.code;
        const isSessionError =
          error.response?.status === 401 &&
          (code === ErrorCode.SESSION_EXPIRED || code === ErrorCode.UNAUTHORIZED);

        if (isSessionError) {
          onUnauthorized();
        }

        return Promise.reject(error);
      },
    );
  }
}
