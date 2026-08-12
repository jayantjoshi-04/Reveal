import { useState } from 'react';

type Placeholder = 'box' | 'line' | 'blank';

type AssetProps = {
  /** Path under /public, e.g. from the `A` manifest. */
  src: string;
  /** Accessible description / placeholder label. */
  alt: string;
  /**
   * Class list for the <img> itself. Defaults to the Figma pattern of an
   * absolutely-positioned image that fills its parent box.
   */
  imgClassName?: string;
  /** What to show while the real asset is missing. */
  placeholder?: Placeholder;
};

const DEFAULT_IMG = 'absolute inset-0 max-w-none object-cover pointer-events-none size-full';

/**
 * Renders an illustration, falling back to a dimension-preserving placeholder
 * when the exported file has not been dropped into /public/assets yet.
 * The parent element supplies the exact position/size (from the Figma coords),
 * so swapping in the real PNG never moves anything.
 */
export function Asset({ src, alt, imgClassName, placeholder = 'box' }: AssetProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    if (placeholder === 'blank') return null;
    if (placeholder === 'line') {
      return (
        <div className="pointer-events-none absolute inset-0 flex items-center">
          <div className="h-px w-full bg-ink/15" />
        </div>
      );
    }
    return (
      <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center rounded-md border border-dashed border-teal/25 bg-teal/[0.04] px-1 text-center font-sans text-[10px] leading-tight text-teal/45">
        {alt}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      onError={() => setFailed(true)}
      className={imgClassName ?? DEFAULT_IMG}
    />
  );
}
