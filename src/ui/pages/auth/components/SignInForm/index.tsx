import { AuthField } from '@/ui/pages/auth/components/AuthField';
import { useSignInForm } from '@/ui/pages/auth/components/SignInForm/useSignInForm';

type SignInFormProps = {
  onSuccess: () => void;
};

export function SignInForm({ onSuccess }: SignInFormProps) {
  const { register, errors, isSubmitting, handleSubmit, handleForgotPassword } =
    useSignInForm(onSuccess);

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-10 md:gap-6">
      <div className="flex flex-col gap-3">
        <AuthField
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="contato@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <AuthField
          label="Senha"
          type="password"
          autoComplete="current-password"
          placeholder="Senha"
          error={errors.password?.message}
          {...register('password')}
        />
        <button
          type="button"
          onClick={handleForgotPassword}
          className="self-end text-sm leading-4 text-accent hover:underline"
        >
          Esqueceu a senha?
        </button>
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
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
    </form>
  );
}
