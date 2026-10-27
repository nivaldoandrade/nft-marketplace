import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { WalletSlot } from '@/app/types/Wallet';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { usePageTitle } from '@/ui/hooks/usePageTitle';
import { WalletForm } from '@/ui/pages/wallets/components/WalletForm';
import { useWalletsPage } from '@/ui/pages/wallets/useWalletsPage';
import { cn } from '@/ui/utils/cn';

const linkButtonClassName = 'text-base leading-4 font-medium text-accent hover:underline';

export function Wallets() {
  usePageTitle('Carteiras');
  const { user } = useAuth();
  const {
    primary,
    secondary,
    isPending,
    isError,
    refetch,
    isAddingPrimary,
    isAddingSecondary,
    isCopyingPrimary,
    handleAdd,
    handleCancelAdd,
    handleCopyPrimary,
  } = useWalletsPage();

  if (isError) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-muted-foreground">Não foi possível carregar as carteiras.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="h-10 rounded-md bg-primary px-5 font-bold text-primary-foreground pressable hover:bg-accent"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (isPending || !user) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-[460px]" />
      </div>
    );
  }

  const isSecondaryCopy = !!primary && !!secondary && primary.address === secondary.address;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="sr-only">Carteiras</h1>

      <section aria-labelledby="primary-wallet-title" className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <h2 id="primary-wallet-title" className="text-[17px] leading-4 font-bold">
              Carteira principal
            </h2>
            {!primary && !isAddingPrimary && (
              <button
                type="button"
                onClick={() => handleAdd(WalletSlot.PRIMARY)}
                className={linkButtonClassName}
              >
                Adicionar
              </button>
            )}
          </div>
          <p className="text-sm leading-[15px] text-muted-foreground">
            Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
          </p>
        </div>

        {primary || isAddingPrimary ? (
          <WalletForm
            key={primary?.updatedAt ?? 'new-primary'}
            slot={WalletSlot.PRIMARY}
            wallet={primary}
            user={user}
            onSaved={handleCancelAdd}
          />
        ) : (
          <p className="text-sm leading-[15px] text-muted-foreground">
            Você ainda não adicionou uma carteira principal.
          </p>
        )}
      </section>

      <section aria-labelledby="secondary-wallet-title" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <h2 id="secondary-wallet-title" className="text-[17px] leading-4 font-bold">
            Carteira secundária
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyPrimary}
              disabled={!primary || isCopyingPrimary}
              aria-pressed={isSecondaryCopy}
              className="flex items-center gap-2 text-sm leading-4 disabled:cursor-not-allowed disabled:text-subtle"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-4 place-content-center rounded-full border-[1.2px]',
                  primary ? 'border-primary' : 'border-input',
                )}
              >
                {isSecondaryCopy && <span className="size-2 rounded-full bg-primary" />}
              </span>
              Igual à carteira principal
            </button>
            {!secondary && !isAddingSecondary && (
              <button
                type="button"
                onClick={() => handleAdd(WalletSlot.SECONDARY)}
                className={linkButtonClassName}
              >
                Adicionar
              </button>
            )}
          </div>
        </div>

        {secondary || isAddingSecondary ? (
          <div className="mt-3">
            <WalletForm
              key={secondary?.updatedAt ?? 'new-secondary'}
              slot={WalletSlot.SECONDARY}
              wallet={secondary}
              user={user}
              onSaved={handleCancelAdd}
            />
          </div>
        ) : (
          <p className="text-sm leading-[15px] text-muted-foreground">
            Você ainda não adicionou uma carteira secundária.
          </p>
        )}
      </section>
    </div>
  );
}
