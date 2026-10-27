import * as z from 'zod';

import { Network } from '@/app/types/Nft';
import { WalletProvider } from '@/app/types/Wallet';

export const checkoutSchema = z.object({
  displayName: z.string().trim().min(1, 'Informe o nome de exibição.').max(60),
  username: z.string().trim().min(1, 'Informe o nome de usuário.').max(60),
  profileName: z.string().trim().min(1, 'Informe o nome do perfil.').max(60),
  network: z.enum(Object.values(Network), 'Selecione uma rede.'),
  walletAddress: z
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
    .regex(/^[a-z0-9.-]*$/, 'Use letras minúsculas, números, ponto ou hífen.'),
  note: z.string().trim().max(500, 'A observação deve ter no máximo 500 caracteres.'),
});

export type CheckoutSchema = z.infer<typeof checkoutSchema>;
