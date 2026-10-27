import { Container } from '@/ui/components/Container';
import { usePageTitle } from '@/ui/hooks/usePageTitle';
import { Catalog } from '@/ui/pages/home/components/Catalog';
import { Hero } from '@/ui/pages/home/components/Hero';
import { Journal } from '@/ui/pages/home/components/Journal';
import { MobileSearch } from '@/ui/pages/home/components/MobileSearch';
import { PromoBanners } from '@/ui/pages/home/components/PromoBanners';

export function Home() {
  usePageTitle();
  return (
    <>
      <Container className="flex flex-col gap-4 pt-10 md:gap-0 md:pt-8">
        <MobileSearch />
        <Hero />
      </Container>
      <Catalog />
      <PromoBanners />
      <Journal />
    </>
  );
}
