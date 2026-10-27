import { useNavigate } from '@tanstack/react-router';

import { getErrorMessage, getApiErrorCode } from '@/app/errors/apiErrors';
import { useRemoveCartItem, useUpdateCartItem } from '@/app/hooks/mutations/cart/useCartActions';
import { useCart } from '@/app/hooks/queries/cart/useCart';
import { useCartQuote } from '@/app/hooks/queries/cart/useCartQuote';
import { useWallets } from '@/app/hooks/queries/wallets/useWallets';
import { toast } from '@/app/libs/toast';
import type { CartItem } from '@/app/types/Cart';
import { compareEth } from '@/app/utils/eth';
import { useValueChange } from '@/ui/hooks/useValueChange';
import { isBlockingIssue } from '@/ui/pages/cart/components/itemIssueMessage';
import { formatPrice } from '@/ui/utils/formatPrice';

export function getItemMaxQuantity(item: CartItem) {
  return Math.max(Math.min(item.available, item.maxPerOrder), 1);
}

export function useCartPage() {
  const { items, itemsCount, isPending, isError, isEmpty, refetch } = useCart();
  const {
    quote,
    isPending: isQuotePending,
    isFetching: isQuoteFetching,
  } = useCartQuote({
    enabled: items.length > 0,
  });
  const { connection } = useWallets();
  const navigate = useNavigate();
  const { updateCartItem } = useUpdateCartItem();
  const { removeCartItem } = useRemoveCartItem();

  const itemIssues = new Map(
    (quote?.issues ?? []).flatMap((issue) => (issue.itemId ? [[issue.itemId, issue]] : [])),
  );
  const hasBlockingIssues = (quote?.issues ?? []).some(isBlockingIssue);

  // price and availability can change through realtime events while the cart is open
  useValueChange(items, (previousItems, currentItems) => {
    currentItems.forEach((item) => {
      const previous = previousItems.find(({ id }) => id === item.id);

      if (!previous) {
        return;
      }

      if (compareEth(previous.unitPrice, item.unitPrice) !== 0) {
        toast.info(`O preço de ${item.name} mudou para ${formatPrice(item.unitPrice)}.`);
      }

      if (previous.available > 0 && item.available === 0) {
        toast.warning(`${item.name} esgotou. Remova o item para continuar.`);
      } else if (previous.available >= item.quantity && item.available < item.quantity) {
        toast.warning(`Restam apenas ${item.available} unidade(s) de ${item.name}.`);
      }
    });
  });

  function notifyError(error: unknown) {
    toast.error(getErrorMessage(getApiErrorCode(error)));
  }

  function handleChangeQuantity(item: CartItem, quantity: number) {
    updateCartItem({ itemId: item.id, quantity }).catch(notifyError);
  }

  function handleRemove(item: CartItem) {
    removeCartItem(item.id)
      .then(() => toast.success(`${item.name} removido do carrinho.`))
      .catch(notifyError);
  }

  // signed-out collectors go through the login modal and come back to the payment
  function handleCheckout() {
    navigate({ to: '/pagamento' });
  }

  return {
    items,
    itemsCount,
    isPending,
    isError,
    isEmpty,
    refetch,
    quote,
    isQuotePending,
    isQuoteFetching,
    itemIssues,
    hasBlockingIssues,
    handleChangeQuantity,
    handleRemove,
    checkoutLabel: connection ? 'Finalizar compra' : 'Conectar e finalizar',
    handleCheckout,
  };
}
