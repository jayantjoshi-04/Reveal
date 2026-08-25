/** Shared survey chrome + the archetype prop contract. */
import type { ReactNode } from 'react';
import type { SurveyActivity } from '../../lib/api.js';

export interface Signal {
  constructId: string;
  channel: 'say' | 'do';
  value: number;
  edge?: string;
  position?: number;
  driver?: string;
  valence?: 'approach' | 'avoidance';
}
export type RawPayload = { selected_option_ids?: string[]; signals?: Signal[] };

export interface ArchetypeProps {
  activity: SurveyActivity;
  initial?: RawPayload;
  busy: boolean;
  onSubmit: (payload: RawPayload) => void;
}

export function sig(constructId: string, channel: 'say' | 'do', value: number, extra: Partial<Signal> = {}): Signal {
  return { constructId, channel, value: Math.round(value), ...extra };
}

/** A tappable chip used across most screens. */
export function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`press rounded-xl border px-3.5 py-2.5 text-left text-[13.5px] leading-snug transition-colors ${
        on
          ? 'border-accent bg-accent text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-white/25'
      }`}
    >
      {children}
    </button>
  );
}

export function Prompt({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }): JSX.Element {
  return (
    <div className="mb-4">
      {eyebrow ? <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-accent">{eyebrow}</div> : null}
      <h2 className="font-serif text-[22px] leading-snug text-slate-900 dark:text-white">{title}</h2>
      {sub ? <p className="mt-1.5 text-[13.5px] text-slate-500 dark:text-slate-400">{sub}</p> : null}
    </div>
  );
}

export function NextButton({ busy, disabled, onClick, label = 'Continue' }: { busy: boolean; disabled?: boolean; onClick: () => void; label?: string }): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={busy || disabled}
      className="press mt-6 w-full rounded-2xl bg-accent py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark disabled:opacity-40"
    >
      {busy ? 'Saving…' : label}
    </button>
  );
}

/** The outer survey frame: block header + progress + a card for the activity. */
export function SurveyFrame({ blockTitle, step, total, children }: { blockTitle: string; step: number; total: number; children: ReactNode }): JSX.Element {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-slate-400">{blockTitle}</span>
        <span className="font-mono text-[10.5px] text-slate-400">{step} / {total}</span>
      </div>
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card dark:border-white/10 dark:bg-noir-card sm:p-8">{children}</div>
    </div>
  );
}
