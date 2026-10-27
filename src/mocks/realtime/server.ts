import { toSocketIo } from '@mswjs/socket.io-binding';
import { type WebSocketHandlerConnection, ws } from 'msw';

import { getSocketOrigin } from '@/app/config/socket';
import { getScenarioConfig } from '@/mocks/scenarios';

type RealtimeClient = {
  io: ReturnType<typeof toSocketIo>;
  close: () => void;
};

const HEARTBEAT_MS = 20_000;
const UNSTABLE_MIN_MS = 12_000;
const UNSTABLE_MAX_MS = 25_000;

const clients = new Set<RealtimeClient>();
let unavailableUntil = 0;
const connectionListeners = new Set<(count: number) => void>();

// MSW strips the default /socket.io/ path before matching, so the link targets the origin
function socketLinkUrl() {
  const url = new URL('/', getSocketOrigin());
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';

  return url.href;
}

// Socket.IO ignores a close before the handshake and waits for its connect timeout,
// so the refusal is reported as an error on the underlying socket, like a failed connection
function refuseConnection(rawClient: WebSocketHandlerConnection['client']) {
  const { socket } = rawClient as unknown as { socket: EventTarget };

  socket.dispatchEvent(new Event('error'));
  rawClient.close(1011, 'unavailable');
}

function notifyConnectionCount() {
  connectionListeners.forEach((listener) => listener(clients.size));
}

function handleConnection({ client: rawClient, server, params, info }: WebSocketHandlerConnection) {
  // other sockets on the same origin, like the Vite HMR client, go to the real server
  if (!rawClient.url.searchParams.has('EIO')) {
    server.connect();
    return;
  }

  if (getScenarioConfig().offline || Date.now() < unavailableUntil) {
    refuseConnection(rawClient);
    return;
  }

  const io = toSocketIo({ client: rawClient, server, params, info });
  const timers: ReturnType<typeof setTimeout>[] = [];

  const client: RealtimeClient = {
    io,
    close: () => rawClient.close(),
  };

  // engine.io expects server pings, otherwise the client drops the connection after pingInterval + pingTimeout
  timers.push(setInterval(() => rawClient.send('2'), HEARTBEAT_MS));

  if (getScenarioConfig().realtimeUnstable) {
    const delay = UNSTABLE_MIN_MS + Math.random() * (UNSTABLE_MAX_MS - UNSTABLE_MIN_MS);
    timers.push(setTimeout(() => rawClient.close(), delay));
  }

  rawClient.addEventListener('close', () => {
    timers.forEach((timer) => clearInterval(timer));
    clients.delete(client);
    notifyConnectionCount();
  });

  clients.add(client);
  notifyConnectionCount();
}

export const realtimeLink = ws.link(socketLinkUrl());

export const realtimeConnectionHandler = realtimeLink.addEventListener(
  'connection',
  handleConnection,
);

export function broadcast(event: string, payload: unknown) {
  clients.forEach((client) => client.io.client.emit(event, payload));
}

// downtimeMs keeps refusing new connections, so the client stays in the reconnecting state
export function disconnectAll(downtimeMs = 0) {
  unavailableUntil = Date.now() + downtimeMs;
  clients.forEach((client) => client.close());
}

export function onConnectionCountChange(listener: (count: number) => void) {
  connectionListeners.add(listener);

  return () => {
    connectionListeners.delete(listener);
  };
}
