import { useQueryClient } from '@tanstack/react-query';
import { createContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { AuthTokenManager } from '@/app/libs/AuthTokenManager';
import { EventTracker } from '@/app/realtime/EventTracker';
import { RealtimeStatus } from '@/app/realtime/RealtimeStatus';
import { createSocket } from '@/app/realtime/socket';
import { applyNftUpdated, reconcileNfts } from '@/app/realtime/syncNfts';
import { applyOrderUpdated, reconcileOrders } from '@/app/realtime/syncOrders';
import type { NftUpdatedEvent, OrderUpdatedEvent } from '@/app/types/Realtime';

export interface IRealtimeContext {
  status: RealtimeStatus;
}

// eslint-disable-next-line react-refresh/only-export-components
export const RealtimeContext = createContext<IRealtimeContext | null>(null);

interface IRealtimeProviderProps {
  children: React.ReactNode;
}

export function RealtimeProvider({ children }: IRealtimeProviderProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [tracker] = useState(() => new EventTracker());
  const [status, setStatus] = useState<RealtimeStatus>(RealtimeStatus.CONNECTING);

  // one connection per session, so events from a previous user never reach the next one
  useEffect(() => {
    const socket = createSocket(userId ? AuthTokenManager.get() : null);
    let hasConnected = false;

    function handleConnect() {
      if (hasConnected) {
        reconcileNfts(queryClient);
      }

      // an order can be resolved before the first connection opens, so its state is always checked
      if (userId) {
        reconcileOrders(queryClient, userId);
      }

      hasConnected = true;
      setStatus(RealtimeStatus.CONNECTED);
    }

    function handleConnectionLost() {
      setStatus(hasConnected ? RealtimeStatus.RECONNECTING : RealtimeStatus.CONNECTING);
    }

    function handleNftUpdated(event: NftUpdatedEvent) {
      if (tracker.accept(event)) {
        applyNftUpdated(queryClient, event);
      }
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleConnectionLost);
    socket.on('connect_error', handleConnectionLost);
    function handleOrderUpdated(event: OrderUpdatedEvent) {
      if (userId && tracker.accept(event)) {
        applyOrderUpdated(queryClient, userId, event);
      }
    }

    socket.on('nft.updated', handleNftUpdated);
    socket.on('order.updated', handleOrderUpdated);
    socket.connect();

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [queryClient, tracker, userId]);

  const value = useMemo(() => ({ status }), [status]);

  return <RealtimeContext value={value}>{children}</RealtimeContext>;
}
