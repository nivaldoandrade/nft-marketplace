import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { enableMocking } from '@/mocks';

import '@/ui/styles/index.css';

// the app is imported after the mocks start because socket.io-client keeps the WebSocket
// constructor it finds at import time, before MSW could patch it
enableMocking()
  .then(() => import('@/ui/App'))
  .then(({ App }) => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
