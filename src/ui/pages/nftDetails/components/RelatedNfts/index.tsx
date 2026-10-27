import { useRelatedNfts } from '@/app/hooks/queries/nfts/useRelatedNfts';
import { NftCarousel } from '@/ui/components/NftCarousel';

type RelatedNftsProps = {
  nftId: string;
};

export function RelatedNfts({ nftId }: RelatedNftsProps) {
  const { related, isPending, isError } = useRelatedNfts(nftId);

  if (isError || (!isPending && related.length === 0)) {
    return null;
  }

  return (
    <NftCarousel id="related" title="Mais desta coleção" nfts={related} isPending={isPending} />
  );
}
