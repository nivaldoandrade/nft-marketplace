import type { QueryClient } from '@tanstack/react-query';

import { getCartKeys } from '@/app/hooks/queries/cart/cartKeys';
import { queryKeys } from '@/app/libs/queryKeys';
import type { Order } from '@/app/types/Order';
import { OrderStatus } from '@/app/types/Order';
import type { OrderUpdatedEvent } from '@/app/types/Realtime';

export function applyOrderUpdated(
  queryClient: QueryClient,
  userId: string,
  event: OrderUpdatedEvent,
) {
  const orderKeys = queryKeys.user(userId).orders;

  queryClient.setQueryData<Order>(orderKeys.detail(event.resource.id), (order) =>
    !order || order.version < event.version ? event.data : order,
  );
  queryClient.invalidateQueries({ queryKey: orderKeys.all(), refetchType: 'none' });

  // a confirmed order removes the purchased items from the cart on the server
  if (event.data.status === OrderStatus.CONFIRMED) {
    const cartKeys = getCartKeys(userId);

    queryClient.invalidateQueries({ queryKey: cartKeys.cart });
    queryClient.invalidateQueries({ queryKey: cartKeys.quotes });
  }
}

export function reconcileOrders(queryClient: QueryClient, userId: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.user(userId).orders.all() });
}
