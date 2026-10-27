import { Link, useCanGoBack, useRouter } from '@tanstack/react-router';

import { Breadcrumb } from '@/ui/components/Breadcrumb';
import { Container } from '@/ui/components/Container';
import { ArrowLeftIcon } from '@/ui/components/Icons';
import { usePageTitle } from '@/ui/hooks/usePageTitle';
import { AlsoViewed } from '@/ui/pages/cart/components/AlsoViewed';
import { CartItemCard } from '@/ui/pages/cart/components/CartItemCard';
import { CartSkeleton } from '@/ui/pages/cart/components/CartSkeleton';
import { CartSummary } from '@/ui/pages/cart/components/CartSummary';
import { CartTable } from '@/ui/pages/cart/components/CartTable';
import { useCartPage } from '@/ui/pages/cart/useCartPage';
import { CATALOG_SECTION_ID } from '@/ui/utils/sections';

export function Cart() {
  usePageTitle('Carrinho');
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const {
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
    checkoutLabel,
    handleCheckout,
  } = useCartPage();

  function handleBack() {
    if (canGoBack) {
      router.history.back();
      return;
    }

    router.navigate({ to: '/' });
  }

  return (
    <Container className="flex flex-col px-4 pt-8 min-[360px]:px-7 md:px-6">
      <div className="relative flex h-11 justify-center md:contents">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Voltar"
          className="absolute top-0 left-0 flex size-[35px] items-center justify-center rounded-full border border-border bg-secondary pressable hover:text-accent md:hidden"
        >
          <ArrowLeftIcon className="size-5" />
        </button>
        <h1 className="pt-[9px] text-xl leading-4 font-bold md:sr-only">Carrinho de NFTs</h1>
      </div>
      <Breadcrumb current="Carrinho" className="hidden md:block" />
      <p aria-live="polite" className="sr-only">
        {isPending
          ? ''
          : itemsCount === 1
            ? '1 item no carrinho'
            : `${itemsCount} itens no carrinho`}
      </p>

      {isError ? (
        <div role="alert" className="mt-8 flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-muted-foreground">Não foi possível carregar o carrinho.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="h-10 rounded-md bg-primary px-5 font-bold text-primary-foreground pressable hover:bg-accent"
          >
            Tentar novamente
          </button>
        </div>
      ) : isEmpty ? (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-md bg-card px-6 py-12 text-center">
          <h2 className="text-lg font-bold">Seu carrinho está vazio</h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Explore o catálogo e adicione NFTs para continuar.
          </p>
          <Link
            to="/"
            hash={CATALOG_SECTION_ID}
            className="mt-2 rounded-md bg-primary px-6 py-2.5 font-bold text-primary-foreground pressable hover:bg-accent"
          >
            Explorar o catálogo
          </Link>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_332px] lg:items-start lg:gap-12 xl:gap-[86px]">
          {isPending ? (
            <CartSkeleton />
          ) : (
            <>
              <CartTable
                items={items}
                itemIssues={itemIssues}
                onChangeQuantity={handleChangeQuantity}
                onRemove={handleRemove}
              />
              <ul aria-label="Itens do carrinho" className="flex flex-col gap-5 md:hidden">
                {items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    issue={itemIssues.get(item.id)}
                    onChangeQuantity={handleChangeQuantity}
                    onRemove={handleRemove}
                  />
                ))}
              </ul>
            </>
          )}
          <CartSummary
            quote={quote}
            isPending={isPending || isQuotePending}
            isUpdating={isQuoteFetching && !isQuotePending}
            hasBlockingIssues={hasBlockingIssues}
            checkoutLabel={checkoutLabel}
            onCheckout={handleCheckout}
          />
        </div>
      )}

      <div className="mt-16 md:mt-24">
        <AlsoViewed excludeIds={items.map((item) => item.nftId)} />
      </div>
    </Container>
  );
}
