import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { getErrorMessage, getApiErrorCode } from '@/app/errors/apiErrors';
import { useRemoveCartItem, useUpdateCartItem } from '@/app/hooks/mutations/cart/useCartActions';
import { useCart } from '@/app/hooks/queries/cart/useCart';
import { useCartQuote } from '@/app/hooks/queries/cart/useCartQuote';
import { toast } from '@/app/libs/toast';
import { AuthMode } from '@/app/router/authSearch';
import type { CartItem } from '@/app/types/Cart';
import { QuoteIssueType } from '@/app/types/Quote';
import { useAuthModal } from '@/ui/hooks/useAuthModal';
import { notifyUnavailable } from '@/ui/utils/notifyUnavailable';

export function getItemMaxQuantity(item: CartItem) {
  return Math.max(Math.min(item.available, item.maxPerOrder), 1);
}

export function useCartPage() {
  const { isSignedIn } = useAuth();
  const { open: openAuthModal } = useAuthModal();
  const { items, itemsCount, isPending, isError, isEmpty, refetch } = useCart();
  const {
    quote,
    isPending: isQuotePending,
    isFetching: isQuoteFetching,
  } = useCartQuote({
    enabled: items.length > 0,
  });
  const { updateCartItem } = useUpdateCartItem();
  const { removeCartItem } = useRemoveCartItem();

  const itemIssues = new Map(
    (quote?.issues ?? []).flatMap((issue) => (issue.itemId ? [[issue.itemId, issue]] : [])),
  );
  const hasBlockingIssues = (quote?.issues ?? []).some(
    (issue) =>
      issue.type === QuoteIssueType.UNAVAILABLE || issue.type === QuoteIssueType.QUANTITY_EXCEEDED,
  );

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

  function handleCheckout() {
    if (!isSignedIn) {
      openAuthModal(AuthMode.SIGN_IN);
      return;
    }

    notifyUnavailable('O pagamento');
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
    handleCheckout,
  };
}
