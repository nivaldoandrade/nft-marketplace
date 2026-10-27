import { use } from 'react';

import { RealtimeContext } from '@/app/contexts/RealtimeContext';

export function useRealtime() {
  const value = use(RealtimeContext);

  if (!value) {
    throw new Error('useRealtime must be used inside <RealtimeProvider />');
  }

  return value;
}
