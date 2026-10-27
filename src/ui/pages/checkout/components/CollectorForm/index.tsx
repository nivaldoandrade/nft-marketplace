import { Controller, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';

import { Network } from '@/app/types/Nft';
import { WalletProvider } from '@/app/types/Wallet';
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
import type { CheckoutSchema } from '@/ui/pages/checkout/schema';
import { cn } from '@/ui/utils/cn';
import { networkLabels, walletProviderLabels } from '@/ui/utils/labels';

type CollectorFormProps = {
  register: UseFormRegister<CheckoutSchema>;
  control: Control<CheckoutSchema>;
  errors: FieldErrors<CheckoutSchema>;
  hasSecondaryWallet: boolean;
  isUsingSecondary: boolean;
  onToggleSecondary: (isUsingSecondary: boolean) => void;
};

export function CollectorForm({
  register,
  control,
  errors,
  hasSecondaryWallet,
  isUsingSecondary,
  onToggleSecondary,
}: CollectorFormProps) {
  return (
    <section aria-labelledby="collector-title" className="flex flex-col gap-3">
      <h2 id="collector-title" className="text-[17px] leading-4 font-bold">
        Perfil do colecionador
      </h2>

      <div className="flex flex-col gap-6">
        <div className="grid gap-x-6 gap-y-3 lg:grid-cols-2">
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
          <FormField label="Nome de usuário" isRequired error={errors.username?.message}>
            {(props) => (
              <input
                {...props}
                {...register('username')}
                autoComplete="username"
                className={fieldInputClassName}
              />
            )}
          </FormField>

          <FormField label="Rede" isRequired error={errors.network?.message}>
            {(props) => (
              <Controller
                control={control}
                name="network"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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

          <FormField label="Endereço da carteira" isRequired error={errors.walletAddress?.message}>
            {(props) => (
              <input
                {...props}
                {...register('walletAddress')}
                placeholder="Endereço 0x da carteira"
                spellCheck={false}
                className={cn(fieldInputClassName, 'font-mono')}
              />
            )}
          </FormField>
          <FormField
            label="ENS ou carteira secundária (opcional)"
            isLabelHidden
            error={errors.secondaryAddress?.message}
            className="lg:pt-[29px]"
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
                  <Select value={field.value} onValueChange={field.onChange}>
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

        <label
          className={cn(
            'flex w-fit items-center gap-2 text-[15px] leading-5',
            hasSecondaryWallet ? 'cursor-pointer' : 'cursor-not-allowed text-subtle',
          )}
        >
          <input
            type="checkbox"
            checked={isUsingSecondary}
            disabled={!hasSecondaryWallet}
            onChange={(event) => onToggleSecondary(event.target.checked)}
            aria-describedby={hasSecondaryWallet ? undefined : 'secondary-wallet-hint'}
            className="peer grid size-[15px] appearance-none place-content-center rounded-full border-2 border-primary before:size-[7px] before:rounded-full before:bg-primary before:opacity-0 checked:before:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:border-input"
          />
          Usar outra carteira?
        </label>
        {!hasSecondaryWallet && (
          <p id="secondary-wallet-hint" className="-mt-4 text-[13px] leading-4 text-subtle">
            Cadastre uma carteira secundária em Carteiras para usar outra carteira.
          </p>
        )}

        <FormField
          label="Observação do colecionador (opcional)"
          error={errors.note?.message}
          className="gap-3 lg:max-w-[350px]"
        >
          {(props) => (
            <textarea
              {...props}
              {...register('note')}
              rows={6}
              className={cn(fieldInputClassName, 'h-[152px] resize-none py-2')}
            />
          )}
        </FormField>
      </div>
    </section>
  );
}
