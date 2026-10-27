import { http } from 'msw';

import { apiPath } from '@/mocks/config';
import { authHandlers } from '@/mocks/handlers/auth';
import { cartHandlers } from '@/mocks/handlers/cart';
import { favoriteHandlers } from '@/mocks/handlers/favorites';
import { nftHandlers } from '@/mocks/handlers/nfts';
import { orderHandlers } from '@/mocks/handlers/orders';
import { realtimeHandlers } from '@/mocks/handlers/realtime';
import { walletHandlers } from '@/mocks/handlers/wallets';
import { applyNetworkConditions } from '@/mocks/scenarios/network';

const networkHandler = http.all(apiPath('/*'), ({ request }) => applyNetworkConditions(request));

export const handlers = [
  networkHandler,
  ...authHandlers,
  ...cartHandlers,
  ...favoriteHandlers,
  ...nftHandlers,
  ...orderHandlers,
  ...walletHandlers,
  ...realtimeHandlers,
];
