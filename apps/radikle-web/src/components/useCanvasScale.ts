import { useEffect, useState } from 'react';

/**
 * The Figma design is a fixed 1440px-wide canvas. To honour it exactly while
 * staying usable on smaller screens, we scale the whole canvas down to fit the
 * viewport width (never up past 1:1). Returns the current scale factor.
 */
export function useCanvasScale(designWidth = 1440): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setScale(Math.min(1, w / designWidth));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [designWidth]);

  return scale;
}
