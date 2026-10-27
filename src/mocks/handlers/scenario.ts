import { http, HttpResponse } from 'msw';

import { isKnownScenario, setActiveScenario } from '@/mocks/scenarios';
import { apiError } from '@/mocks/utils/responses';
import { readJson } from '@/mocks/utils/validators';

// control endpoint outside the API path, used by tests and demos to switch the scenario without reloading
export const scenarioHandlers = [
  http.post('/__mock/scenario', async ({ request }) => {
    const { scenario } = await readJson<{ scenario: string }>(request);

    if (!scenario || !isKnownScenario(scenario)) {
      return apiError(400, 'BAD_REQUEST');
    }

    setActiveScenario(scenario);

    return new HttpResponse(null, { status: 204 });
  }),
];
