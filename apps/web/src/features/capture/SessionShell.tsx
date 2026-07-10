import type { ReactNode } from 'react';

/** Premium centered card for a survey step: progress, a subtle channel chip,
 *  and the question content. Replaces the old phone-frame mockup. */
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
      ? 'bg-slate-100 text-slate-600'
      : chipTone === 'b'
        ? 'bg-accent-soft text-accent-dark'
        : chipTone === 'sealed'
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-slate-100 text-slate-500';

  return (
    <div className="w-full max-w-xl animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <span className={`inline-flex items-center rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${chipClass}`}>
          {chip}
        </span>
        <span className="font-mono text-[11px] text-slate-400">{Math.round(progress * 100)}%</span>
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-accent transition-all duration-500 ease-out" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-9">
        <div className="flex min-h-[360px] flex-col">{children}</div>
      </div>
    </div>
  );
}
