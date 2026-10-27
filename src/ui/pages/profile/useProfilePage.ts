import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  useChangePassword,
  useUpdateProfile,
} from '@/app/hooks/mutations/profile/useProfileMutations';
import { toast } from '@/app/libs/toast';
import type { Profile } from '@/app/types/User';
import { profileSchema, type ProfileSchema } from '@/ui/pages/profile/schema';
import { applyApiErrors } from '@/ui/utils/applyApiErrors';

const emptyPasswords = { currentPassword: '', newPassword: '', confirmPassword: '' };

function toFormValues(profile: Profile): ProfileSchema {
  return {
    displayName: profile.displayName,
    username: profile.username,
    email: profile.email,
    ensName: profile.ensName,
    walletNickname: profile.walletNickname,
    ...emptyPasswords,
  };
}

export function useProfilePage(profile: Profile) {
  const { updateProfile } = useUpdateProfile();
  const { changePassword } = useChangePassword();

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: toFormValues(profile),
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    const { currentPassword, newPassword, confirmPassword: _confirmPassword, ...data } = values;
    const { dirtyFields } = form.formState;
    const hasProfileChanges = Object.keys(data).some(
      (field) => dirtyFields[field as keyof ProfileSchema],
    );

    try {
      const saved = hasProfileChanges ? await updateProfile(data) : profile;

      if (newPassword) {
        await changePassword({ currentPassword, newPassword });
      }

      form.reset(toFormValues(saved));
      toast.success(newPassword ? 'Perfil e senha atualizados.' : 'Perfil atualizado.');
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
