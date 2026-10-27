import { useRef } from 'react';

import { getApiErrorCode, getApiErrorFields, getErrorMessage } from '@/app/errors/apiErrors';
import {
  useRemoveAvatar,
  useUploadAvatar,
} from '@/app/hooks/mutations/profile/useProfileMutations';
import { toast } from '@/app/libs/toast';
import { ImageIcon } from '@/ui/components/Icons';

type AvatarFieldProps = {
  avatarUrl: string | null;
  displayName: string;
};

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE_BYTES = 1.5 * 1024 * 1024;

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function AvatarField({ avatarUrl, displayName }: AvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, isUploading } = useUploadAvatar();
  const { removeAvatar, isRemoving } = useRemoveAvatar();

  function notifyError(error: unknown) {
    const fields = getApiErrorFields(error);
    toast.error(fields?.avatar ?? getErrorMessage(getApiErrorCode(error)));
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Envie uma imagem PNG, JPEG ou WebP.');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error('A imagem deve ter no máximo 1,5 MB.');
      return;
    }

    try {
      await uploadAvatar(await readAsDataUrl(file));
      toast.success('Avatar atualizado.');
    } catch (error) {
      notifyError(error);
    }
  }

  async function handleRemove() {
    if (!avatarUrl) {
      toast.info('Você ainda não tem um avatar.');
      return;
    }

    try {
      await removeAvatar();
      toast.success('Avatar removido.');
    } catch (error) {
      notifyError(error);
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <span id="avatar-label" className="text-[15px] leading-[15px]">
        Avatar
      </span>
      <div role="group" aria-labelledby="avatar-label" className="flex items-center">
        <span className="mr-6 flex size-[50px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-primary">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`Avatar de ${displayName}`}
              className="size-full object-cover"
            />
          ) : (
            <ImageIcon className="size-6" />
          )}
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          aria-busy={isUploading}
          className="mr-5 h-10 w-[98px] rounded-[3px] bg-primary text-sm font-bold text-primary-foreground pressable hover:bg-accent disabled:opacity-60"
        >
          {isUploading ? 'Enviando…' : 'Alterar'}
        </button>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isRemoving}
          className="text-sm leading-4 hover:text-accent disabled:opacity-60"
        >
          Remover
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileChange}
          aria-label="Escolher imagem do avatar"
          className="sr-only"
          tabIndex={-1}
        />
      </div>
    </div>
  );
}
