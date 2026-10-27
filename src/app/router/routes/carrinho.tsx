import { createFileRoute } from '@tanstack/react-router';

import { Cart } from '@/ui/pages/cart';

export const Route = createFileRoute('/carrinho')({
  component: Cart,
});
