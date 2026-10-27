import { env } from '@/app/config/env';

export const SOCKET_PATH = '/socket.io/';

export function getSocketOrigin() {
  return env.VITE_SOCKET_URL ?? window.location.origin;
}
