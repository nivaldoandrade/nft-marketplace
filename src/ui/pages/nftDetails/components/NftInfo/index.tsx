import type { EditionType, Nft } from '@/app/types/Nft';
import { StarIcon } from '@/ui/components/Icons';
import { EditionSelector } from '@/ui/pages/nftDetails/components/EditionSelector';
import { RatingStars } from '@/ui/pages/nftDetails/components/RatingStars';
import { ShareLinks } from '@/ui/pages/nftDetails/components/ShareLinks';
import { formatPrice } from '@/ui/utils/formatPrice';

type NftInfoProps = {
  nft: Nft;
  selectedEdition: EditionType | undefined;
  onSelectEdition: (type: EditionType) => void;
  onShowReviews: () => void;
  children?: React.ReactNode;
};

export function NftInfo({
  nft,
  selectedEdition,
  onSelectEdition,
  onShowReviews,
  children,
}: NftInfoProps) {
  const rating = nft.rating.toFixed(1);
  const ratingLabel = `Avaliação ${rating} de 5, ${nft.reviewsCount} avaliações de colecionadores`;

  return (
    <section
      aria-labelledby="nft-title"
      className="relative -mx-6 -mt-[114px] flex flex-col rounded-t-[31px] bg-card px-6 pt-8 pb-6 md:mx-0 md:mt-0 md:rounded-none md:bg-transparent md:p-0"
    >
      <div className="flex items-center justify-between gap-4 md:block">
        <h1 id="nft-title" className="text-xl leading-4 font-bold md:text-[28px] md:leading-[37px]">
          {nft.name}
        </h1>
        <button
          type="button"
          onClick={onShowReviews}
          aria-label={ratingLabel}
          className="flex h-[27px] shrink-0 items-center gap-1 rounded-full border border-primary px-1.5 text-sm leading-4 md:hidden"
        >
          <StarIcon className="size-3.5 text-amber" />
          <span className="font-medium">{rating}</span>
          <span className="text-muted-foreground">({nft.reviewsCount})</span>
        </button>
      </div>

      <div className="mt-3 hidden flex-wrap items-center justify-between gap-x-6 gap-y-2 md:flex">
        <p className="flex items-baseline gap-3 text-[22px] leading-4 font-bold text-accent">
          <span>
            <span className="sr-only">Preço: </span>
            {formatPrice(nft.price)}
          </span>
          {nft.compareAtPrice && (
            <span className="text-base font-normal text-subtle line-through">
              <span className="sr-only">Preço anterior: </span>
              {formatPrice(nft.compareAtPrice)}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={onShowReviews}
          aria-label={ratingLabel}
          className="flex shrink-0 items-center gap-1 text-[15px] leading-5 whitespace-nowrap transition-colors hover:text-accent"
        >
          <RatingStars rating={nft.rating} />
          {nft.reviewsCount} avaliações
          <span className="hidden lg:inline"> de colecionadores</span>
        </button>
      </div>

      <hr className="mt-3 hidden border-primary/30 md:block" />

      <h2 className="mt-[13px] hidden text-[15px] leading-4 font-bold md:block">Sobre este NFT:</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground md:max-w-[574px]">
        {nft.description}
      </p>

      <EditionSelector
        name="edition"
        editions={nft.editions}
        selected={selectedEdition}
        onSelect={onSelectEdition}
        className="mt-3 md:mt-[7px]"
      />

      {children && <div className="md:mt-3.5">{children}</div>}

      <dl className="mt-3 flex flex-col gap-3 text-[15px] leading-5 text-subtle">
        <div className="flex gap-1.5">
          <dt>ID do token:</dt>
          <dd>{nft.tokenId}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Coleção:</dt>
          <dd>{nft.collection.name}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Atributos:</dt>
          <dd>{nft.attributes.join(', ')}</dd>
        </div>
      </dl>

      <div className="mt-3 md:mt-2">
        <ShareLinks name={nft.name} />
      </div>
    </section>
  );
}
