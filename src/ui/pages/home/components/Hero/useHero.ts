import { useCallback, useEffect, useState } from 'react';

import { useFeaturedNfts } from '@/app/hooks/queries/nfts/useFeaturedNfts';
import { usePrefersReducedMotion } from '@/ui/hooks/usePrefersReducedMotion';

const AUTOPLAY_INTERVAL_MS = 6000;

export function useHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const { hero, isPending } = useFeaturedNfts();
  const prefersReducedMotion = usePrefersReducedMotion();
  const total = hero.length;

  useEffect(() => {
    if (isPaused || prefersReducedMotion || total < 2) {
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex((previous) => (previous + 1) % total);
    }, AUTOPLAY_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isPaused, prefersReducedMotion, total]);

  const handlePause = useCallback(() => setIsPaused(true), []);
  const handleResume = useCallback(() => setIsPaused(false), []);

  return {
    slides: hero,
    activeSlide: hero[activeIndex],
    secondarySlide: hero[(activeIndex + 1) % Math.max(total, 1)],
    activeIndex,
    isPending,
    isPaused,
    setActiveIndex,
    handlePause,
    handleResume,
  };
}
