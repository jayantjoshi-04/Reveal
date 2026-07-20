import { LogoMark } from './Logo.js';

/** Branded full-screen loader: the aperture opens (spins) while the wordmark
 *  is swept by a light "reveal" shine. Themed for light + dark. */
export function Loader({ label = 'Revealing…' }: { label?: string }): JSX.Element {
  return (
    <div className="bg-mesh fixed inset-0 z-50 flex flex-col items-center justify-center gap-6">
      <LogoMark className="h-14 w-14" spin />
      <div className="relative overflow-hidden">
        <span
          className="font-display text-2xl font-medium tracking-tight text-slate-900 dark:text-white"
          style={{ letterSpacing: '-0.02em' }}
        >
          Reveal
        </span>
        {/* light sweep revealing the wordmark */}
        <span className="pointer-events-none absolute inset-0 -skew-x-12 animate-shine bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/25" />
      </div>
      {label ? <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">{label}</div> : null}
    </div>
  );
}

/** Small inline spinner (aperture) for buttons/among content. */
export function Spinner({ className = 'h-5 w-5' }: { className?: string }): JSX.Element {
  return <LogoMark className={className} spin />;
}
