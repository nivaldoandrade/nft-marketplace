import * as z from 'zod';

import type { NftsService } from '@/app/services/NftsService';
import { Network, NftCategory, NftSort, NftTab } from '@/app/types/Nft';

const ethValue = z.coerce.string().regex(/^\d+(\.\d+)?$/);

export const catalogSearchDefaults = {
  tab: NftTab.ALL,
  sort: NftSort.RECENT,
  page: 1,
} as const;

export const catalogSearchSchema = z.object({
  q: z.coerce.string().trim().max(80).optional().catch(undefined),
  category: z.array(z.enum(NftCategory)).optional().catch(undefined),
  network: z.array(z.enum(Network)).optional().catch(undefined),
  minPrice: ethValue.optional().catch(undefined),
  maxPrice: ethValue.optional().catch(undefined),
  tab: z.enum(NftTab).default(catalogSearchDefaults.tab).catch(catalogSearchDefaults.tab),
  sort: z.enum(NftSort).default(catalogSearchDefaults.sort).catch(catalogSearchDefaults.sort),
  page: z.number().int().min(1).default(catalogSearchDefaults.page).catch(1),
});

export type CatalogSearch = z.output<typeof catalogSearchSchema>;

export const CATALOG_PER_PAGE = 9;

export function toListParams(search: CatalogSearch): NftsService.ListParams {
  return {
    q: search.q || undefined,
    category: search.category?.length ? search.category : undefined,
    network: search.network?.length ? search.network : undefined,
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
    tab: search.tab,
    sort: search.sort,
    page: search.page,
    perPage: CATALOG_PER_PAGE,
  };
}
