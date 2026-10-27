import { Service } from '@/app/services/Service';
import type { Profile } from '@/app/types/User';

export class ProfileService extends Service {
  static async get(signal?: AbortSignal): Promise<Profile> {
    const { data } = await this.client.get<Profile>('me/profile', { signal });

    return data;
  }

  static async update(params: ProfileService.UpdateParams): Promise<Profile> {
    const { data } = await this.client.patch<Profile>('me/profile', params);

    return data;
  }

  static async uploadAvatar(dataUrl: string): Promise<Profile> {
    const { data } = await this.client.put<Profile>('me/avatar', { dataUrl });

    return data;
  }

  static async removeAvatar(): Promise<Profile> {
    const { data } = await this.client.delete<Profile>('me/avatar');

    return data;
  }

  static async changePassword(params: ProfileService.ChangePasswordParams): Promise<void> {
    await this.client.post('me/password', params);
  }
}

export namespace ProfileService {
  export type UpdateParams = Pick<
    Profile,
    'displayName' | 'username' | 'email' | 'ensName' | 'walletNickname'
  >;

  export type ChangePasswordParams = {
    currentPassword: string;
    newPassword: string;
  };
}
