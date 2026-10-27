import { queryOptions, useQuery } from '@tanstack/react-query';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { ErrorCode, getApiErrorCode } from '@/app/errors/apiErrors';
import { queryKeys } from '@/app/libs/queryKeys';
import { OrdersService } from '@/app/services/OrdersService';
import { OrderStatus } from '@/app/types/Order';

export function pendingOrdersQueryOptions(userId: string) {
  const params = { status: OrderStatus.PENDING };

  return queryOptions({
    queryKey: queryKeys.user(userId).orders.list(params),
    queryFn: ({ signal }) => OrdersService.list(params, signal),
    staleTime: 0,
  });
}

export function useOrder(orderId: string) {
  const userId = useAuth().user?.id ?? '';
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.user(userId).orders.detail(orderId),
    queryFn: ({ signal }) => OrdersService.get(orderId, signal),
    enabled: !!userId,
  });

  return {
    order: data,
    isPending,
    isError,
    isNotFound: getApiErrorCode(error) === ErrorCode.RESOURCE_NOT_FOUND,
    isForbidden: getApiErrorCode(error) === ErrorCode.FORBIDDEN,
    refetch,
  };
}
