import { http } from 'msw';

import { apiPath } from '@/mocks/config';
import { authHandlers } from '@/mocks/handlers/auth';
import { cartHandlers } from '@/mocks/handlers/cart';
import { favoriteHandlers } from '@/mocks/handlers/favorites';
import { nftHandlers } from '@/mocks/handlers/nfts';
import { orderHandlers } from '@/mocks/handlers/orders';
import { profileHandlers } from '@/mocks/handlers/profile';
import { realtimeHandlers } from '@/mocks/handlers/realtime';
import { scenarioHandlers } from '@/mocks/handlers/scenario';
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
  ...profileHandlers,
  ...walletHandlers,
  ...realtimeHandlers,
  ...scenarioHandlers,
];
