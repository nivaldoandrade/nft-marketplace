import { createFileRoute, redirect } from '@tanstack/react-router';

import { AuthMode } from '@/app/router/authSearch';

export const Route = createFileRoute('/cadastro')({
  beforeLoad: ({ search }) => {
    throw redirect({ to: '/', search: { auth: AuthMode.SIGN_UP, redirect: search.redirect } });
  },
});
