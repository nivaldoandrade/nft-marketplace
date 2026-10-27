import { http, HttpResponse } from 'msw';

import { type NftChanges, updateNft } from '@/mocks/realtime/nftUpdates';
import { disconnectAll, realtimeConnectionHandler } from '@/mocks/realtime/server';
import { apiError } from '@/mocks/utils/responses';
import { readJson } from '@/mocks/utils/validators';

// control endpoints live outside the API path, so they skip the network scenarios
export const realtimeHandlers = [
  realtimeConnectionHandler,

  http.post('/__mock/realtime/nft-updated', async ({ request }) => {
    const { nftId, ...changes } = await readJson<NftChanges & { nftId: string }>(request);
    const event = nftId ? updateNft(nftId, changes) : null;

    return event ? HttpResponse.json(event) : apiError(404, 'RESOURCE_NOT_FOUND');
  }),

  http.post('/__mock/realtime/disconnect', async ({ request }) => {
    const { downtimeMs } = await readJson<{ downtimeMs: number }>(request);
    disconnectAll(downtimeMs);

    return new HttpResponse(null, { status: 204 });
  }),
];
