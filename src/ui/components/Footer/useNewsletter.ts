import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { newsletterSchema } from '@/ui/components/Footer/schema';
import { notifyUnavailable } from '@/ui/utils/notifyUnavailable';

export function useNewsletter() {
  const form = useForm({
    defaultValues: { email: '' },
    resolver: zodResolver(newsletterSchema),
  });

  const handleSubmit = form.handleSubmit(() => {
    notifyUnavailable('A inscrição na newsletter');
  });

  return {
    register: form.register,
    error: form.formState.errors.email?.message,
    handleSubmit,
  };
}
