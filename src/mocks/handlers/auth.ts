import { http, HttpResponse } from 'msw';

import { apiPath } from '@/mocks/config';
import { db, nextId, persist } from '@/mocks/db';
import { createSession, getBearerToken, requireUser, toUser } from '@/mocks/domain/session';
import { createSalt, hashPassword } from '@/mocks/utils/hash';
import { apiError, validationError } from '@/mocks/utils/responses';
import {
  isEmail,
  isFilled,
  isStrongPassword,
  isUsername,
  readJson,
} from '@/mocks/utils/validators';

type SignUpBody = { username: string; email: string; password: string };
type SignInBody = { email: string; password: string };

function findUserByEmail(email: string) {
  return Object.values(db.users).find((user) => user.email === email.trim().toLowerCase());
}

export const authHandlers = [
  http.post(apiPath('/auth/sign-up'), async ({ request }) => {
    const body = await readJson<SignUpBody>(request);
    const fields: Record<string, string> = {};

    if (!isUsername(body.username)) {
      fields.username =
        'Use de 3 a 20 caracteres, sem espaços: letras minúsculas, números, ponto ou _.';
    }

    if (!isEmail(body.email)) {
      fields.email = 'Informe um e-mail válido.';
    }

    if (!isStrongPassword(body.password)) {
      fields.password = 'A senha deve ter ao menos 8 caracteres, com letras e números.';
    }

    if (Object.keys(fields).length) {
      return validationError(fields);
    }

    const email = body.email!.trim().toLowerCase();

    if (findUserByEmail(email)) {
      return apiError(409, 'EMAIL_ALREADY_IN_USE', { fields: { email: 'E-mail já cadastrado.' } });
    }

    if (Object.values(db.users).some((user) => user.username === body.username)) {
      return apiError(409, 'USERNAME_ALREADY_IN_USE', {
        fields: { username: 'Nome de usuário indisponível.' },
      });
    }

    const salt = createSalt();
    const user = {
      id: nextId('usr'),
      username: body.username!,
      email,
      displayName: body.username!,
      avatarUrl: null,
      salt,
      passwordHash: await hashPassword(body.password!, salt),
      createdAt: new Date().toISOString(),
    };

    db.users[user.id] = user;
    db.favorites[user.id] = [];
    persist();

    const session = createSession(user.id);

    return HttpResponse.json(
      {
        accessToken: session.token,
        expiresAt: new Date(session.expiresAt).toISOString(),
        user: toUser(user),
      },
      { status: 201 },
    );
  }),

  http.post(apiPath('/auth/sign-in'), async ({ request }) => {
    const body = await readJson<SignInBody>(request);

    if (!isEmail(body.email) || !isFilled(body.password, 128)) {
      return validationError({
        ...(!isEmail(body.email) && { email: 'Informe um e-mail válido.' }),
        ...(!isFilled(body.password, 128) && { password: 'Informe sua senha.' }),
      });
    }

    const user = findUserByEmail(body.email);
    const passwordHash = user ? await hashPassword(body.password, user.salt) : null;

    if (!user || passwordHash !== user.passwordHash) {
      return apiError(401, 'INVALID_CREDENTIALS');
    }

    const session = createSession(user.id);

    return HttpResponse.json({
      accessToken: session.token,
      expiresAt: new Date(session.expiresAt).toISOString(),
      user: toUser(user),
    });
  }),

  http.get(apiPath('/auth/session'), ({ request }) => {
    const auth = requireUser(request);

    if ('error' in auth) {
      return auth.error;
    }

    return HttpResponse.json({
      user: toUser(auth.user),
      expiresAt: new Date(auth.session.expiresAt).toISOString(),
    });
  }),

  http.post(apiPath('/auth/sign-out'), ({ request }) => {
    const token = getBearerToken(request);
    const session = token ? db.sessions[token] : undefined;

    if (token && session) {
      delete db.sessions[token];
      persist();
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
