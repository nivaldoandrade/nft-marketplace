import type { Query, QueryClient } from '@tanstack/react-query';

import { CART_MUTATION_KEY } from '@/app/hooks/mutations/cart/useCartMutation';
import { getCurrentCartKeys } from '@/app/hooks/queries/cart/cartKeys';
import { queryKeys } from '@/app/libs/queryKeys';
import type { FavoritesService } from '@/app/services/FavoritesService';
import type { NftsService } from '@/app/services/NftsService';
import type { Cart } from '@/app/types/Cart';
import type { Nft, NftSummary } from '@/app/types/Nft';
import type { NftUpdatedEvent } from '@/app/types/Realtime';

const nftKey = queryKeys.nfts.all()[0];

function isFavoritesQuery(query: Query) {
  return query.queryKey[0] === 'user' && query.queryKey[2] === 'favorites';
}

function isPriceDependentList(query: Query) {
  const params = query.queryKey[2] as NftsService.ListParams | undefined;

  return !!params && (!!params.minPrice || !!params.maxPrice || !!params.sort?.startsWith('price'));
}

export function applyNftUpdated(queryClient: QueryClient, event: NftUpdatedEvent) {
  const { id } = event.resource;
  const { version, data } = event;

  function patch<T extends NftSummary>(nft: T): T {
    return nft.id === id && nft.version < version
      ? { ...nft, price: data.price, compareAtPrice: data.compareAtPrice, version }
      : nft;
  }

  // keeps the same array when nothing changed, so unrelated queries do not re-render
  function patchItems<T extends NftSummary>(items: T[]) {
    return items.some((item) => item.id === id) ? items.map(patch) : items;
  }

  queryClient.setQueryData<Nft>(queryKeys.nfts.detail(id), (nft) =>
    nft && nft.version < version ? { ...patch(nft), editions: data.editions } : nft,
  );

  queryClient.setQueriesData<NftsService.ListResponse>(
    { queryKey: [nftKey, 'list'] },
    (page) => page && { ...page, items: patchItems(page.items) },
  );

  queryClient.setQueryData<NftsService.FeaturedResponse>(
    queryKeys.nfts.featured(),
    (featured) =>
      featured && {
        hero: patchItems(featured.hero),
        spotlight: featured.spotlight && patch(featured.spotlight),
        promos: patchItems(featured.promos),
      },
  );

  queryClient.setQueriesData<NftsService.RelatedResponse>(
    { queryKey: [nftKey, 'detail'], predicate: (query) => query.queryKey[3] === 'related' },
    (related) => related && { items: patchItems(related.items) },
  );

  queryClient.setQueriesData<FavoritesService.ListResponse>(
    { predicate: isFavoritesQuery },
    (favorites) => favorites && { ...favorites, items: patchItems(favorites.items) },
  );

  // a new price can move the NFT to another page or out of the filtered range
  queryClient.invalidateQueries({
    queryKey: [nftKey, 'list'],
    predicate: isPriceDependentList,
    refetchType: 'none',
  });

  // cart totals and availability always come from the API; a pending cart change already returns them
  const cartKeys = getCurrentCartKeys(queryClient);
  const cart = queryClient.getQueryData<Cart>(cartKeys.cart);
  const isCartMutating = queryClient.isMutating({ mutationKey: CART_MUTATION_KEY }) > 0;

  if (!isCartMutating && cart?.items.some((item) => item.nftId === id)) {
    queryClient.invalidateQueries({ queryKey: cartKeys.cart });
    queryClient.invalidateQueries({ queryKey: cartKeys.quotes });
  }
}

// events missed while disconnected are recovered from the REST API
export function reconcileNfts(queryClient: QueryClient) {
  const cartKeys = getCurrentCartKeys(queryClient);

  queryClient.invalidateQueries({ queryKey: queryKeys.nfts.all() });
  queryClient.invalidateQueries({ predicate: isFavoritesQuery });
  queryClient.invalidateQueries({ queryKey: cartKeys.cart });
  queryClient.invalidateQueries({ queryKey: cartKeys.quotes });
}
