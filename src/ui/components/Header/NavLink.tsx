import { type UseLinkPropsOptions, useLinkProps } from '@tanstack/react-router';

type NavLinkProps = Omit<UseLinkPropsOptions, 'children'> & {
  ariaCurrent?: 'page' | 'location';
  children: React.ReactNode;
};

export function NavLink({ ariaCurrent, children, ...options }: NavLinkProps) {
  const { 'data-status': _status, ...props } = useLinkProps(options) as ReturnType<
    typeof useLinkProps
  > & { 'data-status'?: string };

  return (
    <a {...props} aria-current={ariaCurrent}>
      {children}
    </a>
  );
}
