import { Link } from '@tanstack/react-router';

import type { Network } from '@/app/types/Nft';
import type { Wallet, WalletProvider } from '@/app/types/Wallet';
import { formatEth } from '@/app/utils/eth';
import { WarningIcon } from '@/ui/components/Icons';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/ui/components/ui/dialog';
import { isBlockingIssue } from '@/ui/pages/cart/components/itemIssueMessage';
import type { CheckoutReview } from '@/ui/pages/checkout/useCheckout';
import { formatAddress } from '@/ui/utils/formatAddress';
import { formatPrice } from '@/ui/utils/formatPrice';
import { networkLabels, walletProviderLabels } from '@/ui/utils/labels';

type ReviewDialogProps = {
  review: CheckoutReview | null;
  wallet: Wallet;
  walletAddress: string;
  provider: WalletProvider;
  network: Network;
  isPaying: boolean;
  onAcceptChanges: () => void;
  onPay: () => void;
  onClose: () => void;
};

const rowClassName = 'flex items-baseline justify-between gap-4 text-[15px] leading-5';

export function ReviewDialog({
  review,
  wallet,
  walletAddress,
  provider,
  network,
  isPaying,
  onAcceptChanges,
  onPay,
  onClose,
}: ReviewDialogProps) {
  if (!review) {
    return null;
  }

  const { quote, changes, error } = review;
  const hasChanges = changes.length > 0;
  const isBlocked = quote.issues.some(isBlockingIssue) || quote.items.length === 0;

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        onInteractOutside={(event) => isPaying && event.preventDefault()}
        onEscapeKeyDown={(event) => isPaying && event.preventDefault()}
        className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[480px] gap-0 overflow-y-auto border-border bg-card p-6 sm:max-w-[480px]"
      >
        <DialogTitle className="text-lg leading-6 font-bold">
          {hasChanges ? 'Os valores mudaram' : 'Revise seu pedido'}
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm leading-5 text-muted-foreground">
          {hasChanges
            ? 'Confira as mudanças antes de continuar. A compra só é enviada com a sua confirmação.'
            : 'Confirme os dados abaixo para assinar a transação na sua carteira.'}
        </DialogDescription>

        {hasChanges && (
          <ul
            role="alert"
            className="mt-4 flex flex-col gap-2 rounded-md border border-amber/40 bg-amber/10 p-3 text-sm leading-5"
          >
            {changes.map((change) => (
              <li key={change} className="flex gap-2">
                <WarningIcon className="mt-0.5 size-4 shrink-0 text-amber" />
                {change}
              </li>
            ))}
          </ul>
        )}

        <ul aria-label="NFTs do pedido" className="mt-5 flex flex-col gap-3">
          {quote.items.map((item) => (
            <li key={item.itemId} className="flex items-center gap-3">
              <img
                src={item.image}
                alt=""
                width={48}
                height={48}
                className="size-12 rounded-md object-cover"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-sm leading-4 font-bold">{item.name}</span>
                <span className="text-[13px] leading-4 text-subtle">
                  {item.available === 0
                    ? 'Esgotado'
                    : `${item.quantity} × ${formatPrice(item.unitPrice)}`}
                </span>
              </span>
              <span className="text-sm leading-4 font-bold whitespace-nowrap text-accent">
                {formatPrice(item.lineTotal)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 flex flex-col gap-2 border-t border-primary/30 pt-4">
          <div className={rowClassName}>
            <dt className="text-muted-foreground">Carteira</dt>
            <dd className="text-right">
              {wallet.nickname} · {walletProviderLabels[provider]}
              <span className="block text-[13px] text-subtle">{formatAddress(walletAddress)}</span>
            </dd>
          </div>
          <div className={rowClassName}>
            <dt className="text-muted-foreground">Rede</dt>
            <dd>{networkLabels[network]}</dd>
          </div>
          <div className={rowClassName}>
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPrice(quote.subtotal)}</dd>
          </div>
          {quote.coupon && (
            <div className={rowClassName}>
              <dt className="text-muted-foreground">Desconto ({quote.coupon.code})</dt>
              <dd>
                (-) {formatEth(quote.discount)} <span className="sr-only">ETH</span>
              </dd>
            </div>
          )}
          <div className={rowClassName}>
            <dt className="text-muted-foreground">Taxa de rede</dt>
            <dd>{formatPrice(quote.networkFee)}</dd>
          </div>
          <div className={`${rowClassName} mt-1 font-bold`}>
            <dt>Total</dt>
            <dd className="text-lg leading-5 text-accent">{formatPrice(quote.total)}</dd>
          </div>
        </dl>

        {error && (
          <p role="alert" className="mt-4 text-[13px] leading-4 text-coral">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPaying}
            className="h-10 rounded-[3px] border border-border px-5 text-[15px] font-bold hover:border-primary disabled:opacity-50"
          >
            Voltar
          </button>
          {isBlocked ? (
            <Link
              to="/carrinho"
              className="flex h-10 items-center justify-center rounded-[3px] bg-primary px-5 text-[15px] font-bold text-primary-foreground pressable hover:bg-accent"
            >
              Ajustar carrinho
            </Link>
          ) : hasChanges ? (
            <button
              type="button"
              onClick={onAcceptChanges}
              className="h-10 rounded-[3px] bg-primary px-5 text-[15px] font-bold text-primary-foreground pressable hover:bg-accent"
            >
              Aceitar novos valores
            </button>
          ) : (
            <button
              type="button"
              onClick={onPay}
              disabled={isPaying}
              aria-busy={isPaying}
              className="h-10 rounded-[3px] bg-primary px-5 text-[15px] font-bold text-primary-foreground pressable hover:bg-accent disabled:cursor-wait disabled:opacity-70"
            >
              {isPaying ? 'Aguardando a carteira…' : error ? 'Tentar novamente' : 'Assinar e pagar'}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
