import { createFileRoute, redirect } from '@tanstack/react-router';

import { pendingOrdersQueryOptions } from '@/app/hooks/queries/orders/useOrder';
import { queryKeys } from '@/app/libs/queryKeys';
import { requireAuth } from '@/app/router/requireAuth';
import type { AuthService } from '@/app/services/AuthService';
import { Checkout } from '@/ui/pages/checkout';

export const Route = createFileRoute('/pagamento')({
  beforeLoad: async (args) => {
    requireAuth(args);

    const { queryClient } = args.context;
    const userId = queryClient.getQueryData<AuthService.Session>(queryKeys.session())?.user.id;
    const pending = userId
      ? await queryClient.query(pendingOrdersQueryOptions(userId)).catch(() => null)
      : null;

    // a pending order is resumed instead of starting a new checkout
    if (pending?.items[0]) {
      throw redirect({ to: '/pedidos/$orderId', params: { orderId: pending.items[0].id } });
    }
  },
  component: Checkout,
});
