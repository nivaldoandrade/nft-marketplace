import { Service } from '@/app/services/Service';
import type { Network, NftCategory, NftSort, NftSummary, NftTab } from '@/app/types/Nft';
import type { Paginated } from '@/app/types/Pagination';

export class NftsService extends Service {
  static async list(
    params: NftsService.ListParams,
    signal?: AbortSignal,
  ): Promise<NftsService.ListResponse> {
    const { data } = await this.client.get<NftsService.ListResponse>('nfts', {
      params: {
        ...params,
        category: params.category?.join(',') || undefined,
        network: params.network?.join(',') || undefined,
      },
      signal,
    });

    return data;
  }

  static async getFeatured(signal?: AbortSignal): Promise<NftsService.FeaturedResponse> {
    const { data } = await this.client.get<NftsService.FeaturedResponse>('nfts/featured', {
      signal,
    });

    return data;
  }
}

export namespace NftsService {
  export type ListParams = {
    q?: string;
    category?: NftCategory[];
    network?: Network[];
    minPrice?: string;
    maxPrice?: string;
    tab?: NftTab;
    sort?: NftSort;
    page?: number;
    perPage?: number;
  };

  export type FacetCount<T extends string> = {
    id: T;
    count: number;
  };

  export type ListResponse = Paginated<NftSummary> & {
    facets: {
      categories: FacetCount<NftCategory>[];
      networks: FacetCount<Network>[];
      priceRange: {
        min: string;
        max: string;
      };
    };
  };

  export type FeaturedResponse = {
    hero: NftSummary[];
    spotlight: NftSummary | null;
    promos: NftSummary[];
  };
}
