import { useEffect, useState } from 'react';

import { useRealtime } from '@/app/contexts/RealtimeContext/useRealtime';
import { RealtimeStatus } from '@/app/realtime/RealtimeStatus';

const SHOW_DELAY_MS = 1500;

export function ConnectionStatus() {
  const { status } = useRealtime();
  const isReconnecting = status === RealtimeStatus.RECONNECTING;
  const [hasDelayElapsed, setHasDelayElapsed] = useState(false);
  const isVisible = isReconnecting && hasDelayElapsed;

  // brief drops reconnect on their own, so the notice only shows when it takes a while
  useEffect(() => {
    if (!isReconnecting) {
      return;
    }

    const timeout = setTimeout(() => setHasDelayElapsed(true), SHOW_DELAY_MS);

    return () => {
      clearTimeout(timeout);
      setHasDelayElapsed(false);
    };
  }, [isReconnecting]);

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center"
    >
      {isVisible && (
        <p className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-[0_6px_20px_rgba(10,6,4,0.45)]">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-amber motion-safe:animate-pulse"
          />
          <span>
            Reconectando<span className="sr-only"> às atualizações em tempo real</span>…
          </span>
        </p>
      )}
    </div>
  );
}
