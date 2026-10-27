import { WalletProvider } from '@/app/types/Wallet';
import { WalletIcon } from '@/ui/components/Icons';
import { cn } from '@/ui/utils/cn';
import { walletProviderLabels } from '@/ui/utils/labels';

type ProviderOptionsProps = {
  name: string;
  value: WalletProvider;
  variant: 'list' | 'cards';
  onChange: (provider: WalletProvider) => void;
};

const providers = [WalletProvider.WALLETCONNECT, WalletProvider.METAMASK, WalletProvider.COINBASE];

export const radioClassName =
  'grid size-4 shrink-0 appearance-none place-content-center rounded-full border-[1.2px] border-input before:size-2 before:rounded-full before:bg-primary before:opacity-0 checked:border-primary checked:before:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

function ProviderMark({ provider }: { provider: WalletProvider }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-sm leading-[18px] font-bold text-accent"
    >
      {provider === WalletProvider.COINBASE ? (
        <WalletIcon className="size-6 text-primary" />
      ) : (
        walletProviderLabels[provider][0]
      )}
    </span>
  );
}

export function ProviderOptions({ name, value, variant, onChange }: ProviderOptionsProps) {
  const isCards = variant === 'cards';

  return (
    <div
      role="radiogroup"
      aria-label="Carteira"
      className={cn('flex flex-col', isCards ? 'gap-4' : 'gap-4')}
    >
      {providers.map((provider) => {
        const isSelected = provider === value;

        return (
          <label
            key={provider}
            className={cn(
              'flex cursor-pointer items-center has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
              isCards
                ? 'h-[65px] flex-row-reverse justify-between gap-3 rounded-[15px] bg-card pr-4 pl-3.5 shadow-[0_6px_20px_rgba(10,6,4,0.45)]'
                : 'h-[45px] gap-2.5 rounded-[3px] border px-3 text-[15px] leading-5',
              !isCards && (isSelected ? 'border-primary' : 'border-border hover:border-input'),
            )}
          >
            <input
              type="radio"
              name={name}
              value={provider}
              checked={isSelected}
              onChange={() => onChange(provider)}
              className={cn(radioClassName, 'outline-none', !isCards && 'border-primary')}
            />
            <span className={cn('flex items-center gap-3', isCards && 'mr-auto text-sm leading-4')}>
              {isCards && <ProviderMark provider={provider} />}
              {walletProviderLabels[provider]}
            </span>
          </label>
        );
      })}
    </div>
  );
}
