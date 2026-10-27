import { http, HttpResponse } from 'msw';

import { apiPath } from '@/mocks/config';
import { db, persist } from '@/mocks/db';
import { toNftSummary } from '@/mocks/domain/nfts';
import { requireUser } from '@/mocks/domain/session';
import { getScenarioConfig } from '@/mocks/scenarios';
import { apiError } from '@/mocks/utils/responses';

function listFavorites(userId: string) {
  return (db.favorites[userId] ?? [])
    .map((nftId) => db.nfts[nftId])
    .filter(Boolean)
    .map(toNftSummary);
}

export const favoriteHandlers = [
  http.get(apiPath('/me/favorites'), ({ request }) => {
    const auth = requireUser(request);

    if ('error' in auth) {
      return auth.error;
    }

    return HttpResponse.json({ items: listFavorites(auth.user.id) });
  }),

  http.put(apiPath('/me/favorites/:nftId'), ({ request, params }) => {
    const auth = requireUser(request);

    if ('error' in auth) {
      return auth.error;
    }

    if (getScenarioConfig().favoritesError) {
      return apiError(500, 'INTERNAL_SERVER_ERROR');
    }

    const nftId = params.nftId as string;

    if (!db.nfts[nftId]) {
      return apiError(404, 'RESOURCE_NOT_FOUND');
    }

    const favorites = db.favorites[auth.user.id] ?? [];
    db.favorites[auth.user.id] = [nftId, ...favorites.filter((id) => id !== nftId)];
    persist();

    return HttpResponse.json({ items: listFavorites(auth.user.id) });
  }),

  http.delete(apiPath('/me/favorites/:nftId'), ({ request, params }) => {
    const auth = requireUser(request);

    if ('error' in auth) {
      return auth.error;
    }

    if (getScenarioConfig().favoritesError) {
      return apiError(500, 'INTERNAL_SERVER_ERROR');
    }

    db.favorites[auth.user.id] = (db.favorites[auth.user.id] ?? []).filter(
      (id) => id !== params.nftId,
    );
    persist();

    return HttpResponse.json({ items: listFavorites(auth.user.id) });
  }),
];
