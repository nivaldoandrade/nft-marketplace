import { http, HttpResponse } from 'msw';

import { Network, NftCategory, NftSort, NftTab } from '@/app/types/Nft';
import { compareEth, isEthValue } from '@/app/utils/eth';
import { apiPath } from '@/mocks/config';
import { db } from '@/mocks/db';
import type { NftRecord } from '@/mocks/db/types';
import { toNftSummary } from '@/mocks/domain/nfts';
import { FEATURED_NFT_IDS } from '@/mocks/fixtures/nfts';
import { getScenarioConfig } from '@/mocks/scenarios';

const DEFAULT_PER_PAGE = 9;
const MAX_PER_PAGE = 30;
const NEW_RELEASES_LIMIT = 30;
const TRENDING_MIN_POPULARITY = 600;

function parseList<T extends string>(value: string | null, allowed: readonly T[]) {
  return (value?.split(',') ?? []).filter((item): item is T => allowed.includes(item as T));
}

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function sortNfts(nfts: NftRecord[], sort: NftSort, tab: NftTab) {
  return [...nfts].sort((a, b) => {
    switch (sort) {
      case NftSort.PRICE_ASC:
        return compareEth(a.price, b.price);
      case NftSort.PRICE_DESC:
        return compareEth(b.price, a.price);
      case NftSort.NAME:
        return a.name.localeCompare(b.name);
      default:
        return tab === NftTab.TRENDING
          ? b.popularity - a.popularity
          : b.createdAt.localeCompare(a.createdAt);
    }
  });
}

function countBy<T extends string>(
  nfts: NftRecord[],
  values: readonly T[],
  key: (nft: NftRecord) => T,
) {
  return values.map((value) => ({
    id: value,
    count: nfts.filter((nft) => key(nft) === value).length,
  }));
}

export const nftHandlers = [
  http.get(apiPath('/nfts'), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const q = params.get('q')?.trim().toLowerCase() ?? '';
    const categories = parseList(params.get('category'), Object.values(NftCategory));
    const networks = parseList(params.get('network'), Object.values(Network));
    const tab = parseList(params.get('tab'), Object.values(NftTab))[0] ?? NftTab.ALL;
    const sort = parseList(params.get('sort'), Object.values(NftSort))[0] ?? NftSort.RECENT;
    const minPrice = params.get('minPrice');
    const maxPrice = params.get('maxPrice');
    const page = parsePositiveInt(params.get('page'), 1);
    const perPage = Math.min(
      parsePositiveInt(params.get('perPage'), DEFAULT_PER_PAGE),
      MAX_PER_PAGE,
    );

    const all = getScenarioConfig().emptyCatalog ? [] : Object.values(db.nfts);
    const newReleaseIds = new Set(
      sortNfts(all, NftSort.RECENT, NftTab.ALL)
        .slice(0, NEW_RELEASES_LIMIT)
        .map((nft) => nft.id),
    );

    const base = all.filter((nft) => {
      if (q && !`${nft.name} ${nft.collection.name}`.toLowerCase().includes(q)) {
        return false;
      }

      if (tab === NftTab.NEW && !newReleaseIds.has(nft.id)) {
        return false;
      }

      if (tab === NftTab.TRENDING && nft.popularity < TRENDING_MIN_POPULARITY) {
        return false;
      }

      if (minPrice && isEthValue(minPrice) && compareEth(nft.price, minPrice) < 0) {
        return false;
      }

      return !(maxPrice && isEthValue(maxPrice) && compareEth(nft.price, maxPrice) > 0);
    });

    const matchesCategory = (nft: NftRecord) =>
      !categories.length || categories.includes(nft.category);
    const matchesNetwork = (nft: NftRecord) => !networks.length || networks.includes(nft.network);

    const filtered = sortNfts(
      base.filter((nft) => matchesCategory(nft) && matchesNetwork(nft)),
      sort,
      tab,
    );

    const prices = all.map((nft) => nft.price).sort(compareEth);
    const total = filtered.length;

    return HttpResponse.json({
      items: filtered.slice((page - 1) * perPage, page * perPage).map(toNftSummary),
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
      facets: {
        categories: countBy(
          base.filter(matchesNetwork),
          Object.values(NftCategory),
          (nft) => nft.category,
        ),
        networks: countBy(
          base.filter(matchesCategory),
          Object.values(Network),
          (nft) => nft.network,
        ),
        priceRange: {
          min: prices[0] ?? '0',
          max: prices[prices.length - 1] ?? '0',
        },
      },
    });
  }),

  http.get(apiPath('/nfts/featured'), () => {
    if (getScenarioConfig().emptyCatalog) {
      return HttpResponse.json({ hero: [], spotlight: null, promos: [] });
    }

    const byId = (id: string) => db.nfts[id];

    return HttpResponse.json({
      hero: FEATURED_NFT_IDS.hero.map(byId).filter(Boolean).map(toNftSummary),
      spotlight: byId(FEATURED_NFT_IDS.spotlight)
        ? toNftSummary(byId(FEATURED_NFT_IDS.spotlight))
        : null,
      promos: FEATURED_NFT_IDS.promos.map(byId).filter(Boolean).map(toNftSummary),
    });
  }),
];
