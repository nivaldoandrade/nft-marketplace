import { Service } from '@/app/services/Service';
import type { User } from '@/app/types/User';

export class AuthService extends Service {
  static async signIn(
    params: AuthService.SignIn['params'],
  ): Promise<AuthService.SignIn['response']> {
    const { data } = await this.client.post<AuthService.SignIn['response']>('auth/sign-in', params);

    return data;
  }

  static async signUp(
    params: AuthService.SignUp['params'],
  ): Promise<AuthService.SignUp['response']> {
    const { data } = await this.client.post<AuthService.SignUp['response']>('auth/sign-up', params);

    return data;
  }

  static async getSession(signal?: AbortSignal): Promise<AuthService.Session> {
    const { data } = await this.client.get<AuthService.Session>('auth/session', { signal });

    return data;
  }

  static async signOut(): Promise<void> {
    await this.client.post('auth/sign-out');
  }
}

export namespace AuthService {
  export type Session = {
    user: User;
    expiresAt: string;
  };

  export type AuthResponse = Session & {
    accessToken: string;
  };

  export type SignIn = {
    params: { email: string; password: string };
    response: AuthResponse;
  };

  export type SignUp = {
    params: { username: string; email: string; password: string };
    response: AuthResponse;
  };
}
