import type { Wallet } from '@/app/types/Wallet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/components/ui/dropdown-menu';
import { radioClassName } from '@/ui/pages/checkout/components/ProviderOptions';
import { cn } from '@/ui/utils/cn';
import { formatAddress } from '@/ui/utils/formatAddress';
import { networkLabels } from '@/ui/utils/labels';
import { notifyUnavailable } from '@/ui/utils/notifyUnavailable';

type WalletCardsProps = {
  wallets: Wallet[];
  selectedId: string;
  onSelect: (walletId: string) => void;
};

function networkDescription(wallet: Wallet) {
  return wallet.network === 'ethereum'
    ? 'Rede principal Ethereum'
    : `Rede ${networkLabels[wallet.network]}`;
}

export function WalletCards({ wallets, selectedId, onSelect }: WalletCardsProps) {
  return (
    <div role="radiogroup" aria-label="Carteira cadastrada" className="flex flex-col gap-5">
      {wallets.map((wallet) => (
        <div
          key={wallet.id}
          className={cn(
            'relative flex h-[93px] items-start gap-[19px] rounded-[14px] bg-card pt-[15px] pr-3 pl-[19px] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
            wallet.id === selectedId && 'shadow-[0_6px_20px_rgba(10,6,4,0.45)]',
          )}
        >
          <input
            id={`wallet-${wallet.id}`}
            type="radio"
            name="checkout-wallet"
            value={wallet.id}
            checked={wallet.id === selectedId}
            onChange={() => onSelect(wallet.id)}
            className={cn(radioClassName, 'relative z-10 mt-[24px] outline-none')}
          />
          <label
            htmlFor={`wallet-${wallet.id}`}
            className="flex min-w-0 flex-1 cursor-pointer flex-col text-sm leading-[22px] text-muted-foreground after:absolute after:inset-0"
          >
            <strong className="mb-1.5 text-base leading-4 text-foreground">
              {wallet.nickname}
            </strong>
            <span className="truncate">
              {wallet.secondaryAddress ?? formatAddress(wallet.address)}
            </span>
            <span>{networkDescription(wallet)}</span>
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Opções da carteira ${wallet.nickname}`}
              className="relative z-10 mt-6 flex h-8 w-6 items-center justify-center rounded-md text-subtle hover:text-accent"
            >
              <span aria-hidden="true" className="flex flex-col gap-[3px]">
                <span className="size-[3px] rounded-full bg-current" />
                <span className="size-[3px] rounded-full bg-current" />
                <span className="size-[3px] rounded-full bg-current" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border bg-card font-sans">
              <DropdownMenuItem onSelect={() => notifyUnavailable('A edição de carteiras')}>
                Editar carteira
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}
