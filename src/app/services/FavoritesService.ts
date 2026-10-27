import { Service } from '@/app/services/Service';
import type { NftSummary } from '@/app/types/Nft';

export class FavoritesService extends Service {
  static async list(signal?: AbortSignal): Promise<FavoritesService.ListResponse> {
    const { data } = await this.client.get<FavoritesService.ListResponse>('me/favorites', {
      signal,
    });

    return data;
  }

  static async add(nftId: string): Promise<FavoritesService.ListResponse> {
    const { data } = await this.client.put<FavoritesService.ListResponse>(
      `me/favorites/${encodeURIComponent(nftId)}`,
    );

    return data;
  }

  static async remove(nftId: string): Promise<FavoritesService.ListResponse> {
    const { data } = await this.client.delete<FavoritesService.ListResponse>(
      `me/favorites/${encodeURIComponent(nftId)}`,
    );

    return data;
  }
}

export namespace FavoritesService {
  export type ListResponse = {
    items: NftSummary[];
  };
}
