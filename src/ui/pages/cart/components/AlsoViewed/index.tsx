import { useListNfts } from '@/app/hooks/queries/nfts/useListNfts';
import { NftSort, NftTab } from '@/app/types/Nft';
import { NftCarousel } from '@/ui/components/NftCarousel';

type AlsoViewedProps = {
  excludeIds: string[];
};

export function AlsoViewed({ excludeIds }: AlsoViewedProps) {
  const { nfts, isPending, isError } = useListNfts({
    tab: NftTab.TRENDING,
    sort: NftSort.RECENT,
    page: 1,
    perPage: 15,
  });
  const visible = nfts.filter((nft) => !excludeIds.includes(nft.id)).slice(0, 10);

  if (isError || (!isPending && visible.length === 0)) {
    return null;
  }

  return (
    <NftCarousel
      id="also-viewed"
      title="Colecionadores também viram"
      nfts={visible}
      isPending={isPending}
    />
  );
}
