import { http, HttpResponse } from 'msw';

import type { Profile } from '@/app/types/User';
import { apiPath } from '@/mocks/config';
import { db, persist } from '@/mocks/db';
import type { UserRecord } from '@/mocks/db/types';
import { requireUser, toUser } from '@/mocks/domain/session';
import { hashPassword } from '@/mocks/utils/hash';
import { apiError, validationError } from '@/mocks/utils/responses';
import {
  isEmail,
  isEnsName,
  isFilled,
  isStrongPassword,
  isUsername,
  readJson,
} from '@/mocks/utils/validators';

const AVATAR_PATTERN = /^data:image\/(png|jpeg|webp);base64,/;
// a 1.5 MB image is about 2 MB once encoded as base64
const MAX_AVATAR_LENGTH = 2 * 1024 * 1024;

type UpdateProfileBody = Pick<
  Profile,
  'displayName' | 'username' | 'email' | 'ensName' | 'walletNickname'
>;

function toProfile(user: UserRecord): Profile {
  return { ...toUser(user), ensName: user.ensName, walletNickname: user.walletNickname };
}

export const profileHandlers = [
  http.get(apiPath('/me/profile'), ({ request }) => {
    const auth = requireUser(request);

    if ('error' in auth) {
      return auth.error;
    }

    return HttpResponse.json(toProfile(auth.user));
  }),

  http.patch(apiPath('/me/profile'), async ({ request }) => {
    const auth = requireUser(request);

    if ('error' in auth) {
      return auth.error;
    }

    const body = await readJson<UpdateProfileBody>(request);
    const fields: Record<string, string> = {};

    if (!isFilled(body.displayName, 40)) {
      fields.displayName = 'Informe o nome de exibição (até 40 caracteres).';
    }

    if (!isUsername(body.username)) {
      fields.username = 'Use de 3 a 20 caracteres: letras minúsculas, números, ponto ou _.';
    }

    if (!isEmail(body.email)) {
      fields.email = 'Informe um e-mail válido.';
    }

    if (!isEnsName(body.ensName)) {
      fields.ensName = 'Informe um nome ENS válido.';
    }

    if (!isFilled(body.walletNickname, 40)) {
      fields.walletNickname = 'Informe o apelido da carteira.';
    }

    if (Object.keys(fields).length) {
      return validationError(fields);
    }

    const others = Object.values(db.users).filter((user) => user.id !== auth.user.id);
    const email = body.email!.trim().toLowerCase();

    if (others.some((user) => user.email === email)) {
      return apiError(409, 'EMAIL_ALREADY_IN_USE', { fields: { email: 'E-mail já cadastrado.' } });
    }

    if (others.some((user) => user.username === body.username)) {
      return apiError(409, 'USERNAME_ALREADY_IN_USE', {
        fields: { username: 'Nome de usuário indisponível.' },
      });
    }

    Object.assign(auth.user, {
      displayName: body.displayName!.trim(),
      username: body.username,
      email,
      ensName: body.ensName,
      walletNickname: body.walletNickname!.trim(),
    });
    persist();

    return HttpResponse.json(toProfile(auth.user));
  }),

  http.put(apiPath('/me/avatar'), async ({ request }) => {
    const auth = requireUser(request);

    if ('error' in auth) {
      return auth.error;
    }

    const body = await readJson<{ dataUrl: string }>(request);

    if (typeof body.dataUrl !== 'string' || !AVATAR_PATTERN.test(body.dataUrl)) {
      return validationError({ avatar: 'Envie uma imagem PNG, JPEG ou WebP.' });
    }

    if (body.dataUrl.length > MAX_AVATAR_LENGTH) {
      return validationError({ avatar: 'A imagem deve ter no máximo 1,5 MB.' });
    }

    auth.user.avatarUrl = body.dataUrl;
    persist();

    return HttpResponse.json(toProfile(auth.user));
  }),

  http.delete(apiPath('/me/avatar'), ({ request }) => {
    const auth = requireUser(request);

    if ('error' in auth) {
      return auth.error;
    }

    auth.user.avatarUrl = null;
    persist();

    return HttpResponse.json(toProfile(auth.user));
  }),

  http.post(apiPath('/me/password'), async ({ request }) => {
    const auth = requireUser(request);

    if ('error' in auth) {
      return auth.error;
    }

    const body = await readJson<{ currentPassword: string; newPassword: string }>(request);

    if (!isStrongPassword(body.newPassword)) {
      return validationError({
        newPassword: 'A senha deve ter ao menos 8 caracteres, com letras e números.',
      });
    }

    const currentHash = await hashPassword(body.currentPassword ?? '', auth.user.salt);

    if (currentHash !== auth.user.passwordHash) {
      return apiError(422, 'INVALID_PASSWORD', {
        fields: { currentPassword: 'Senha atual incorreta.' },
      });
    }

    auth.user.passwordHash = await hashPassword(body.newPassword, auth.user.salt);
    persist();

    return new HttpResponse(null, { status: 204 });
  }),
];
