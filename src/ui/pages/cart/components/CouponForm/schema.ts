import * as z from 'zod';

export const couponSchema = z.object({
  code: z.string().trim().min(1, 'Informe o código promocional.'),
});

export type CouponSchema = z.infer<typeof couponSchema>;
