import { http } from 'msw';

import { apiPath } from '@/mocks/config';
import { authHandlers } from '@/mocks/handlers/auth';
import { nftHandlers } from '@/mocks/handlers/nfts';
import { applyNetworkConditions } from '@/mocks/scenarios/network';

const networkHandler = http.all(apiPath('/*'), ({ request }) => applyNetworkConditions(request));

export const handlers = [networkHandler, ...authHandlers, ...nftHandlers];
