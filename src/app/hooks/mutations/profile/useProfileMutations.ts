import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { queryKeys } from '@/app/libs/queryKeys';
import type { AuthService } from '@/app/services/AuthService';
import { ProfileService } from '@/app/services/ProfileService';
import type { Profile } from '@/app/types/User';

// the header reads the user from the session, so it follows the saved profile
function useSetProfile() {
  const queryClient = useQueryClient();
  const userId = useAuth().user?.id ?? '';

  return (profile: Profile) => {
    const { ensName: _ensName, walletNickname: _walletNickname, ...user } = profile;

    queryClient.setQueryData(queryKeys.user(userId).profile(), profile);
    queryClient.setQueryData<AuthService.Session | null>(queryKeys.session(), (session) =>
      session ? { ...session, user } : session,
    );
  };
}

export function useUpdateProfile() {
  const setProfile = useSetProfile();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ProfileService.update.bind(ProfileService),
    onSuccess: setProfile,
  });

  return { updateProfile: mutateAsync, isUpdating: isPending };
}

export function useUploadAvatar() {
  const setProfile = useSetProfile();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ProfileService.uploadAvatar.bind(ProfileService),
    onSuccess: setProfile,
  });

  return { uploadAvatar: mutateAsync, isUploading: isPending };
}

export function useRemoveAvatar() {
  const setProfile = useSetProfile();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => ProfileService.removeAvatar(),
    onSuccess: setProfile,
  });

  return { removeAvatar: mutateAsync, isRemoving: isPending };
}

export function useChangePassword() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ProfileService.changePassword.bind(ProfileService),
  });

  return { changePassword: mutateAsync, isChanging: isPending };
}
