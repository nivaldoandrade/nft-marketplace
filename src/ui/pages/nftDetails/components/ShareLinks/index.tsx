import { LinkedinIcon, MailIcon, TwitterIcon } from '@/ui/components/Icons';

type ShareLinksProps = {
  name: string;
};

export function ShareLinks({ name }: ShareLinksProps) {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(`${name} na Kurio`);

  const links = [
    {
      label: 'Compartilhar no LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      icon: <LinkedinIcon className="h-3.5 w-[15px]" />,
      external: true,
    },
    {
      label: 'Compartilhar por e-mail',
      href: `mailto:?subject=${text}&body=${url}`,
      icon: <MailIcon className="size-[18px]" />,
      external: false,
    },
    {
      label: 'Compartilhar no X',
      href: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      icon: <TwitterIcon className="h-3 w-4" />,
      external: true,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <p className="text-[15px] leading-4 font-bold">Compartilhar este NFT:</p>
      <ul className="flex items-center gap-1">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              aria-label={link.external ? `${link.label} (abre em nova aba)` : link.label}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="flex size-6 items-center justify-center text-foreground transition-colors hover:text-accent"
            >
              {link.icon}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
