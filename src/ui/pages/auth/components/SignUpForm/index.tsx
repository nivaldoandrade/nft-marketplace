import { AuthField } from '@/ui/pages/auth/components/AuthField';
import { useSignUpForm } from '@/ui/pages/auth/components/SignUpForm/useSignUpForm';

type SignUpFormProps = {
  onSuccess: () => void;
};

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const { register, errors, isSubmitting, handleSubmit } = useSignUpForm(onSuccess);

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-10 md:gap-6">
      <div className="flex flex-col gap-3">
        <AuthField
          label="Nome de usuário"
          autoComplete="username"
          autoCapitalize="none"
          placeholder="Nome de usuário"
          error={errors.username?.message}
          {...register('username')}
        />
        <AuthField
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="Digite seu e-mail"
          error={errors.email?.message}
          {...register('email')}
        />
        <AuthField
          label="Senha"
          type="password"
          autoComplete="new-password"
          placeholder="Senha"
          error={errors.password?.message}
          {...register('password')}
        />
        <AuthField
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          placeholder="Confirmar senha"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>

      <div className="flex flex-col gap-3">
        {errors.root?.api && (
          <p role="alert" className="text-center text-[13px] leading-4 text-coral">
            {errors.root.api.message}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-[60px] w-full rounded-[10px] bg-primary text-base leading-4 font-bold text-primary-foreground pressable hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 md:h-[45px] md:rounded-[5px]"
        >
          {isSubmitting ? (
            'Criando conta...'
          ) : (
            <>
              <span className="md:hidden">Criar perfil</span>
              <span className="hidden md:inline">Criar conta</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
