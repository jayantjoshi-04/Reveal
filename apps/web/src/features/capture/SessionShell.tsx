import type { ReactNode } from 'react';

/** Premium centered card for a survey step: a fluid section-aware progress bar,
 *  a subtle channel chip, and the question content. */
export function SessionShell({
  progress,
  chip,
  chipTone = 'n',
  children,
}: {
  progress: number;
  chip: string;
  chipTone?: 'a' | 'b' | 'n' | 'sealed';
  children: ReactNode;
}): JSX.Element {
  const chipClass =
    chipTone === 'a'
      ? 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
      : chipTone === 'b'
        ? 'bg-accent-soft text-accent-dark dark:bg-accent/25 dark:text-accent-soft'
        : chipTone === 'sealed'
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
          : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400';

  const section = chipTone === 'a' ? 'Section A · what you say' : chipTone === 'b' ? 'Section B · what you do' : chipTone === 'sealed' ? 'Session sealed' : 'Getting started';
  const pct = Math.round(progress * 100);

  return (
    <div className="w-full max-w-xl animate-fade-in">
      <div className="mb-2 flex items-center justify-between">
        <span className={`inline-flex items-center rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${chipClass}`}>
          {chip}
        </span>
        <span className="font-mono text-[11px] tabular-nums text-slate-400">{pct}%</span>
      </div>
      {/* fluid, section-aware progress bar */}
      <div className="mb-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80 shadow-inner dark:bg-white/10">
        <div
          className="relative h-full rounded-full bg-gradient-to-r from-accent to-violet-500 transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        >
          <span className="absolute inset-0 rounded-full bg-white/25 [mask-image:linear-gradient(90deg,transparent,white,transparent)]" />
        </div>
      </div>
      <div className="mb-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-wide text-slate-400">
        <span>{section}</span>
        <span>{pct < 100 ? 'in progress' : 'complete'}</span>
      </div>
      <div className="rounded-[26px] bg-gradient-to-br from-accent/20 via-violet-400/12 to-transparent p-px shadow-card">
        <div className="rounded-[25px] bg-white dark:bg-noir-card p-6 sm:p-9">
          <div className="flex min-h-[360px] flex-col">{children}</div>
        </div>
      </div>
    </div>
  );
}
