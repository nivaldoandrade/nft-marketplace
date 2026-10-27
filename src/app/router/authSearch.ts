import * as z from 'zod';

import type { ValueOf } from '@/app/utils/ValueOf';

export const AuthMode = {
  SIGN_IN: 'login',
  SIGN_UP: 'cadastro',
} as const;

export type AuthMode = ValueOf<typeof AuthMode>;

export const authSearchSchema = z.object({
  auth: z.enum(AuthMode).optional().catch(undefined),
  redirect: z
    .string()
    .regex(/^\/(?!\/)/)
    .optional()
    .catch(undefined),
});

export type AuthSearch = z.infer<typeof authSearchSchema>;
