import type { ReactNode } from 'react';
import { useCanvasScale } from './useCanvasScale';

type FixedCanvasProps = {
  /** Design width in px (Figma frame width). */
  width?: number;
  /** Design height in px (Figma frame height). */
  height: number;
  children: ReactNode;
};

/**
 * Centres a fixed-size design canvas and scales it to fit the viewport width,
 * preserving the exact 1440px Figma layout. The outer box collapses to the
 * scaled size so page flow (and scrollbars) stay correct.
 */
export function FixedCanvas({ width = 1440, height, children }: FixedCanvasProps) {
  const scale = useCanvasScale(width);

  return (
    <div
      style={{
        width: width * scale,
        height: height * scale,
        margin: '0 auto',
        overflow: 'hidden',
      }}
    >
      <div
        className="relative bg-white"
        style={{
          width,
          height,
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
