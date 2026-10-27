import type { UserRecord } from '@/mocks/db/types';

// Both fixture users sign in with the password "Kurio@123"
export const userFixtures: UserRecord[] = [
  {
    id: 'usr_ana',
    username: 'ana.colecionadora',
    email: 'ana@kurio.dev',
    displayName: 'Ana Souza',
    avatarUrl: null,
    ensName: 'ana',
    walletNickname: 'Principal',
    salt: 'ana-salt-01',
    passwordHash: 'a5e4e0870d916cbe5a623a67cce6a7b484c4d381e832fb70e7639aebdb1ecda9',
    createdAt: '2026-01-10T12:00:00.000Z',
  },
  {
    id: 'usr_bruno',
    username: 'bruno.nft',
    email: 'bruno@kurio.dev',
    displayName: 'Bruno Lima',
    avatarUrl: null,
    ensName: 'bruno',
    walletNickname: 'Principal',
    salt: 'bruno-salt-02',
    passwordHash: 'a680a6cfac40c588aa205805a1464ad97ac1748e7c5952f786f4e10cb990e95c',
    createdAt: '2026-02-02T12:00:00.000Z',
  },
];

export const favoriteFixtures: Record<string, string[]> = {
  usr_ana: ['sage-nomad-009', 'ivory-baron-088'],
  usr_bruno: ['golden-beat-207'],
};
