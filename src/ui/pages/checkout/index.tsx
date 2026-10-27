import { useIsMutating, useMutationState } from '@tanstack/react-query';
import { Navigate, useCanGoBack, useRouter } from '@tanstack/react-router';
import { useState } from 'react';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { CREATE_ORDER_MUTATION_KEY } from '@/app/hooks/mutations/orders/useCreateOrder';
import { useCart } from '@/app/hooks/queries/cart/useCart';
import { useWallets } from '@/app/hooks/queries/wallets/useWallets';
import type { User } from '@/app/types/User';
import type { Wallet, WalletConnection } from '@/app/types/Wallet';
import { WalletSlot } from '@/app/types/Wallet';
import { Breadcrumb } from '@/ui/components/Breadcrumb';
import { Container } from '@/ui/components/Container';
import { ArrowLeftIcon } from '@/ui/components/Icons';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { CheckoutTotals } from '@/ui/pages/checkout/components/CheckoutTotals';
import { CollectorForm } from '@/ui/pages/checkout/components/CollectorForm';
import { OrderItems } from '@/ui/pages/checkout/components/OrderItems';
import { ProviderOptions } from '@/ui/pages/checkout/components/ProviderOptions';
import { ReviewDialog } from '@/ui/pages/checkout/components/ReviewDialog';
import { WalletCards } from '@/ui/pages/checkout/components/WalletCards';
import { useCheckout } from '@/ui/pages/checkout/useCheckout';
import { cn } from '@/ui/utils/cn';
import { formatPrice } from '@/ui/utils/formatPrice';
import { walletProviderLabels } from '@/ui/utils/labels';
import { notifyUnavailable } from '@/ui/utils/notifyUnavailable';

export function Checkout() {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const { user } = useAuth();
  const cart = useCart();
  const [openedAt] = useState(() => Date.now());
  const isCreatingOrder = useIsMutating({ mutationKey: CREATE_ORDER_MUTATION_KEY }) > 0;
  const hasPlacedOrder =
    useMutationState({
      filters: {
        mutationKey: CREATE_ORDER_MUTATION_KEY,
        status: 'success',
        predicate: (mutation) => mutation.state.submittedAt >= openedAt,
      },
    }).length > 0;
  const wallets = useWallets();

  function handleBack() {
    if (canGoBack) {
      router.history.back();
      return;
    }

    router.navigate({ to: '/carrinho' });
  }

  // a confirmed order empties the cart while its response is pending or the page is navigating to it
  if (cart.isEmpty && !isCreatingOrder && !hasPlacedOrder) {
    return <Navigate to="/carrinho" replace />;
  }

  const isError = cart.isError || wallets.isError;
  const isPending = cart.isPending || wallets.isPending;

  return (
    <Container className="flex flex-col px-4 pt-8 pb-36 min-[360px]:px-7 md:px-6 md:pb-0">
      <div className="relative flex h-11 justify-center md:contents">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Voltar"
          className="absolute top-0 left-0 flex size-[35px] items-center justify-center rounded-full border border-border bg-secondary pressable hover:text-accent md:hidden"
        >
          <ArrowLeftIcon className="size-5" />
        </button>
        <h1 className="pt-[9px] text-xl leading-4 font-bold md:sr-only">Pagamento com carteira</h1>
      </div>
      <Breadcrumb current="Pagamento" className="hidden md:block" />

      {isError ? (
        <div role="alert" className="mt-8 flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-muted-foreground">Não foi possível carregar o pagamento.</p>
          <button
            type="button"
            onClick={() => {
              cart.refetch();
              wallets.refetch();
            }}
            className="h-10 rounded-md bg-primary px-5 font-bold text-primary-foreground pressable hover:bg-accent"
          >
            Tentar novamente
          </button>
        </div>
      ) : isPending || !user ? (
        <CheckoutSkeleton />
      ) : wallets.wallets.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-md bg-card px-6 py-12 text-center">
          <h2 className="text-lg font-bold">Cadastre uma carteira para continuar</h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            As compras são pagas e recebidas pelas carteiras cadastradas no seu perfil.
          </p>
          <button
            type="button"
            onClick={() => notifyUnavailable('O cadastro de carteiras')}
            className="mt-2 rounded-md bg-primary px-6 py-2.5 font-bold text-primary-foreground pressable hover:bg-accent"
          >
            Cadastrar carteira
          </button>
        </div>
      ) : (
        <CheckoutContent user={user} wallets={wallets.wallets} connection={wallets.connection} />
      )}
    </Container>
  );
}

type CheckoutContentProps = {
  user: User;
  wallets: Wallet[];
  connection: WalletConnection | null;
};

function CheckoutContent({ user, wallets, connection }: CheckoutContentProps) {
  const {
    form,
    errors,
    register,
    control,
    selectedWallet,
    connectedWallet,
    network,
    quote,
    isQuoteUpdating,
    hasBlockingIssues,
    review,
    isConnecting,
    isDisconnecting,
    isCreating,
    isSubmitting,
    handleSelectWallet,
    handleConfirm,
    handlePay,
    handleAcceptChanges,
    handleCloseReview,
    handleDisconnect,
  } = useCheckout({ user, wallets, connection });

  const provider = form.watch('provider');
  const primary = wallets.find(({ slot }) => slot === WalletSlot.PRIMARY) ?? wallets[0];
  const secondary = wallets.find(({ slot }) => slot === WalletSlot.SECONDARY);
  const isBusy = isSubmitting || isConnecting;

  const confirmButton = (
    <button
      type="submit"
      disabled={isBusy || hasBlockingIssues || !quote}
      aria-busy={isBusy}
      className="h-[60px] w-full rounded-[40px] bg-linear-to-br from-primary to-primary/80 text-[15px] font-bold text-primary-foreground pressable disabled:cursor-not-allowed disabled:opacity-60 md:h-[45px] md:rounded-lg md:bg-primary md:bg-none md:hover:bg-accent"
    >
      {isConnecting
        ? 'Conectando à carteira…'
        : isSubmitting
          ? 'Atualizando valores…'
          : 'Confirmar compra'}
    </button>
  );

  return (
    <form
      noValidate
      onSubmit={handleConfirm}
      className="mt-4 flex flex-col gap-6 md:mt-8 lg:grid lg:grid-cols-[minmax(0,763fr)_minmax(0,405fr)] lg:items-start lg:gap-8"
    >
      <div className="hidden md:block">
        <CollectorForm
          register={register}
          control={control}
          errors={errors}
          hasSecondaryWallet={!!secondary}
          isUsingSecondary={selectedWallet.slot === WalletSlot.SECONDARY}
          onToggleSecondary={(isUsingSecondary) =>
            handleSelectWallet(isUsingSecondary && secondary ? secondary.id : primary.id)
          }
        />
      </div>

      <section aria-labelledby="mobile-wallets-title" className="flex flex-col gap-4 md:hidden">
        <div className="flex items-center justify-between gap-4">
          <h2 id="mobile-wallets-title" className="text-base leading-4 font-bold">
            {connectedWallet ? 'Carteira conectada' : 'Escolha a carteira'}
          </h2>
          {connectedWallet && (
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="text-sm leading-4 font-bold text-accent hover:underline disabled:opacity-60"
            >
              Trocar carteira
            </button>
          )}
        </div>
        <WalletCards
          wallets={wallets}
          selectedId={selectedWallet.id}
          onSelect={handleSelectWallet}
        />
      </section>

      <div className="flex flex-col gap-3">
        <section aria-labelledby="order-items-title" className="hidden flex-col gap-3 md:flex">
          <h2 id="order-items-title" className="text-[17px] leading-4 font-bold">
            Seus NFTs
          </h2>
          {quote ? <OrderItems items={quote.items} /> : <Skeleton className="h-[234px]" />}
          <CheckoutTotals quote={quote} isUpdating={isQuoteUpdating} />
        </section>

        <section aria-labelledby="provider-title" className="flex flex-col gap-4 md:gap-5">
          <div className="flex flex-col gap-1">
            <h2
              id="provider-title"
              className="text-base leading-4 font-bold md:text-center md:text-[17px]"
            >
              Carteira e rede
            </h2>
            {connectedWallet && connection && (
              <p className="hidden text-center text-[13px] leading-5 text-muted-foreground md:block">
                Conectada: {connectedWallet.nickname} via{' '}
                {walletProviderLabels[connection.provider]}
                {' · '}
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="text-accent hover:underline disabled:opacity-60"
                >
                  Desconectar
                </button>
              </p>
            )}
          </div>
          <div className="md:hidden">
            <ProviderOptions
              name="provider-mobile"
              variant="cards"
              value={provider}
              onChange={(value) => form.setValue('provider', value, { shouldValidate: true })}
            />
          </div>
          <div className="hidden md:block">
            <ProviderOptions
              name="provider"
              variant="list"
              value={provider}
              onChange={(value) => form.setValue('provider', value, { shouldValidate: true })}
            />
          </div>

          <div className="flex items-baseline justify-end gap-7 text-base leading-4 font-bold md:hidden">
            Total:
            <span className="text-lg leading-4 text-accent">
              {quote ? formatPrice(quote.total) : <Skeleton className="h-4 w-20" />}
            </span>
          </div>

          {hasBlockingIssues && (
            <p role="alert" className="text-[13px] leading-4 text-coral">
              Há itens indisponíveis no carrinho. Ajuste o carrinho para finalizar.
            </p>
          )}

          <div
            className={cn(
              'fixed inset-x-0 bottom-0 z-30 bg-linear-to-t from-background from-70% to-transparent px-7 pt-6 pb-[calc(2rem+env(safe-area-inset-bottom))]',
              'md:static md:z-auto md:mt-1 md:bg-none md:p-0',
            )}
          >
            {confirmButton}
          </div>
        </section>
      </div>

      <ReviewDialog
        review={review}
        wallet={selectedWallet}
        walletAddress={form.getValues('walletAddress')}
        provider={provider}
        network={network}
        isPaying={isCreating}
        onAcceptChanges={handleAcceptChanges}
        onPay={handlePay}
        onClose={handleCloseReview}
      />
    </form>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="mt-4 flex flex-col gap-6 md:mt-8 lg:grid lg:grid-cols-[minmax(0,763fr)_minmax(0,405fr)] lg:gap-8">
      <Skeleton className="hidden h-[640px] md:block" />
      <div className="flex flex-col gap-4 md:hidden">
        <Skeleton className="h-[93px] rounded-[14px]" />
        <Skeleton className="h-[93px] rounded-[14px]" />
      </div>
      <Skeleton className="h-[480px]" />
    </div>
  );
}
