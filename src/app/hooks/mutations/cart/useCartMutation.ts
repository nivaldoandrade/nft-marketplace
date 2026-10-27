import { type MutationFunction, useMutation, useQueryClient } from '@tanstack/react-query';

import { getCurrentCartKeys } from '@/app/hooks/queries/cart/cartKeys';
import type { Cart } from '@/app/types/Cart';

type CartMutationOptions<TVariables> = {
  mutationFn: MutationFunction<Cart, TVariables>;
  optimisticUpdate?: (cart: Cart, variables: TVariables) => Cart;
};

export const CART_MUTATION_KEY = ['cart'];

export function useCartMutation<TVariables>({
  mutationFn,
  optimisticUpdate,
}: CartMutationOptions<TVariables>) {
  const queryClient = useQueryClient();

  // queued changes keep their optimistic state until the last response arrives
  const isLastPending = () => queryClient.isMutating({ mutationKey: CART_MUTATION_KEY }) === 1;

  return useMutation({
    mutationKey: CART_MUTATION_KEY,
    scope: { id: 'cart' },
    mutationFn,
    onMutate: async (variables) => {
      const keys = getCurrentCartKeys(queryClient);
      const previous = queryClient.getQueryData<Cart>(keys.cart);

      if (optimisticUpdate && previous) {
        await queryClient.cancelQueries({ queryKey: keys.cart });
        queryClient.setQueryData(keys.cart, optimisticUpdate(previous, variables));
      }

      return { keys, previous };
    },
    onSuccess: (cart, _variables, context) => {
      if (isLastPending()) {
        queryClient.setQueryData(context.keys.cart, cart);
        queryClient.invalidateQueries({ queryKey: context.keys.quotes });
      }
    },
    onError: (_error, _variables, context) => {
      if (!context || !isLastPending()) {
        return;
      }

      if (optimisticUpdate && context.previous) {
        queryClient.setQueryData(context.keys.cart, context.previous);
      }

      queryClient.invalidateQueries({ queryKey: context.keys.cart });
    },
  });
}
