import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { toast } from '@/app/libs/toast';
import { signInSchema } from '@/ui/pages/auth/components/SignInForm/schema';
import { applyApiErrors } from '@/ui/utils/applyApiErrors';
import { notifyUnavailable } from '@/ui/utils/notifyUnavailable';

export function useSignInForm(onSuccess: () => void) {
  const { signIn } = useAuth();

  const form = useForm({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(signInSchema),
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await signIn(values);
      toast.success('Você entrou na sua conta.');
      onSuccess();
    } catch (error) {
      applyApiErrors(form, error);
    }
  });

  return {
    register: form.register,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit,
    handleForgotPassword: () => notifyUnavailable('A recuperação de senha'),
  };
}
