import { useEffect, useState } from 'react';

/**
 * The Figma design is a fixed 1440px-wide canvas. We scale the whole canvas to
 * always fill the viewport width — down on smaller screens and up on wider
 * ones — so the full-bleed colour bands reach both edges with no white gutters.
 * Returns the current scale factor.
 */
export function useCanvasScale(designWidth = 1440): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      // clientWidth excludes the vertical scrollbar, so filling the width
      // never spawns a horizontal scrollbar.
      const w = document.documentElement.clientWidth || window.innerWidth;
      setScale(w / designWidth);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [designWidth]);

  return scale;
}
