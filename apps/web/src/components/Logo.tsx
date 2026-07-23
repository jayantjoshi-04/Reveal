/** REVEAL brand marks. The aperture is a gradient "lens" that opens/reveals —
 *  it doubles as the loader spinner. The wordmark is set in the display serif. */
import { Link } from 'react-router-dom';

let gid = 0;

/** The aperture lens mark on its own (also used spinning in the loader). */
export function LogoMark({ className = '', spin = false }: { className?: string; spin?: boolean }): JSX.Element {
  const id = `lg${gid++}`;
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c3aed" />
          <stop offset="0.5" stopColor="#a878f8" />
          <stop offset="1" stopColor="#bee65f" />
        </linearGradient>
      </defs>
      <g className={spin ? 'origin-center animate-aperture-spin' : ''}>
        <circle
          cx="16"
          cy="16"
          r="11"
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="50 19"
          transform="rotate(-90 16 16)"
        />
      </g>
      <circle cx="16" cy="16" r="3.1" fill={`url(#${id})`} />
    </svg>
  );
}

/** Full lockup: aperture mark + "Reveal" wordmark. */
export function Logo({
  className = '',
  markClass = 'h-6 w-6',
  wordClass = 'text-[19px]',
  showMark = true,
}: {
  className?: string;
  markClass?: string;
  wordClass?: string;
  showMark?: boolean;
}): JSX.Element {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {showMark ? <LogoMark className={markClass} /> : null}
      <span
        className={`font-display font-medium tracking-tight ${/\btext-/.test(wordClass) ? '' : 'text-slate-900 dark:text-white'} ${wordClass}`}
        style={{ letterSpacing: '-0.02em' }}
      >
        Reveal
      </span>
    </span>
  );
}

/** Logo that links home — use in every app chrome (nav, sidebars, headers). */
export function LogoLink(props: Parameters<typeof Logo>[0] & { to?: string }): JSX.Element {
  const { to = '/', ...rest } = props;
  return (
    <Link to={to} className="press inline-flex" aria-label="Reveal — home">
      <Logo {...rest} />
    </Link>
  );
}
