import { env } from '@/app/config/env';

export const MOCK_DB_KEY = '@kurio:mock-db';
export const MOCK_DB_VERSION = 7;
export const MOCK_SCENARIO_KEY = '@kurio:mock-scenario';
export const SESSION_DURATION_MS = 60 * 60 * 1000;
export const QUOTE_DURATION_MS = 5 * 60 * 1000;
export const ORDER_PROCESSING_MS = 4000;

export function apiPath(path: string) {
  return `${env.VITE_API_URL.replace(/\/$/, '')}${path}`;
}
