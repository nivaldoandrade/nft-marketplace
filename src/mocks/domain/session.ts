import type { User } from '@/app/types/User';
import { SESSION_DURATION_MS } from '@/mocks/config';
import { db, persist } from '@/mocks/db';
import type { SessionRecord, UserRecord } from '@/mocks/db/types';
import { getScenarioConfig } from '@/mocks/scenarios';
import { createToken } from '@/mocks/utils/hash';
import { apiError } from '@/mocks/utils/responses';

const SHORT_SESSION_MS = 30_000;

export function toUser(record: UserRecord): User {
  return {
    id: record.id,
    username: record.username,
    email: record.email,
    displayName: record.displayName,
    avatarUrl: record.avatarUrl,
  };
}

export function createSession(userId: string): SessionRecord {
  const duration = getScenarioConfig().shortSession ? SHORT_SESSION_MS : SESSION_DURATION_MS;
  const session = { token: createToken(), userId, expiresAt: Date.now() + duration };

  db.sessions[session.token] = session;
  persist();

  return session;
}

export function getBearerToken(request: Request) {
  const header = request.headers.get('Authorization');

  return header?.startsWith('Bearer ') ? header.slice(7) : null;
}

export function getOptionalUser(request: Request): UserRecord | null {
  const token = getBearerToken(request);
  const session = token ? db.sessions[token] : undefined;

  if (!session || session.expiresAt <= Date.now()) {
    return null;
  }

  return db.users[session.userId] ?? null;
}

export function requireUser(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return { error: apiError(401, 'UNAUTHORIZED') } as const;
  }

  const session = db.sessions[token];

  if (!session) {
    return { error: apiError(401, 'SESSION_EXPIRED') } as const;
  }

  if (session.expiresAt <= Date.now()) {
    delete db.sessions[token];
    persist();

    return { error: apiError(401, 'SESSION_EXPIRED') } as const;
  }

  const user = db.users[session.userId];

  if (!user) {
    return { error: apiError(401, 'UNAUTHORIZED') } as const;
  }

  return { user, session } as const;
}
