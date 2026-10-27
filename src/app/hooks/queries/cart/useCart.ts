import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { getCartKeys } from '@/app/hooks/queries/cart/cartKeys';
import { GuestCartManager } from '@/app/libs/GuestCartManager';
import { CartService } from '@/app/services/CartService';
import { Service } from '@/app/services/Service';

async function fetchCart(isGuest: boolean, signal: AbortSignal) {
  const cart = await CartService.get(signal);

  if (isGuest && GuestCartManager.get() !== cart.id) {
    GuestCartManager.save(cart.id);
    Service.setGuestCartId(cart.id);
  }

  return cart;
}

export function useCart() {
  const userId = useAuth().user?.id;
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: getCartKeys(userId).cart,
    queryFn: ({ signal }) => fetchCart(!userId, signal),
  });

  const items = data?.items ?? [];

  return {
    cart: data,
    items,
    itemsCount: items.reduce((total, item) => total + item.quantity, 0),
    isPending,
    isError,
    isEmpty: !isPending && !isError && items.length === 0,
    refetch,
  };
}
