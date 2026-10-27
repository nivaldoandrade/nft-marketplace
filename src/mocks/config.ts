import { env } from '@/app/config/env';

export const MOCK_SCENARIO_KEY = '@kurio:mock-scenario';

export function apiPath(path: string) {
  return `${env.VITE_API_URL.replace(/\/$/, '')}${path}`;
}
