import { Container } from '@/ui/components/Container';
import { getImageSrcSet } from '@/ui/utils/image';
import { notifyUnavailable } from '@/ui/utils/notifyUnavailable';

const articles = [
  {
    date: '12 de setembro',
    readTime: 'Leitura de 6 min',
    title: 'Como funciona a propriedade de NFTs',
    excerpt: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
    image: '/images/nfts/ivory-baron-400.webp',
  },
  {
    date: '13 de setembro',
    readTime: 'Leitura de 2 min',
    title: '10 artistas digitais para acompanhar',
    excerpt: 'Conheça criadores que moldam a cultura digital.',
    image: '/images/nfts/emerald-ape-400.webp',
  },
  {
    date: '15 de setembro',
    readTime: 'Leitura de 3 min',
    title: 'Raridade, atributos e procedência',
    excerpt: 'Entenda raridade, procedência, direitos autorais e utilidade.',
    image: '/images/nfts/sage-nomad-400.webp',
  },
  {
    date: '15 de setembro',
    readTime: 'Leitura de 2 min',
    title: 'Como proteger sua carteira',
    excerpt: 'Proteja sua carteira, seus ativos e sua identidade.',
    image: '/images/nfts/golden-beat-400.webp',
  },
];

export function Journal() {
  return (
    <Container className="mt-16 md:mt-24">
      <section aria-labelledby="journal-title" className="flex flex-col gap-10">
        <header className="flex flex-col gap-3 text-center">
          <h2 id="journal-title" className="text-2xl font-bold md:text-[28px] md:leading-[37px]">
            Diário da Cunhagem
          </h2>
          <p className="text-sm leading-[18px] text-muted-foreground">
            Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
          </p>
        </header>

        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-[repeat(4,268px)]">
          {articles.map((article) => (
            <li key={article.title}>
              <article className="flex h-full flex-col overflow-hidden rounded-lg bg-card">
                <img
                  src={article.image}
                  srcSet={getImageSrcSet(article.image)}
                  sizes="(min-width: 1280px) 268px, (min-width: 640px) 50vw, 100vw"
                  alt=""
                  width={400}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  className="h-[195px] w-full object-cover"
                />
                <div className="flex flex-1 flex-col gap-2 px-4 pt-3 pb-4">
                  <p className="text-xs leading-4 font-medium whitespace-pre-wrap text-muted-foreground">
                    <time>{article.date}</time>
                    <span aria-hidden="true">{'  |  '}</span>
                    <span className="sr-only">, </span>
                    {article.readTime}
                  </p>
                  <h3 className="text-base leading-[21px] font-bold">{article.title}</h3>
                  <p className="text-xs leading-4 font-medium text-muted-foreground">
                    {article.excerpt}
                  </p>
                  <button
                    type="button"
                    onClick={() => notifyUnavailable('O conteúdo editorial')}
                    className="mt-auto flex w-fit items-center gap-1 text-xs leading-[14px] font-bold text-accent hover:underline"
                  >
                    Ler mais
                    <span aria-hidden="true" className="leading-4 font-normal">
                      →
                    </span>
                    <span className="sr-only">: {article.title}</span>
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
