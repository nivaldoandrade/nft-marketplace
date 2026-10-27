import * as z from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().min(1).default('/api'),
  VITE_SOCKET_URL: z.url().optional(),
  VITE_ENABLE_MOCKS: z.stringbool().default(true),
});

export const env = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL || undefined,
  VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL || undefined,
  VITE_ENABLE_MOCKS: import.meta.env.VITE_ENABLE_MOCKS || undefined,
});
