import { Link } from '@tanstack/react-router';

import { cn } from '@/ui/utils/cn';

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Link
      to="/"
      aria-label="Kurio, página inicial"
      className={cn('text-sm font-bold tracking-[0.1em] text-foreground', className)}
    >
      KURIO
    </Link>
  );
}
