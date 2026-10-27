import type { Socket } from 'socket.io-client';

import { getSocketOrigin, SOCKET_PATH } from '@/app/config/socket';
import type { NftUpdatedEvent, OrderUpdatedEvent } from '@/app/types/Realtime';

interface IServerToClientEvents {
  'nft.updated': (event: NftUpdatedEvent) => void;
  'order.updated': (event: OrderUpdatedEvent) => void;
}

export type RealtimeSocket = Socket<IServerToClientEvents>;

// socket.io-client keeps the WebSocket class it finds when imported, so it is loaded only when
// connecting, after the mock layer patched WebSocket, instead of delaying the whole app
export async function createSocket(token: string | null): Promise<RealtimeSocket> {
  const { io } = await import('socket.io-client');

  return io(getSocketOrigin(), {
    path: SOCKET_PATH,
    // the mock layer intercepts WebSocket connections only, not HTTP long-polling
    transports: ['websocket'],
    auth: token ? { token } : {},
    autoConnect: false,
  });
}
