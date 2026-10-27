import { useEffect, useState } from 'react';

const ACTIVATION_OFFSET = 120;

export function useIsSectionActive(sectionId: string, enabled: boolean) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let frame = 0;

    function update() {
      const section = document.getElementById(sectionId);

      if (!section) {
        setIsActive(false);
        return;
      }

      const { top, bottom } = section.getBoundingClientRect();
      setIsActive(top <= ACTIVATION_OFFSET && bottom > ACTIVATION_OFFSET);
    }

    function handleScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [enabled, sectionId]);

  return enabled && isActive;
}
