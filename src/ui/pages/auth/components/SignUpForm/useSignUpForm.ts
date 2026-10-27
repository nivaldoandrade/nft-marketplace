import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { toast } from '@/app/libs/toast';
import { signUpSchema } from '@/ui/pages/auth/components/SignUpForm/schema';
import { applyApiErrors } from '@/ui/utils/applyApiErrors';

export function useSignUpForm(onSuccess: () => void) {
  const { signUp } = useAuth();

  const form = useForm({
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
    resolver: zodResolver(signUpSchema),
  });

  const handleSubmit = form.handleSubmit(async ({ username, email, password }) => {
    try {
      await signUp({ username, email, password });
      toast.success('Conta criada com sucesso.');
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
  };
}
