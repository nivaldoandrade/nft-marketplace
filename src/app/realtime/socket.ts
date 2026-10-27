import { io, type Socket } from 'socket.io-client';

import { getSocketOrigin, SOCKET_PATH } from '@/app/config/socket';
import type { NftUpdatedEvent, OrderUpdatedEvent } from '@/app/types/Realtime';

interface IServerToClientEvents {
  'nft.updated': (event: NftUpdatedEvent) => void;
  'order.updated': (event: OrderUpdatedEvent) => void;
}

export type RealtimeSocket = Socket<IServerToClientEvents>;

export function createSocket(token: string | null): RealtimeSocket {
  return io(getSocketOrigin(), {
    path: SOCKET_PATH,
    // the mock layer intercepts WebSocket connections only, not HTTP long-polling
    transports: ['websocket'],
    auth: token ? { token } : {},
    autoConnect: false,
  });
}
