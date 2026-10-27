import { Controller } from 'react-hook-form';

import { Network } from '@/app/types/Nft';
import type { User } from '@/app/types/User';
import { type Wallet, WalletProvider, type WalletSlot } from '@/app/types/Wallet';
import { EnsDomainSelect } from '@/ui/components/EnsDomainSelect';
import { FormField } from '@/ui/components/FormField';
import {
  fieldInputClassName,
  fieldSelectContentClassName,
  fieldSelectTriggerClassName,
} from '@/ui/components/FormField/styles';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select';
import { useWalletForm } from '@/ui/pages/wallets/components/WalletForm/useWalletForm';
import { cn } from '@/ui/utils/cn';
import { networkLabels, walletProviderLabels } from '@/ui/utils/labels';

type WalletFormProps = {
  slot: WalletSlot;
  wallet: Wallet | null;
  user: User;
  onSaved: () => void;
};

export function WalletForm({ slot, wallet, user, onSaved }: WalletFormProps) {
  const { register, control, errors, isSubmitting, handleSubmit } = useWalletForm({
    slot,
    wallet,
    user,
    onSaved,
  });

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="grid gap-x-7 gap-y-5 md:grid-cols-2">
        <FormField label="Nome de exibição" isRequired error={errors.displayName?.message}>
          {(props) => (
            <input
              {...props}
              {...register('displayName')}
              autoComplete="name"
              className={fieldInputClassName}
            />
          )}
        </FormField>
        <FormField label="Apelido da carteira" isRequired error={errors.nickname?.message}>
          {(props) => (
            <input {...props} {...register('nickname')} className={fieldInputClassName} />
          )}
        </FormField>

        <FormField label="Rede" isRequired error={errors.network?.message}>
          {(props) => (
            <Controller
              control={control}
              name="network"
              render={({ field }) => (
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
                  <SelectTrigger
                    {...props}
                    onBlur={field.onBlur}
                    className={fieldSelectTriggerClassName}
                  >
                    <SelectValue placeholder="Selecione uma rede" />
                  </SelectTrigger>
                  <SelectContent position="popper" className={fieldSelectContentClassName}>
                    {Object.values(Network).map((network) => (
                      <SelectItem key={network} value={network}>
                        {networkLabels[network]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </FormField>
        <FormField label="Nome do perfil" isRequired error={errors.profileName?.message}>
          {(props) => (
            <input {...props} {...register('profileName')} className={fieldInputClassName} />
          )}
        </FormField>

        <FormField label="Endereço da carteira" isRequired error={errors.address?.message}>
          {(props) => (
            <input
              {...props}
              {...register('address')}
              placeholder="Endereço 0x da carteira"
              spellCheck={false}
              className={fieldInputClassName}
            />
          )}
        </FormField>
        <FormField
          label="ENS ou carteira secundária (opcional)"
          isLabelHidden
          error={errors.secondaryAddress?.message}
          className="md:pt-[29px]"
        >
          {(props) => (
            <input
              {...props}
              {...register('secondaryAddress')}
              placeholder="ENS ou carteira secundária (opcional)"
              spellCheck={false}
              className={fieldInputClassName}
            />
          )}
        </FormField>

        <FormField label="Tipo de carteira" isRequired error={errors.provider?.message}>
          {(props) => (
            <Controller
              control={control}
              name="provider"
              render={({ field }) => (
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
                  <SelectTrigger
                    {...props}
                    onBlur={field.onBlur}
                    className={fieldSelectTriggerClassName}
                  >
                    <SelectValue placeholder="Selecione uma carteira" />
                  </SelectTrigger>
                  <SelectContent position="popper" className={fieldSelectContentClassName}>
                    {Object.values(WalletProvider).map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {walletProviderLabels[provider]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </FormField>
        <FormField label="Código de indicação" isRequired error={errors.referralCode?.message}>
          {(props) => (
            <input {...props} {...register('referralCode')} className={fieldInputClassName} />
          )}
        </FormField>

        <FormField label="E-mail" isRequired error={errors.email?.message}>
          {(props) => (
            <input
              {...props}
              {...register('email')}
              type="email"
              autoComplete="email"
              className={fieldInputClassName}
            />
          )}
        </FormField>
        <FormField label="Nome ENS" isRequired error={errors.ensName?.message}>
          {(props) => (
            <div className="flex gap-2.5">
              <EnsDomainSelect />
              <input
                {...props}
                {...register('ensName')}
                spellCheck={false}
                className={cn(fieldInputClassName, 'min-w-0 flex-1')}
              />
            </div>
          )}
        </FormField>
      </div>

      {errors.root?.api && (
        <p role="alert" className="text-[13px] leading-4 text-coral">
          {errors.root.api.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="h-10 w-full rounded-[3px] bg-primary text-sm leading-4 font-bold whitespace-nowrap text-primary-foreground pressable hover:bg-accent disabled:opacity-60 md:w-[131px] md:self-start"
      >
        {isSubmitting ? 'Salvando…' : 'Salvar carteira'}
      </button>
    </form>
  );
}
