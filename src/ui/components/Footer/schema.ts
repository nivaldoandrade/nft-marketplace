import * as z from 'zod';

export const newsletterSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
});

export type NewsletterSchema = z.infer<typeof newsletterSchema>;
