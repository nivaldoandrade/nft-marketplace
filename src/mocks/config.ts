import { env } from '@/app/config/env';

export const MOCK_DB_KEY = '@kurio:mock-db';
export const MOCK_DB_VERSION = 3;
export const MOCK_SCENARIO_KEY = '@kurio:mock-scenario';
export const SESSION_DURATION_MS = 60 * 60 * 1000;

export function apiPath(path: string) {
  return `${env.VITE_API_URL.replace(/\/$/, '')}${path}`;
}
