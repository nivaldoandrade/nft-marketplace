import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import {
  ErrorCode,
  getApiErrorCode,
  getApiErrorDetail,
  getApiErrorFields,
  getErrorMessage,
} from '@/app/errors/apiErrors';
import { useCreateOrder } from '@/app/hooks/mutations/orders/useCreateOrder';
import {
  useConnectWallet,
  useDisconnectWallet,
} from '@/app/hooks/mutations/wallets/useWalletMutations';
import { useCart } from '@/app/hooks/queries/cart/useCart';
import { useCartQuote } from '@/app/hooks/queries/cart/useCartQuote';
import { toast } from '@/app/libs/toast';
import type { Quote } from '@/app/types/Quote';
import type { User } from '@/app/types/User';
import type { Wallet, WalletConnection } from '@/app/types/Wallet';
import { isBlockingIssue } from '@/ui/pages/cart/components/itemIssueMessage';
import { checkoutDraft } from '@/ui/pages/checkout/checkoutDraft';
import { describeQuoteChanges } from '@/ui/pages/checkout/quoteChanges';
import { checkoutSchema, type CheckoutSchema } from '@/ui/pages/checkout/schema';
import { walletProviderLabels } from '@/ui/utils/labels';

export type CheckoutReview = {
  quote: Quote;
  changes: string[];
  error: string | null;
};

type UseCheckoutParams = {
  user: User;
  wallets: Wallet[];
  connection: WalletConnection | null;
};

function toFormValues(wallet: Wallet, user: User, note = ''): CheckoutSchema {
  return {
    displayName: wallet.displayName || user.displayName,
    username: user.username,
    profileName: wallet.profileName,
    network: wallet.network,
    walletAddress: wallet.address,
    secondaryAddress: wallet.secondaryAddress ?? '',
    provider: wallet.provider,
    referralCode: wallet.referralCode,
    email: wallet.email || user.email,
    ensName: wallet.ensName,
    note,
  };
}

export function useCheckout({ user, wallets, connection }: UseCheckoutParams) {
  const navigate = useNavigate();
  const { items } = useCart();
  const { connectWallet, isConnecting } = useConnectWallet();
  const { disconnectWallet, isDisconnecting } = useDisconnectWallet();
  const { createOrder, isCreating } = useCreateOrder();

  const [initialDraft] = useState(() => checkoutDraft.read(user.id));
  const [walletId, setWalletId] = useState(
    () =>
      wallets.find(({ id }) => id === initialDraft?.walletId)?.id ??
      wallets.find(({ id }) => id === connection?.walletId)?.id ??
      wallets[0].id,
  );
  const selectedWallet = wallets.find(({ id }) => id === walletId) ?? wallets[0];

  const form = useForm<CheckoutSchema>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: initialDraft?.values ?? {
      ...toFormValues(selectedWallet, user),
      provider: connection?.provider ?? selectedWallet.provider,
    },
  });
  const values = useWatch({ control: form.control }) as CheckoutSchema;
  const { network, provider } = values;

  const {
    quote,
    isPending: isQuotePending,
    isFetching: isQuoteFetching,
    refetch: refetchQuote,
  } = useCartQuote({ enabled: items.length > 0, network });

  // values the collector has seen; anything different at confirmation needs a new review
  const [acknowledgedQuote, setAcknowledgedQuote] = useState<Quote | null>(null);

  if (quote && quote.network === network && acknowledgedQuote?.network !== network) {
    setAcknowledgedQuote(quote);
  }

  const [review, setReview] = useState<CheckoutReview | null>(null);
  const hasBlockingIssues = (quote?.issues ?? []).some(isBlockingIssue);

  useEffect(() => {
    checkoutDraft.save({ userId: user.id, walletId, values });
  }, [user.id, walletId, values]);

  function handleSelectWallet(id: string) {
    const wallet = wallets.find((item) => item.id === id);

    if (!wallet || id === walletId) {
      return;
    }

    setWalletId(id);
    form.reset(toFormValues(wallet, user, form.getValues('note')));
  }

  async function ensureConnection() {
    if (connection?.walletId === selectedWallet.id && connection.provider === provider) {
      return true;
    }

    const toastId = toast.loading(`Conectando à ${walletProviderLabels[provider]}…`);

    try {
      await connectWallet({ walletId: selectedWallet.id, provider });
      toast.success(`${selectedWallet.nickname} conectada.`, { id: toastId });
      return true;
    } catch (error) {
      toast.error(getErrorMessage(getApiErrorCode(error)), { id: toastId });
      return false;
    }
  }

  const handleConfirm = form.handleSubmit(
    async () => {
      if (hasBlockingIssues) {
        toast.error('Ajuste os itens indisponíveis no carrinho para finalizar.');
        return;
      }

      if (!(await ensureConnection())) {
        return;
      }

      const { data: freshQuote, isError } = await refetchQuote();

      if (!freshQuote || isError) {
        toast.error('Não foi possível atualizar os valores. Tente novamente.');
        return;
      }

      setReview({
        quote: freshQuote,
        changes: describeQuoteChanges(acknowledgedQuote ?? freshQuote, freshQuote),
        error: null,
      });
    },
    () => toast.error('Revise os dados do colecionador para continuar.'),
  );

  async function handlePay() {
    if (!review) {
      return;
    }

    const { note, ...collector } = form.getValues();

    try {
      const order = await createOrder({
        quoteId: review.quote.id,
        walletId: selectedWallet.id,
        network,
        collector: { ...collector, note },
      });

      checkoutDraft.clear();
      navigate({ to: '/pedidos/$orderId', params: { orderId: order.id }, replace: true });
    } catch (error) {
      handlePayError(error);
    }
  }

  function handlePayError(error: unknown) {
    if (!review) {
      return;
    }

    const code = getApiErrorCode(error);
    const updatedQuote = getApiErrorDetail<Quote>(error, 'quote');

    if (updatedQuote) {
      setReview({
        quote: updatedQuote,
        changes: describeQuoteChanges(review.quote, updatedQuote),
        error: getErrorMessage(code),
      });
      refetchQuote();
      return;
    }

    if (code === ErrorCode.VALIDATION) {
      Object.entries(getApiErrorFields(error) ?? {}).forEach(([name, message]) => {
        form.setError(name.replace(/^collector\./, '') as keyof CheckoutSchema, { message });
      });
      setReview(null);
      toast.error('Revise os dados do colecionador para continuar.');
      return;
    }

    if (code === ErrorCode.WALLET_NOT_CONNECTED) {
      setReview(null);
      toast.error(getErrorMessage(code));
      return;
    }

    setReview({
      ...review,
      error:
        code === ErrorCode.TIMEOUT || code === ErrorCode.NETWORK_ERROR
          ? 'Não foi possível confirmar o envio. Tente novamente: o pedido não será duplicado.'
          : getErrorMessage(code),
    });
  }

  function handleAcceptChanges() {
    if (review) {
      setAcknowledgedQuote(review.quote);
      setReview({ ...review, changes: [], error: null });
    }
  }

  function handleCloseReview() {
    if (!isCreating) {
      setReview(null);
    }
  }

  async function handleDisconnect() {
    try {
      await disconnectWallet();
      toast.success('Carteira desconectada.');
    } catch (error) {
      toast.error(getErrorMessage(getApiErrorCode(error)));
    }
  }

  return {
    form,
    errors: form.formState.errors,
    register: form.register,
    control: form.control,
    selectedWallet,
    connectedWallet: wallets.find(({ id }) => id === connection?.walletId) ?? null,
    connection,
    network,
    quote,
    isQuotePending,
    isQuoteUpdating: isQuoteFetching && !isQuotePending,
    hasBlockingIssues,
    review,
    isConnecting,
    isDisconnecting,
    isCreating,
    isSubmitting: form.formState.isSubmitting,
    handleSelectWallet,
    handleConfirm,
    handlePay,
    handleAcceptChanges,
    handleCloseReview,
    handleDisconnect,
  };
}
