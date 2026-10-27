import { env } from '@/app/config/env';

export async function enableMocking() {
  if (!env.VITE_ENABLE_MOCKS) {
    return;
  }

  const { worker } = await import('@/mocks/browser');

  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  });
}
