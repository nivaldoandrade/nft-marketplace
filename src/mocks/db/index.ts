import { MOCK_DB_KEY, MOCK_DB_VERSION } from '@/mocks/config';
import type { MockDb } from '@/mocks/db/types';
import { createNftFixtures } from '@/mocks/fixtures/nfts';
import { favoriteFixtures, userFixtures } from '@/mocks/fixtures/users';
import { walletFixtures } from '@/mocks/fixtures/wallets';

function createSeed(): MockDb {
  return {
    version: MOCK_DB_VERSION,
    sequence: 1000,
    nfts: Object.fromEntries(createNftFixtures().map((nft) => [nft.id, nft])),
    users: Object.fromEntries(userFixtures.map((user) => [user.id, { ...user }])),
    sessions: {},
    favorites: structuredClone(favoriteFixtures),
    carts: {},
    wallets: structuredClone(walletFixtures),
    walletConnections: {},
    orders: {},
    idempotency: {},
  };
}

// ?reset-mocks discards the stored data and starts again from the fixtures
function shouldReset() {
  return new URLSearchParams(window.location.search).has('reset-mocks');
}

function load(): MockDb {
  if (shouldReset()) {
    return createSeed();
  }

  try {
    const stored = localStorage.getItem(MOCK_DB_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as MockDb;

      if (parsed.version === MOCK_DB_VERSION) {
        return parsed;
      }
    }
  } catch {
    // ignore corrupted state
  }

  return createSeed();
}

export const db = load();

if (shouldReset()) {
  persist();
}

export function persist() {
  try {
    localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
  } catch {
    // storage unavailable
  }
}

export function nextId(prefix: string) {
  db.sequence += 1;

  return `${prefix}_${db.sequence}`;
}
