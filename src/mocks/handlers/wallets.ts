import { delay, http, HttpResponse } from 'msw';

import { Network } from '@/app/types/Nft';
import { type Wallet, WalletProvider, type Wallets, WalletSlot } from '@/app/types/Wallet';
import { apiPath } from '@/mocks/config';
import { db, nextId, persist } from '@/mocks/db';
import { requireUser } from '@/mocks/domain/session';
import { consumeOnce, getScenarioConfig } from '@/mocks/scenarios';
import { apiError, validationError } from '@/mocks/utils/responses';
import { isEmail, isEnsName, isFilled, isWalletAddress, readJson } from '@/mocks/utils/validators';

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

type SaveWalletBody = Omit<Wallet, 'id' | 'slot' | 'updatedAt'> & { sameAsPrimary: boolean };

function validateWallet(wallet: Partial<SaveWalletBody>) {
  const fields: Record<string, string> = {};
  const required: [keyof SaveWalletBody, string][] = [
    ['displayName', 'Informe o nome de exibição.'],
    ['nickname', 'Informe o apelido da carteira.'],
    ['profileName', 'Informe o nome do perfil.'],
    ['referralCode', 'Informe o código de indicação.'],
  ];

  required.forEach(([field, message]) => {
    if (!isFilled(wallet[field], 40)) {
      fields[field] = message;
    }
  });

  if (!Object.values(Network).includes(wallet.network as Network)) {
    fields.network = 'Selecione uma rede.';
  }

  if (!Object.values(WalletProvider).includes(wallet.provider as WalletProvider)) {
    fields.provider = 'Selecione uma carteira.';
  }

  if (!isWalletAddress(wallet.address)) {
    fields.address = 'Informe um endereço 0x com 40 caracteres hexadecimais.';
  }

  if (wallet.secondaryAddress && wallet.secondaryAddress.length > 80) {
    fields.secondaryAddress = 'Use no máximo 80 caracteres.';
  }

  if (!isEmail(wallet.email)) {
    fields.email = 'Informe um e-mail válido.';
  }

  if (!isEnsName(wallet.ensName)) {
    fields.ensName = 'Informe um nome ENS válido.';
  }

  return fields;
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

  http.put(apiPath('/me/wallets/:slot'), async ({ request, params }) => {
    const auth = requireUser(request);

    if ('error' in auth) {
      return auth.error;
    }

    const slot = params.slot as WalletSlot;

    if (!Object.values(WalletSlot).includes(slot)) {
      return apiError(404, 'RESOURCE_NOT_FOUND');
    }

    const wallets = db.wallets[auth.user.id] ?? { primary: null, secondary: null };
    const body = await readJson<SaveWalletBody>(request);
    const source = slot === WalletSlot.SECONDARY && body.sameAsPrimary ? wallets.primary : body;

    if (!source) {
      return validationError({ sameAsPrimary: 'Cadastre a carteira principal primeiro.' });
    }

    const fields = validateWallet(source);

    if (Object.keys(fields).length) {
      return validationError(fields);
    }

    const wallet: Wallet = {
      id: wallets[slot]?.id ?? nextId('wal'),
      slot,
      displayName: source.displayName!.trim(),
      nickname: source.nickname!.trim(),
      profileName: source.profileName!.trim(),
      network: source.network!,
      address: source.address!,
      secondaryAddress: source.secondaryAddress || null,
      provider: source.provider!,
      referralCode: source.referralCode!.trim(),
      email: source.email!.trim().toLowerCase(),
      ensName: source.ensName!,
      updatedAt: new Date().toISOString(),
    };

    // a copy of the primary wallet keeps its own nickname, so both stay distinguishable
    if (slot === WalletSlot.SECONDARY && body.sameAsPrimary) {
      wallet.nickname = wallets.secondary?.nickname ?? 'Reserva';
    }

    db.wallets[auth.user.id] = { ...wallets, [slot]: wallet };
    persist();

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
