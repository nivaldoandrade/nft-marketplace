import { Service } from '@/app/services/Service';
import type { WalletProvider, Wallets } from '@/app/types/Wallet';

export class WalletsService extends Service {
  static async list(signal?: AbortSignal): Promise<Wallets> {
    const { data } = await this.client.get<Wallets>('me/wallets', { signal });

    return data;
  }

  static async connect({ walletId, provider }: WalletsService.ConnectParams): Promise<Wallets> {
    const { data } = await this.client.post<Wallets>(
      `me/wallets/${encodeURIComponent(walletId)}/connect`,
      { provider },
    );

    return data;
  }

  static async disconnect(): Promise<Wallets> {
    const { data } = await this.client.post<Wallets>('me/wallets/disconnect');

    return data;
  }
}

export namespace WalletsService {
  export type ConnectParams = {
    walletId: string;
    provider: WalletProvider;
  };
}
