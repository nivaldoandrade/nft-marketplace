import { noop } from '@tanstack/react-query';
import { createFileRoute, stripSearchParams } from '@tanstack/react-router';

import { featuredNftsQueryOptions } from '@/app/hooks/queries/nfts/useFeaturedNfts';
import { listNftsQueryOptions } from '@/app/hooks/queries/nfts/useListNfts';
import { Home } from '@/ui/pages/home';
import { catalogSearchDefaults, catalogSearchSchema, toListParams } from '@/ui/pages/home/schema';

export const Route = createFileRoute('/')({
  validateSearch: catalogSearchSchema,
  search: {
    middlewares: [stripSearchParams(catalogSearchDefaults)],
  },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    context.queryClient.query(listNftsQueryOptions(toListParams(deps))).catch(noop);
    context.queryClient.query(featuredNftsQueryOptions()).catch(noop);
  },
  component: Home,
});
