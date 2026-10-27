import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { isTransientError } from '@/app/errors/apiErrors';
import { CheckoutAttemptManager } from '@/app/libs/CheckoutAttemptManager';
import { queryKeys } from '@/app/libs/queryKeys';
import { OrdersService } from '@/app/services/OrdersService';

type CreateOrderParams = Omit<OrdersService.CreateParams, 'idempotencyKey'>;

const MAX_RETRIES = 1;

export const CREATE_ORDER_MUTATION_KEY = ['orders', 'create'];

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const userId = useAuth().user?.id ?? '';

  const { mutateAsync, isPending } = useMutation({
    mutationKey: CREATE_ORDER_MUTATION_KEY,
    mutationFn: (params: CreateOrderParams) =>
      OrdersService.create({
        ...params,
        idempotencyKey: CheckoutAttemptManager.getKey(JSON.stringify(params)),
      }),
    // safe to retry: the same idempotency key returns the order created by the lost attempt
    retry: (failureCount, error) => failureCount < MAX_RETRIES && isTransientError(error),
    onSuccess: (order) => {
      CheckoutAttemptManager.clear();
      queryClient.setQueryData(queryKeys.user(userId).orders.detail(order.id), order);
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId).orders.all() });
    },
  });

  return { createOrder: mutateAsync, isCreating: isPending };
}
