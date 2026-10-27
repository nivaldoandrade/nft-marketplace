import { Service } from '@/app/services/Service';
import type { Wallet, WalletProvider, Wallets, WalletSlot } from '@/app/types/Wallet';

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

  static async save({ slot, ...body }: WalletsService.SaveParams): Promise<Wallets> {
    const { data } = await this.client.put<Wallets>(`me/wallets/${slot}`, body);

    return data;
  }

  static async disconnect(): Promise<Wallets> {
    const { data } = await this.client.post<Wallets>('me/wallets/disconnect');

    return data;
  }
}

export namespace WalletsService {
  export type SaveParams = Partial<Omit<Wallet, 'id' | 'slot' | 'updatedAt'>> & {
    slot: WalletSlot;
    sameAsPrimary?: boolean;
  };

  export type ConnectParams = {
    walletId: string;
    provider: WalletProvider;
  };
}
