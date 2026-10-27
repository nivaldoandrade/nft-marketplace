import { useFeaturedNfts } from '@/app/hooks/queries/nfts/useFeaturedNfts';
import { Container } from '@/ui/components/Container';
import { type Promo, PromoBanner } from '@/ui/pages/home/components/PromoBanners/PromoBanner';

const promos: Promo[] = [
  {
    title: 'Lançamentos gênesis\nde edição limitada',
    description: 'Colecione edições escassas diretamente dos criadores antes da revelação pública.',
    search: { tab: 'new' },
  },
  {
    title: 'Arte digital selecionada\ne muito mais',
    description:
      'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.',
    search: { category: ['digital-art'] },
  },
];

export function PromoBanners() {
  const { promos: nfts, isPending } = useFeaturedNfts();

  return (
    <Container className="mt-16 md:mt-24">
      <ul className="grid gap-6 lg:grid-cols-2 lg:gap-7">
        {promos.map((promo, index) => (
          <PromoBanner key={promo.title} promo={promo} nft={nfts[index]} isPending={isPending} />
        ))}
      </ul>
    </Container>
  );
}
