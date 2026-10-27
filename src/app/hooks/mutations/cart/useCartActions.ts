import { useCartMutation } from '@/app/hooks/mutations/cart/useCartMutation';
import { CartService } from '@/app/services/CartService';
import { multiplyEth } from '@/app/utils/eth';

export function useAddToCart() {
  const { mutateAsync, isPending } = useCartMutation({
    mutationFn: CartService.addItem.bind(CartService),
  });

  return { addToCart: mutateAsync, isAdding: isPending };
}

export function useUpdateCartItem() {
  const { mutateAsync } = useCartMutation<CartService.UpdateItemParams>({
    mutationFn: (params) => CartService.updateItem(params),
    optimisticUpdate: (cart, { itemId, quantity }) => ({
      ...cart,
      items: cart.items.map((item) =>
        item.id === itemId
          ? { ...item, quantity, lineTotal: multiplyEth(item.unitPrice, quantity) }
          : item,
      ),
    }),
  });

  return { updateCartItem: mutateAsync };
}

export function useRemoveCartItem() {
  const { mutateAsync } = useCartMutation<string>({
    mutationFn: (itemId) => CartService.removeItem(itemId),
    optimisticUpdate: (cart, itemId) => ({
      ...cart,
      items: cart.items.filter((item) => item.id !== itemId),
    }),
  });

  return { removeCartItem: mutateAsync };
}

export function useApplyCoupon() {
  const { mutateAsync, isPending } = useCartMutation<string>({
    mutationFn: (code) => CartService.applyCoupon(code),
  });

  return { applyCoupon: mutateAsync, isApplying: isPending };
}

export function useRemoveCoupon() {
  const { mutateAsync, isPending } = useCartMutation<void>({
    mutationFn: () => CartService.removeCoupon(),
  });

  return { removeCoupon: mutateAsync, isRemoving: isPending };
}
