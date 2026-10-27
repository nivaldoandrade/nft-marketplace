import { getRouteApi } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useCatalog } from '@/ui/pages/home/useCatalog';

const route = getRouteApi('/');

export function useOutOfRangePage() {
  const { search, totalPages, isPending, isPlaceholderData, isError } = useCatalog();
  const navigate = route.useNavigate();

  const lastPage = Math.max(totalPages, 1);
  const isOutOfRange = !isPending && !isPlaceholderData && !isError && search.page > lastPage;

  useEffect(() => {
    if (isOutOfRange) {
      navigate({
        search: (previous) => ({ ...previous, page: lastPage }),
        replace: true,
        resetScroll: false,
      });
    }
  }, [isOutOfRange, lastPage, navigate]);
}
