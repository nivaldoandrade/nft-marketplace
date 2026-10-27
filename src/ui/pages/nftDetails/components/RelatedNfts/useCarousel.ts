import { useEffect, useRef, useState } from 'react';

export function useCarousel(itemsCount: number) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const observer = new ResizeObserver(() => {
      setPageCount(Math.max(1, Math.round(track.scrollWidth / track.clientWidth)));
    });

    observer.observe(track);

    return () => observer.disconnect();
  }, [itemsCount]);

  function handleScroll() {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const maxScroll = track.scrollWidth - track.clientWidth;
    const progress = maxScroll > 0 ? track.scrollLeft / maxScroll : 0;

    setPage(Math.round(progress * (pageCount - 1)));
  }

  function handleGoToPage(index: number) {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const maxScroll = track.scrollWidth - track.clientWidth;

    track.scrollTo({ left: (maxScroll * index) / Math.max(pageCount - 1, 1), behavior: 'smooth' });
  }

  return { trackRef, page, pageCount, handleScroll, handleGoToPage };
}
