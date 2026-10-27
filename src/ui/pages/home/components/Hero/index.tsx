import { Link } from '@tanstack/react-router';

import { ArrowRightIcon } from '@/ui/components/Icons';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { useHero } from '@/ui/pages/home/components/Hero/useHero';
import { cn } from '@/ui/utils/cn';
import { getImageSrcSet } from '@/ui/utils/image';
import { CATALOG_SECTION_ID } from '@/ui/utils/sections';

export function Hero() {
  const {
    slides,
    activeSlide,
    secondarySlide,
    activeIndex,
    isPending,
    isPaused,
    setActiveIndex,
    handlePause,
    handleResume,
  } = useHero();

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques da Kurio"
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onFocus={handlePause}
      onBlur={handleResume}
      className="relative isolate flex min-h-[190px] flex-col gap-4 overflow-hidden rounded-xl bg-linear-to-br from-primary/20 to-primary/10 px-4 pt-[5px] pb-1.5 md:block md:min-h-0 md:overflow-visible md:rounded-none md:bg-none md:p-0"
    >
      <span
        aria-hidden="true"
        className="absolute -top-8 -left-20 -z-10 size-62 rounded-full bg-linear-to-br from-[#DD9A5F]/40 to-primary/5 md:hidden"
      />
      <span
        aria-hidden="true"
        className="absolute -top-2.5 left-18 -z-10 size-62 rounded-full bg-linear-to-br from-[#DD9A5F]/35 to-transparent md:hidden"
      />

      <div className="flex gap-2 md:items-stretch md:gap-10 md:pl-6 lg:gap-[110px] lg:pl-10">
        <div className="relative flex min-w-0 flex-1 flex-col md:pt-[43px] md:pb-11">
          <p className="text-xs leading-4 font-medium md:text-sm md:tracking-[0.1em]">
            Bem-vindo à Kurio
          </p>
          <h1 className="mt-1.5 text-lg leading-[29px] font-bold uppercase md:mt-2 md:text-[26px] md:leading-[44px] lg:text-[34px] lg:leading-[56px] xl:text-[43px] xl:leading-[70px]">
            <span className="md:hidden">
              Seja dono da
              <br />
              cultura digital
            </span>
            <span className="hidden md:inline">
              Seja dono do futuro
              <br />
              da arte digital
            </span>
          </h1>
          <p className="mt-1.5 max-w-[557px] text-xs leading-[18px] text-muted-foreground md:mt-1 md:text-sm md:leading-6">
            <span className="md:hidden">
              Descubra NFTs selecionados de criadores do mundo todo.
            </span>
            <span className="hidden md:inline">
              Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte
              digital rara, apoie artistas e tenha uma parte da cultura da internet.
            </span>
          </p>
          <a
            href={`#${CATALOG_SECTION_ID}`}
            className="flex w-fit items-center gap-2 text-xs leading-4 font-bold text-accent pressable md:mt-8 md:h-10 md:rounded-md md:bg-primary md:pt-0 md:pr-9 md:pl-7 md:text-base md:text-primary-foreground md:hover:bg-accent"
          >
            EXPLORAR
            <ArrowRightIcon className="size-4 md:hidden" />
          </a>
        </div>

        <div className="relative mt-[5px] size-[clamp(96px,calc(100vw-252px),138px)] shrink-0 md:mt-0 md:size-[320px] lg:size-[400px] xl:size-[450px]">
          {isPending || !activeSlide ? (
            <Skeleton className="size-full rounded-2xl md:rounded-3xl" />
          ) : (
            <>
              <Link
                to="/nft/$nftId"
                params={{ nftId: activeSlide.id }}
                className="block size-full rounded-2xl md:rounded-3xl"
              >
                <img
                  key={activeSlide.id}
                  src={activeSlide.image.replace('-400.', '-800.')}
                  srcSet={getImageSrcSet(activeSlide.image)}
                  sizes="(min-width: 1280px) 450px, (min-width: 1024px) 400px, (min-width: 768px) 320px, 138px"
                  alt={`${activeSlide.name}, coleção ${activeSlide.collection.name}`}
                  width={800}
                  height={800}
                  fetchPriority="high"
                  className="size-full rounded-2xl object-cover motion-safe:animate-in motion-safe:fade-in md:rounded-3xl"
                />
              </Link>
              {secondarySlide && secondarySlide.id !== activeSlide.id && (
                <img
                  src={secondarySlide.image}
                  alt=""
                  width={400}
                  height={400}
                  className="absolute bottom-[-8px] left-[10%] size-[42%] rounded-2xl border-2 border-card object-cover md:hidden"
                />
              )}
            </>
          )}
        </div>
      </div>
      {slides.length > 1 && (
        <div
          role="group"
          aria-label="Escolher destaque"
          className="mt-auto flex h-[7px] items-center justify-center md:absolute md:right-[356px] md:bottom-[35px] md:mt-0 md:h-auto lg:right-[506px] xl:right-[556px]"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Mostrar destaque ${index + 1} de ${slides.length}: ${slide.name}`}
              aria-current={index === activeIndex}
              className="flex h-6 w-[13px] items-center justify-center md:w-4"
            >
              <span
                className={cn(
                  'size-[7px] rounded-full bg-primary transition-opacity md:size-2',
                  index !== activeIndex && 'opacity-40',
                )}
              />
            </button>
          ))}
        </div>
      )}
      <p aria-live={isPaused ? 'polite' : 'off'} className="sr-only">
        {activeSlide ? `Destaque ${activeIndex + 1} de ${slides.length}: ${activeSlide.name}` : ''}
      </p>
    </section>
  );
}
