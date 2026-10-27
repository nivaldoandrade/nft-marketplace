import { useRef, useState } from 'react';

export function useNftGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const trackRef = useRef<HTMLUListElement>(null);

  function handleTrackScroll() {
    const track = trackRef.current;

    if (track) {
      setMobileIndex(Math.round(track.scrollLeft / track.clientWidth));
    }
  }

  function handleGoToSlide(index: number) {
    const track = trackRef.current;

    track?.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
  }

  return {
    activeIndex,
    mobileIndex,
    trackRef,
    setActiveIndex,
    handleTrackScroll,
    handleGoToSlide,
  };
}
