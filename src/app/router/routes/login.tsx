import { createFileRoute, redirect } from '@tanstack/react-router';

import { AuthMode } from '@/app/router/authSearch';

export const Route = createFileRoute('/login')({
  beforeLoad: ({ search }) => {
    throw redirect({ to: '/', search: { auth: AuthMode.SIGN_IN, redirect: search.redirect } });
  },
});
