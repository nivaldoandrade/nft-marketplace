import * as z from 'zod';

const PASSWORD_PATTERN = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

export const profileSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, 'Informe o nome de exibição.')
      .max(40, 'Use no máximo 40 caracteres.'),
    username: z
      .string()
      .trim()
      .min(3, 'O nome de usuário deve ter pelo menos 3 caracteres.')
      .max(20, 'O nome de usuário deve ter no máximo 20 caracteres.')
      .regex(/^[a-z0-9._]*$/, 'Use letras minúsculas sem acento, números, ponto (.) ou _.'),
    email: z.string().trim().pipe(z.email('Informe um e-mail válido.')),
    ensName: z
      .string()
      .trim()
      .min(1, 'Informe o nome ENS.')
      .regex(/^[a-z0-9-]+(\.[a-z0-9-]+)*$/, 'Use letras minúsculas, números, ponto ou hífen.'),
    walletNickname: z
      .string()
      .trim()
      .min(1, 'Informe o apelido da carteira.')
      .max(40, 'Use no máximo 40 caracteres.'),
    currentPassword: z.string(),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  // the password fields are optional, but once one is filled the change must be complete
  .superRefine((values, context) => {
    if (!values.currentPassword && !values.newPassword && !values.confirmPassword) {
      return;
    }

    if (!values.currentPassword) {
      context.addIssue({
        code: 'custom',
        path: ['currentPassword'],
        message: 'Informe a senha atual.',
      });
    }

    if (!PASSWORD_PATTERN.test(values.newPassword)) {
      context.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: 'A senha deve ter ao menos 8 caracteres, com letras e números.',
      });
    }

    if (values.newPassword !== values.confirmPassword) {
      context.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'As senhas não coincidem.',
      });
    }
  });

export type ProfileSchema = z.infer<typeof profileSchema>;
