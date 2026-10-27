import * as z from 'zod';

export const signUpSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'O nome de usuário deve ter pelo menos 3 caracteres.')
      .max(20, 'O nome de usuário deve ter no máximo 20 caracteres.')
      .regex(/^\S*$/, 'O nome de usuário não pode ter espaços.')
      .regex(/^[^A-Z]*$/, 'Use apenas letras minúsculas.')
      .regex(
        /^[a-z0-9._]*$/,
        'Use apenas letras sem acento, números, ponto (.) ou sublinhado (_).',
      ),
    email: z.string().trim().pipe(z.email('Informe um e-mail válido.')),
    password: z
      .string()
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/,
        'A senha deve ter ao menos 8 caracteres, com letras e números.',
      ),
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem.',
  });

export type SignUpSchema = z.infer<typeof signUpSchema>;
