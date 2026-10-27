import { Link } from '@tanstack/react-router';

import type { NftCategory } from '@/app/types/Nft';
import { Container } from '@/ui/components/Container';
import { Newsletter } from '@/ui/components/Footer/Newsletter';
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
} from '@/ui/components/Icons';
import { Logo } from '@/ui/components/Logo';
import { useCatalogLink } from '@/ui/hooks/useCatalogLink';
import { useOpenPrivatePage } from '@/ui/hooks/useOpenPrivatePage';
import { cn } from '@/ui/utils/cn';
import { categoryLabels } from '@/ui/utils/labels';
import { notifyUnavailable } from '@/ui/utils/notifyUnavailable';

const highlights = [
  {
    mark: 'W',
    title: 'Segurança da carteira',
    description: 'Proteja sua carteira e colecione arte digital verificada com confiança.',
  },
  {
    mark: 'C',
    title: 'Criadores em destaque',
    description: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
  },
  {
    mark: 'D',
    title: 'Alertas de lançamentos',
    description:
      'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
  },
];

const profileLinks = [
  { label: 'Meu perfil', path: '/perfil/dados' },
  { label: 'Minha coleção' },
  { label: 'Atividade' },
  { label: 'Estúdio do criador' },
  { label: 'Lista de interesse', path: '/perfil/lista-de-interesse' },
] as const;

const helpLinks = [
  'Central de ajuda',
  'Como comprar NFTs',
  'Carteira e segurança',
  'Política do mercado',
  'Denunciar item',
];

const collectionLinks: NftCategory[] = ['digital-art', 'photography', 'music', '3d-art', 'utility'];

const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com', Icon: FacebookIcon },
  { label: 'Instagram', href: 'https://www.instagram.com', Icon: InstagramIcon },
  { label: 'X (Twitter)', href: 'https://x.com', Icon: TwitterIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com', Icon: LinkedinIcon },
  { label: 'YouTube', href: 'https://www.youtube.com', Icon: YoutubeIcon },
];

const listTitleClassName = 'text-lg leading-4 font-bold';
const listItemClassName = 'text-sm leading-[30px] text-foreground hover:text-accent';

type FooterProps = {
  className?: string;
};

export function Footer({ className }: FooterProps) {
  const catalogLink = useCatalogLink();
  const openPrivatePage = useOpenPrivatePage();

  return (
    <footer
      className={cn(
        'mt-16 pb-[calc(7rem+env(safe-area-inset-bottom))] md:mt-24 md:pb-6',
        className,
      )}
    >
      <Container>
        <section aria-label="Vantagens da Kurio" className="bg-card p-6 md:p-8 xl:pb-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-7 xl:grid-cols-[repeat(3,265px)_1fr] xl:gap-0">
            {highlights.map((highlight) => (
              <div
                key={highlight.mark}
                className="flex flex-col gap-3 max-md:items-center max-md:text-center xl:border-r xl:border-primary xl:px-4"
              >
                <span
                  aria-hidden="true"
                  className="flex size-[74px] items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground"
                >
                  {highlight.mark}
                </span>
                <h2 className="text-[17px] leading-5 font-bold xl:leading-4">{highlight.title}</h2>
                <p className="max-w-[204px] text-sm leading-[22px] text-muted-foreground">
                  {highlight.description}
                </p>
              </div>
            ))}
            <Newsletter />
          </div>
        </section>

        <div className="grid items-center gap-4 bg-muted p-6 text-sm leading-[22px] max-md:justify-items-center max-md:text-center sm:grid-cols-2 md:p-8 xl:h-[88px] xl:grid-cols-[repeat(3,210px)_1fr] xl:gap-x-[92px] xl:py-0">
          <Logo className="self-center" />
          <p className="whitespace-pre">{'Feito para colecionadores,\ncriadores e cultura'}</p>
          <a href="mailto:contato@email.com" className="self-center hover:text-accent">
            contato@email.com
          </a>
          <a href="tel:+551140028922" className="self-center hover:text-accent">
            +55 11 4002 8922
          </a>
        </div>

        <div className="grid gap-8 bg-card p-6 max-md:text-center sm:grid-cols-2 md:p-8 xl:grid-cols-[repeat(3,178px)_1fr] xl:gap-x-[124px]">
          <nav aria-labelledby="footer-profile" className="flex flex-col gap-2 max-md:items-center">
            <h2 id="footer-profile" className={listTitleClassName}>
              Meu perfil
            </h2>
            <ul>
              {profileLinks.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    className={listItemClassName}
                    onClick={() =>
                      'path' in link ? openPrivatePage(link.path) : notifyUnavailable(link.label)
                    }
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-help" className="flex flex-col gap-2 max-md:items-center">
            <h2 id="footer-help" className={listTitleClassName}>
              Central de ajuda
            </h2>
            <ul>
              {helpLinks.map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    className={listItemClassName}
                    onClick={() => notifyUnavailable(label)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-labelledby="footer-collections"
            className="flex flex-col gap-2 max-md:items-center"
          >
            <h2 id="footer-collections" className={listTitleClassName}>
              Coleções
            </h2>
            <ul>
              {collectionLinks.map((category) => (
                <li key={category}>
                  <Link
                    to="/"
                    search={{ category: [category] }}
                    {...catalogLink}
                    className={listItemClassName}
                  >
                    {categoryLabels[category]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-8 max-md:items-center">
            <div className="flex flex-col gap-5 max-md:items-center">
              <h2 className={listTitleClassName}>Redes sociais</h2>
              <ul className="flex gap-2.5">
                {socialLinks.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${label} (abre em nova aba)`}
                      className="flex size-[30px] items-center justify-center rounded border border-primary text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <Icon className="h-3.5 w-auto" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 max-md:items-center">
              <h2 className={listTitleClassName}>Carteiras compatíveis</h2>
              <p className="w-[228px] rounded-md border border-input bg-muted py-2 pl-2.5 text-[9px] leading-3 font-bold tracking-[0.01em] whitespace-pre text-accent">
                {'METAMASK  •  WALLETCONNECT  •  COINBASE'}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-1.5 text-center text-sm leading-[30px]">
          © 2026 Kurio. Propriedade digital para todos.
        </p>
      </Container>
    </footer>
  );
}
