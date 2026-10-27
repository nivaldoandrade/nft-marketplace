import { useProfile } from '@/app/hooks/queries/profile/useProfile';
import type { Profile as ProfileData } from '@/app/types/User';
import { EnsDomainSelect } from '@/ui/components/EnsDomainSelect';
import { FormField } from '@/ui/components/FormField';
import { fieldInputClassName } from '@/ui/components/FormField/styles';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { usePageTitle } from '@/ui/hooks/usePageTitle';
import { AvatarField } from '@/ui/pages/profile/components/AvatarField';
import { PasswordField } from '@/ui/pages/profile/components/PasswordField';
import { useProfilePage } from '@/ui/pages/profile/useProfilePage';
import { cn } from '@/ui/utils/cn';

export function Profile() {
  usePageTitle('Dados do perfil');
  const { profile, isPending, isError, refetch } = useProfile();

  if (isError) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-muted-foreground">Não foi possível carregar o perfil.</p>
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

  if (isPending || !profile) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-[285px]" />
        <Skeleton className="h-[289px] md:w-1/2" />
      </div>
    );
  }

  return <ProfileForm key={profile.id} profile={profile} />;
}

function ProfileForm({ profile }: { profile: ProfileData }) {
  const { register, errors, isSubmitting, handleSubmit } = useProfilePage(profile);
  const fieldClassName = 'gap-2.5';

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section aria-labelledby="profile-title" className="flex flex-col gap-8">
        <h1 id="profile-title" className="text-base leading-4 font-bold">
          Perfil do colecionador
        </h1>
        <div className="grid gap-x-7 gap-y-6 md:grid-cols-2">
          <FormField
            label="Nome de exibição"
            isRequired
            error={errors.displayName?.message}
            className={fieldClassName}
          >
            {(props) => (
              <input
                {...props}
                {...register('displayName')}
                autoComplete="name"
                className={fieldInputClassName}
              />
            )}
          </FormField>
          <FormField
            label="Nome de usuário"
            isRequired
            error={errors.username?.message}
            className={fieldClassName}
          >
            {(props) => (
              <input
                {...props}
                {...register('username')}
                autoComplete="username"
                className={fieldInputClassName}
              />
            )}
          </FormField>
          <FormField
            label="E-mail"
            isRequired
            error={errors.email?.message}
            className={fieldClassName}
          >
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
          <FormField
            label="Nome ENS"
            isRequired
            error={errors.ensName?.message}
            className={fieldClassName}
          >
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
          <FormField
            label="Apelido da carteira"
            isRequired
            error={errors.walletNickname?.message}
            className={fieldClassName}
          >
            {(props) => (
              <input {...props} {...register('walletNickname')} className={fieldInputClassName} />
            )}
          </FormField>
          <AvatarField avatarUrl={profile.avatarUrl} displayName={profile.displayName} />
        </div>
      </section>

      <section aria-labelledby="password-title" className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 id="password-title" className="text-base leading-4 font-medium">
            Alterar senha
          </h2>
          <p className="text-[13px] leading-4 text-subtle">
            Preencha apenas se quiser trocar a senha.
          </p>
        </div>
        <div className="flex flex-col gap-6 md:max-w-[417px]">
          <PasswordField
            label="Senha atual"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <PasswordField
            label="Nova senha"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <PasswordField
            label="Confirmar nova senha"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>
      </section>

      <div className="flex flex-col gap-3">
        {errors.root?.api && (
          <p role="alert" className="text-[13px] leading-4 text-coral">
            {errors.root.api.message}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="h-10 w-full rounded-[3px] bg-primary text-sm font-bold text-primary-foreground pressable hover:bg-accent disabled:opacity-60 md:w-[131px]"
        >
          {isSubmitting ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
