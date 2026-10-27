import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useApplyCoupon, useRemoveCoupon } from '@/app/hooks/mutations/cart/useCartActions';
import { useCart } from '@/app/hooks/queries/cart/useCart';
import { toast } from '@/app/libs/toast';
import { couponSchema } from '@/ui/pages/cart/components/CouponForm/schema';
import { applyApiErrors } from '@/ui/utils/applyApiErrors';

export function useCouponForm() {
  const { cart } = useCart();
  const { applyCoupon, isApplying } = useApplyCoupon();
  const { removeCoupon, isRemoving } = useRemoveCoupon();

  const form = useForm({
    defaultValues: { code: '' },
    resolver: zodResolver(couponSchema),
  });

  const handleSubmit = form.handleSubmit(async ({ code }) => {
    try {
      const updated = await applyCoupon(code);
      form.reset();
      toast.success(`Cupom ${updated.coupon?.code} aplicado.`);
    } catch (error) {
      applyApiErrors(form, error);
    }
  });

  async function handleRemove() {
    try {
      await removeCoupon();
      toast.success('Cupom removido.');
    } catch {
      toast.error('Não foi possível remover o cupom. Tente novamente.');
    }
  }

  return {
    coupon: cart?.coupon ?? null,
    register: form.register,
    error: form.formState.errors.code?.message ?? form.formState.errors.root?.api?.message,
    isApplying,
    isRemoving,
    handleSubmit,
    handleRemove,
  };
}
