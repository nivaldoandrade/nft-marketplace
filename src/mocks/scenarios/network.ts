import { delay, HttpResponse } from 'msw';

import { getScenarioConfig, type Latency } from '@/mocks/scenarios';
import { createRandom } from '@/mocks/utils/random';
import { apiError } from '@/mocks/utils/responses';

const TIMEOUT_MS = 15_000;

let requestCount = 0;
const latencyRandom = createRandom(7);
const flakyAttempts = new Map<string, number>();

function getLatency(latency: Latency) {
  switch (latency) {
    case 'none':
      return 0;
    case 'normal':
      return 250;
    case 'slow':
      return 2500;
    case 'variable':
      return 100 + Math.floor(latencyRandom() * 1900);
    case 'out-of-order':
      return requestCount % 2 === 1 ? 1800 : 200;
  }
}

export async function applyNetworkConditions(request: Request) {
  const config = getScenarioConfig();
  requestCount += 1;

  if (config.offline) {
    return HttpResponse.error();
  }

  if (config.timeout) {
    await delay(TIMEOUT_MS);
    return HttpResponse.error();
  }

  await delay(getLatency(config.latency));

  if (config.serverError) {
    return apiError(
      config.serverError,
      config.serverError === 503 ? 'SERVICE_UNAVAILABLE' : 'INTERNAL_SERVER_ERROR',
    );
  }

  if (config.flaky && request.method === 'GET') {
    const key = new URL(request.url).pathname;
    const attempts = (flakyAttempts.get(key) ?? 0) + 1;
    flakyAttempts.set(key, attempts);

    if (attempts === 1) {
      return apiError(503, 'SERVICE_UNAVAILABLE');
    }
  }

  return undefined;
}
