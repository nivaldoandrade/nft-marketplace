import { useEffect } from 'react';

const APP_TITLE = 'Kurio | Marketplace de NFTs';

// each page names the browser tab, which also helps screen readers and the history
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | Kurio` : APP_TITLE;
  }, [title]);
}
