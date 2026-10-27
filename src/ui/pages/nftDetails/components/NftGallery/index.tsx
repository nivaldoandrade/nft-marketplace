import { useRouter, useCanGoBack } from '@tanstack/react-router';

import { ArrowLeftIcon, HeartOutlineIcon, SearchIcon } from '@/ui/components/Icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/ui/components/ui/dialog';
import { useNftGallery } from '@/ui/pages/nftDetails/components/NftGallery/useNftGallery';
import { cn } from '@/ui/utils/cn';
import { getImageSrcSet, getLargeImage } from '@/ui/utils/image';
import { notifyUnavailable } from '@/ui/utils/notifyUnavailable';

type NftGalleryProps = {
  name: string;
  collectionName: string;
  images: string[];
};

const roundButtonClassName =
  'flex size-[35px] items-center justify-center rounded-full border border-border bg-secondary pressable hover:text-accent';

export function NftGallery({ name, collectionName, images }: NftGalleryProps) {
  const { activeIndex, mobileIndex, trackRef, setActiveIndex, handleTrackScroll, handleGoToSlide } =
    useNftGallery();
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const alt = (index: number) =>
    `${name}, coleção ${collectionName} — imagem ${index + 1} de ${images.length}`;

  function handleBack() {
    if (canGoBack) {
      router.history.back();
      return;
    }

    router.navigate({ to: '/' });
  }

  return (
    <>
      <section
        aria-roledescription="carrossel"
        aria-label="Imagens do NFT"
        data-top-tint
        className="relative -mx-6 h-[506px] bg-[linear-gradient(var(--card),transparent_120px),linear-gradient(to_bottom_right,var(--card),var(--secondary))] px-7 pt-[23px] md:hidden"
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Voltar"
            className={roundButtonClassName}
          >
            <ArrowLeftIcon className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => notifyUnavailable('A lista de favoritos')}
            aria-label="Favoritar"
            className={cn(roundButtonClassName, 'text-accent')}
          >
            <HeartOutlineIcon className="size-4" />
          </button>
        </div>

        <ul
          ref={trackRef}
          onScroll={handleTrackScroll}
          className="mt-2 flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto"
        >
          {images.map((image, index) => (
            <li
              key={index}
              aria-roledescription="slide"
              aria-label={`${index + 1} de ${images.length}`}
              className="w-full shrink-0 snap-center"
            >
              <img
                src={getLargeImage(image)}
                srcSet={getImageSrcSet(image)}
                sizes="calc(100vw - 56px)"
                alt={alt(index)}
                width={800}
                height={800}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="aspect-[361/356] w-full rounded-3xl object-cover"
              />
            </li>
          ))}
        </ul>

        {images.length > 1 && (
          <div
            role="group"
            aria-label="Escolher imagem"
            className="absolute inset-x-0 top-[356px] flex items-center justify-center gap-1.5"
          >
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleGoToSlide(index)}
                aria-label={`Mostrar imagem ${index + 1} de ${images.length}`}
                aria-current={index === mobileIndex}
                className="flex h-6 items-center justify-center"
              >
                <span
                  className={cn(
                    'h-[7px] rounded-full bg-primary transition-all',
                    index === mobileIndex ? 'w-7' : 'w-[7px]',
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </section>

      <section
        aria-label="Imagens do NFT"
        className="hidden gap-4 self-start md:flex md:flex-col-reverse lg:flex-row lg:items-start lg:gap-7"
      >
        <ul className="flex gap-4 lg:flex-col">
          {images.map((image, index) => (
            <li key={index} className="w-[calc((100%-48px)/4)] lg:w-[100px]">
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Mostrar imagem ${index + 1} de ${images.length}`}
                aria-current={index === activeIndex}
                className={cn(
                  'block aspect-square w-full overflow-hidden rounded-lg border transition-colors',
                  index === activeIndex
                    ? 'border-primary'
                    : 'border-transparent hover:border-primary/50',
                )}
              >
                <img
                  src={image}
                  alt=""
                  width={400}
                  height={400}
                  className="size-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>

        <div className="relative aspect-square min-w-0 flex-1 self-start rounded-md bg-card p-5 lg:mt-0.5">
          <img
            src={getLargeImage(images[activeIndex])}
            srcSet={getImageSrcSet(images[activeIndex])}
            sizes="(min-width: 1280px) 412px, (min-width: 1024px) 30vw, 45vw"
            alt={alt(activeIndex)}
            width={800}
            height={800}
            fetchPriority="high"
            className="size-full rounded-3xl object-cover"
          />
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                aria-label="Ampliar imagem"
                className="absolute top-[13px] right-[13px] flex size-[30px] items-center justify-center rounded-full border border-border bg-secondary pressable hover:text-accent"
              >
                <SearchIcon className="size-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[min(90vw,800px)] border-border bg-card p-4 sm:max-w-[min(90vw,800px)]">
              <DialogTitle className="sr-only">{name}</DialogTitle>
              <DialogDescription className="sr-only">
                Imagem ampliada {activeIndex + 1} de {images.length}
              </DialogDescription>
              <img
                src={getLargeImage(images[activeIndex])}
                alt={alt(activeIndex)}
                width={800}
                height={800}
                className="max-h-[80dvh] w-full rounded-2xl object-contain"
              />
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </>
  );
}
