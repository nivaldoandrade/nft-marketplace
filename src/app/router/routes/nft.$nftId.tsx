import { noop } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { nftQueryOptions } from '@/app/hooks/queries/nfts/useGetNftById';
import { relatedNftsQueryOptions } from '@/app/hooks/queries/nfts/useRelatedNfts';
import { NftDetails } from '@/ui/pages/nftDetails';

export const Route = createFileRoute('/nft/$nftId')({
  loader: ({ context, params }) => {
    context.queryClient.query(nftQueryOptions(params.nftId)).catch(noop);
    context.queryClient.query(relatedNftsQueryOptions(params.nftId)).catch(noop);
  },
  component: NftDetails,
});
