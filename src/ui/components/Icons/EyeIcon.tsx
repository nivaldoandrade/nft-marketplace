import type { SVGProps } from 'react';

export function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22.67 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2.75 10c1.9-3.6 4.95-6.25 8.58-6.25s6.68 2.65 8.58 6.25c-1.9 3.6-4.95 6.25-8.58 6.25S4.65 13.6 2.75 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="11.33" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
