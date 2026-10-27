import { createFileRoute } from '@tanstack/react-router';

import { requireAuth } from '@/app/router/requireAuth';
import { OrderConfirmation } from '@/ui/pages/orderConfirmation';

export const Route = createFileRoute('/pedidos/$orderId')({
  beforeLoad: requireAuth,
  component: OrderConfirmation,
});
