import { delay, http, HttpResponse } from 'msw';

import { WalletProvider, type Wallets } from '@/app/types/Wallet';
import { apiPath } from '@/mocks/config';
import { db, persist } from '@/mocks/db';
import { requireUser } from '@/mocks/domain/session';
import { consumeOnce, getScenarioConfig } from '@/mocks/scenarios';
import { apiError, validationError } from '@/mocks/utils/responses';
import { readJson } from '@/mocks/utils/validators';

// time the user would spend approving the connection in the wallet extension
const CONNECT_DELAY_MS = 900;

function toWallets(userId: string): Wallets {
  const wallets = db.wallets[userId];

  return {
    primary: wallets?.primary ?? null,
    secondary: wallets?.secondary ?? null,
    connection: db.walletConnections[userId] ?? null,
  };
}

export function findUserWallet(userId: string, walletId: string | undefined) {
  const wallets = db.wallets[userId];

  return [wallets?.primary, wallets?.secondary].find((wallet) => wallet && wallet.id === walletId);
}

export const walletHandlers = [
  http.get(apiPath('/me/wallets'), ({ request }) => {
    const auth = requireUser(request);

    if ('error' in auth) {
      return auth.error;
    }

    return HttpResponse.json(toWallets(auth.user.id));
  }),

  http.post(apiPath('/me/wallets/:walletId/connect'), async ({ request, params }) => {
    const auth = requireUser(request);

    if ('error' in auth) {
      return auth.error;
    }

    const { provider } = await readJson<{ provider: WalletProvider }>(request);

    if (!provider || !Object.values(WalletProvider).includes(provider)) {
      return validationError({ provider: 'Selecione uma carteira.' });
    }

    if (!findUserWallet(auth.user.id, params.walletId as string)) {
      return apiError(404, 'WALLET_NOT_FOUND');
    }

    await delay(CONNECT_DELAY_MS);

    if (getScenarioConfig().walletRejected && consumeOnce('wallet-rejected')) {
      return apiError(409, 'WALLET_REJECTED');
    }

    db.walletConnections[auth.user.id] = {
      walletId: params.walletId as string,
      provider,
      connectedAt: new Date().toISOString(),
    };
    persist();

    return HttpResponse.json(toWallets(auth.user.id));
  }),

  http.post(apiPath('/me/wallets/disconnect'), ({ request }) => {
    const auth = requireUser(request);

    if ('error' in auth) {
      return auth.error;
    }

    delete db.walletConnections[auth.user.id];
    persist();

    return HttpResponse.json(toWallets(auth.user.id));
  }),
];
