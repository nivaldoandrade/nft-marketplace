import type { ValueOf } from '@/app/utils/ValueOf';

export const RealtimeStatus = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
} as const;

export type RealtimeStatus = ValueOf<typeof RealtimeStatus>;
