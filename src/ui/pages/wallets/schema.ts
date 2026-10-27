import * as z from 'zod';

import { Network } from '@/app/types/Nft';
import { WalletProvider } from '@/app/types/Wallet';

export const walletSchema = z.object({
  displayName: z.string().trim().min(1, 'Informe o nome de exibição.').max(40),
  nickname: z.string().trim().min(1, 'Informe o apelido da carteira.').max(40),
  network: z.enum(Object.values(Network), 'Selecione uma rede.'),
  profileName: z.string().trim().min(1, 'Informe o nome do perfil.').max(40),
  address: z
    .string()
    .trim()
    .regex(/^0x[0-9a-fA-F]{40}$/, 'Informe um endereço 0x com 40 caracteres hexadecimais.'),
  secondaryAddress: z.string().trim().max(80, 'Use no máximo 80 caracteres.'),
  provider: z.enum(Object.values(WalletProvider), 'Selecione uma carteira.'),
  referralCode: z.string().trim().min(1, 'Informe o código de indicação.').max(40),
  email: z.string().trim().pipe(z.email('Informe um e-mail válido.')),
  ensName: z
    .string()
    .trim()
    .min(1, 'Informe o nome ENS.')
    .regex(/^[a-z0-9-]+(\.[a-z0-9-]+)*$/, 'Use letras minúsculas, números, ponto ou hífen.'),
});

export type WalletSchema = z.infer<typeof walletSchema>;
