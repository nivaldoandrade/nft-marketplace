import { Link } from '@tanstack/react-router';

import { type Order, OrderStatus } from '@/app/types/Order';
import { formatEth } from '@/app/utils/eth';
import { Container } from '@/ui/components/Container';
import { CloseIcon, ThankYouIcon, WarningIcon } from '@/ui/components/Icons';
import { Skeleton } from '@/ui/components/ui/skeleton';
import {
  explorerNames,
  useOrderConfirmation,
} from '@/ui/pages/orderConfirmation/useOrderConfirmation';
import { cn } from '@/ui/utils/cn';
import { formatAddress } from '@/ui/utils/formatAddress';
import { formatShortDate } from '@/ui/utils/formatDate';
import { formatPrice } from '@/ui/utils/formatPrice';
import { networkLabels, walletProviderLabels } from '@/ui/utils/labels';
import { CATALOG_SECTION_ID } from '@/ui/utils/sections';

const primaryButtonClassName =
  'flex h-12 items-center justify-center rounded-[5px] bg-primary px-4 text-base font-bold text-primary-foreground pressable hover:bg-accent';

const secondaryButtonClassName =
  'flex h-12 items-center justify-center rounded-[5px] border border-border px-4 text-base font-bold hover:border-primary';

export function OrderConfirmation() {
  const { order, isPending, isError, isNotFound, refetch, handleOpenExplorer } =
    useOrderConfirmation();

  return (
    <Container className="px-4 pt-8 sm:px-7 md:px-6 md:pt-[65px]">
      <h1 className="sr-only">Confirmação do pedido</h1>
      <article className="relative mx-auto flex max-w-[578px] flex-col bg-card after:h-2.5 after:bg-primary">
        <Link
          to="/"
          hash={CATALOG_SECTION_ID}
          aria-label="Fechar e voltar ao catálogo"
          className="absolute top-2.5 right-[7px] flex size-8 items-center justify-center text-primary hover:text-accent"
        >
          <CloseIcon className="size-3" />
        </Link>

        {isNotFound ? (
          <Feedback
            title="Pedido não encontrado"
            description="Confira o link ou acompanhe seus pedidos pelo perfil."
          />
        ) : isError ? (
          <Feedback title="Não foi possível carregar o pedido" onRetry={() => refetch()} />
        ) : isPending || !order ? (
          <ReceiptSkeleton />
        ) : (
          <Receipt order={order} onOpenExplorer={handleOpenExplorer} />
        )}
      </article>
    </Container>
  );
}

type ReceiptProps = {
  order: Order;
  onOpenExplorer: () => void;
};

const statusContent = {
  [OrderStatus.PENDING]: {
    title: 'Aguardando confirmação na rede…',
    note: 'Assine a transação na sua carteira. Esta página é atualizada assim que a rede responder, mesmo se você recarregar ou reconectar.',
  },
  [OrderStatus.CONFIRMED]: {
    title: 'Seus NFTs agora estão na sua carteira',
    note: '',
  },
  [OrderStatus.DECLINED]: {
    title: 'Pagamento recusado',
    note: 'Nenhum valor foi cobrado e seus itens continuam no carrinho.',
  },
};

function Receipt({ order, onOpenExplorer }: ReceiptProps) {
  const isConfirmed = order.status === OrderStatus.CONFIRMED;
  const isDeclined = order.status === OrderStatus.DECLINED;
  const content = statusContent[order.status];
  const note = isConfirmed
    ? `Transação confirmada na ${networkLabels[order.network]}. A propriedade foi transferida para sua carteira conectada e registrada na rede.`
    : content.note;

  return (
    <>
      <header className="flex flex-col items-center gap-4 px-12 pt-[22px] pb-[22px] text-center">
        {isConfirmed ? (
          <ThankYouIcon className="size-20 text-primary" />
        ) : isDeclined ? (
          <WarningIcon className="size-16 text-coral" />
        ) : (
          <span
            aria-hidden="true"
            className="my-2 size-16 rounded-full border-4 border-primary/25 border-t-primary motion-safe:animate-spin"
          />
        )}
        <h2
          role="status"
          className={cn(
            'text-base leading-5 font-bold',
            isDeclined ? 'text-coral' : 'text-muted-foreground',
          )}
        >
          {content.title}
        </h2>
        {isDeclined && order.declineReason && (
          <p className="-mt-2 text-sm leading-5 text-muted-foreground">{order.declineReason}</p>
        )}
      </header>

      <dl className="grid grid-cols-2 gap-y-3 border-y border-primary px-5 py-3 text-muted-foreground sm:flex sm:justify-between sm:px-9 sm:py-2.5">
        <MetaItem
          label={isConfirmed ? 'ID da transação' : 'Pedido'}
          value={
            isConfirmed && order.transactionHash ? formatAddress(order.transactionHash) : order.id
          }
          isLabelBold
        />
        <MetaItem label="Data" value={formatShortDate(order.updatedAt)} />
        <MetaItem label="Total" value={formatPrice(order.total)} />
        <MetaItem
          label="Carteira"
          value={walletProviderLabels[order.wallet.provider]}
          isLabelBold
        />
      </dl>

      <section
        aria-labelledby="order-details-title"
        className="flex flex-col gap-3 px-5 pt-5 pb-12 sm:px-11"
      >
        <h3 id="order-details-title" className="text-[15px] leading-4 font-bold">
          Detalhes da transação
        </h3>
        <div className="flex justify-between border-b border-primary/30 pb-[11px] text-base leading-4">
          <span className="font-bold">NFTs</span>
          <span className="flex gap-12">
            <span className="hidden font-bold sm:inline">Edições</span>
            <span className="font-medium">Subtotal</span>
          </span>
        </div>
        <ul aria-label="NFTs do pedido" className="flex flex-col gap-3">
          {order.items.map((item) => (
            <li key={item.itemId} className="flex min-h-14 items-center gap-3 sm:h-[70px]">
              <img
                src={item.image}
                alt=""
                width={70}
                height={70}
                className="size-14 shrink-0 rounded-lg object-cover sm:size-[66px]"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-[15px] leading-5 font-bold break-words sm:truncate sm:text-base sm:leading-4">
                  {item.name}
                </span>
                <span className="text-[13px] leading-4 break-words text-subtle sm:truncate sm:text-sm">
                  ID do token: {item.tokenId}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-12">
                <span className="order-2 text-sm leading-4 text-muted-foreground sm:order-1">
                  <span className="sr-only">Quantidade: </span>(x {item.quantity})
                </span>
                <span className="order-1 text-base leading-4 font-bold whitespace-nowrap text-accent sm:order-2 sm:text-lg">
                  {formatPrice(item.lineTotal)}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <dl className="flex flex-col gap-3 self-end text-[15px] leading-5 sm:w-[321px]">
          {order.couponCode && (
            <div className="flex items-baseline justify-between gap-8">
              <dt>Desconto ({order.couponCode})</dt>
              <dd className="whitespace-nowrap">
                (-) {formatEth(order.discount)} <span className="sr-only">ETH</span>
              </dd>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-8">
            <dt>Taxa de rede</dt>
            <dd className="text-lg leading-4 whitespace-nowrap">{formatPrice(order.networkFee)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-8 font-bold">
            <dt className="text-base leading-4">Total</dt>
            <dd className="text-lg leading-4 whitespace-nowrap text-accent">
              {formatPrice(order.total)}
            </dd>
          </div>
        </dl>

        <div className="flex flex-col items-center gap-12 border-t border-primary/30 pt-3">
          <p className="text-center text-sm leading-[22px] text-muted-foreground">
            {note}
            {order.status === OrderStatus.PENDING && (
              <span className="mt-1 block text-[13px] text-subtle">
                Carteira {order.wallet.nickname} · {formatAddress(order.wallet.address)}
              </span>
            )}
          </p>

          {isConfirmed && (
            <button type="button" onClick={onOpenExplorer} className={primaryButtonClassName}>
              Ver no {explorerNames[order.network]}
            </button>
          )}
          {isDeclined && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/pagamento" className={primaryButtonClassName}>
                Voltar ao pagamento
              </Link>
              <Link to="/carrinho" className={secondaryButtonClassName}>
                Ver carrinho
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function MetaItem({
  label,
  value,
  isLabelBold = false,
}: {
  label: string;
  value: string;
  isLabelBold?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col sm:border-l sm:border-primary sm:pl-[18px] sm:first:border-l-0 sm:first:pl-0">
      <dt className={cn('text-sm leading-4', isLabelBold && 'font-bold')}>{label}</dt>
      <dd className="truncate text-[15px] leading-5">{value}</dd>
    </div>
  );
}

function Feedback({
  title,
  description,
  onRetry,
}: {
  title: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <h2 className="text-lg font-bold">{title}</h2>
      {description && <p className="text-sm leading-6 text-muted-foreground">{description}</p>}
      {onRetry ? (
        <button type="button" onClick={onRetry} className={primaryButtonClassName}>
          Tentar novamente
        </button>
      ) : (
        <Link to="/" hash={CATALOG_SECTION_ID} className={primaryButtonClassName}>
          Voltar ao catálogo
        </Link>
      )}
    </div>
  );
}

function ReceiptSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-8 sm:px-11">
      <Skeleton className="h-20 w-[65px]" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="mt-6 h-12 w-full" />
      <Skeleton className="h-[234px] w-full" />
    </div>
  );
}
