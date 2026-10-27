import { env } from '@/app/config/env';

export async function enableMocking() {
  if (!env.VITE_ENABLE_MOCKS) {
    return;
  }

  const { worker } = await import('@/mocks/browser');

  const options = { onUnhandledRequest: 'bypass', quiet: true } as const;

  await worker.start(options);

  // MSW unregisters the page on unload, so a page restored from the back/forward cache stops being mocked
  window.addEventListener('pageshow', async (event) => {
    if (event.persisted) {
      worker.stop();
      await worker.start(options);
    }
  });
}
