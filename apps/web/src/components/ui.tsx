/** Premium UI primitives for the auth/admin surfaces: Button, Input, Field,
 *  Select, Card, Skeleton, Spinner, Segmented, UploadField, SavingOverlay.
 *  Minimalist, with subtle micro-interactions. */
import { useRef, useState } from 'react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'subtle' | 'danger';

export function Button({
  variant = 'primary',
  loading,
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }): JSX.Element {
  const base =
    'press inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40';
  const styles: Record<Variant, string> = {
    primary: 'bg-accent text-white hover:bg-accent-dark shadow-sm',
    ghost: 'border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50',
    subtle: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200',
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} disabled={loading || rest.disabled} {...rest}>
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function Spinner({ className = '' }: { className?: string }): JSX.Element {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden
    />
  );
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }): JSX.Element {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-slate-700">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15';

export function Input(props: InputHTMLAttributes<HTMLInputElement>): JSX.Element {
  return <input {...props} className={`${inputCls} ${props.className ?? ''}`} />;
}

export function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>): JSX.Element {
  return (
    <select {...props} className={`${inputCls} ${props.className ?? ''}`}>
      {children}
    </select>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }): JSX.Element {
  return <div className={`rounded-2xl border border-slate-200 bg-white shadow-card ${className}`}>{children}</div>;
}

export function Skeleton({ className = '' }: { className?: string }): JSX.Element {
  return <div className={`skeleton ${className}`} />;
}

export function Badge({ tone = 'slate', children }: { tone?: 'slate' | 'amber' | 'green' | 'accent' | 'rose'; children: ReactNode }): JSX.Element {
  const tones = {
    slate: 'bg-slate-100 text-slate-600',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-emerald-50 text-emerald-700',
    accent: 'bg-accent-soft text-accent-dark',
    rose: 'bg-rose-50 text-rose-600',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}

/** A segmented control (button group) — a clean tap-to-pick alternative to a slider. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}): JSX.Element {
  return (
    <div className={`inline-flex w-full rounded-xl border border-slate-200 bg-slate-100 p-1 ${className}`} role="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className={`press flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              on ? 'bg-white text-accent-dark shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export interface UploadedFile {
  name: string;
}

/** A file field that blocks progress until a file is chosen and "uploaded".
 *  No storage backend is wired for the pilot, so we simulate the upload
 *  completing — enough to drive the visual states and the gating logic. */
export function UploadField({
  label,
  hint = 'Tap to choose a file',
  accept,
  compact,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  accept?: string;
  compact?: boolean;
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
}): JSX.Element {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const done = !!value && !uploading;

  function pick(file: File | undefined): void {
    if (!file) return;
    setUploading(true);
    onChange(null); // clear until the "upload" resolves, so gates re-lock mid-swap
    window.setTimeout(() => {
      setUploading(false);
      onChange({ name: file.name });
    }, 850);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`press flex w-full items-center gap-3 rounded-2xl border-2 border-dashed px-4 text-left transition-colors ${
          compact ? 'py-3' : 'py-6'
        } ${done ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:border-accent/50'}`}
      >
        <span
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-lg ${
            done ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 shadow-sm'
          }`}
        >
          {done ? '✓' : uploading ? <Spinner className="text-accent" /> : '⬆'}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-sm font-medium ${done ? 'text-emerald-700' : 'text-slate-700'}`}>
            {value ? value.name : label}
          </span>
          <span className={`block text-xs ${done ? 'text-emerald-600' : 'text-slate-400'}`}>
            {uploading ? 'Uploading…' : done ? 'Upload complete' : hint}
          </span>
        </span>
        {done ? <Badge tone="green">Complete</Badge> : null}
      </button>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}

/** A dark card with a glowing gradient border + soft colored outer glow.
 *  The signature surface of the noir theme. `from`/`to` are the gradient hues;
 *  the outer glow intensifies on hover. */
export function GlowCard({
  from = '#6366f1',
  to = '#a855f7',
  className = '',
  innerClassName = '',
  glow = 0.55,
  children,
}: {
  from?: string;
  to?: string;
  className?: string;
  innerClassName?: string;
  glow?: number;
  children: ReactNode;
}): JSX.Element {
  const grad = `linear-gradient(135deg, ${from}, ${to})`;
  return (
    <div className={`group relative rounded-[26px] ${className}`}>
      {/* soft outer glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-[32px] blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: grad, opacity: glow * 0.6 }}
      />
      {/* gradient border ring */}
      <div className="relative rounded-[26px] p-px" style={{ background: grad }}>
        <div className={`h-full rounded-[25px] bg-[#0b0b0f] ${innerClassName}`}>{children}</div>
      </div>
    </div>
  );
}

/** A light card wrapped in a subtle gradient ring — the modern-light accent
 *  used across auth, the survey shell and the report hero. */
export function RingCard({ className = '', innerClassName = '', children }: { className?: string; innerClassName?: string; children: ReactNode }): JSX.Element {
  return (
    <div className={`rounded-[26px] bg-gradient-to-br from-accent/25 via-violet-400/15 to-transparent p-px shadow-card ${className}`}>
      <div className={`h-full rounded-[25px] bg-white ${innerClassName}`}>{children}</div>
    </div>
  );
}

/** Full-screen saving overlay. Blocks interaction (so double-clicks and
 *  accidental navigation can't fire) while a background save is in flight. */
export function SavingOverlay({ show, label = 'Saving your progress…' }: { show: boolean; label?: string }): JSX.Element | null {
  if (!show) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-slate-900/20 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-lift">
        <Spinner className="text-accent" />
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
    </div>
  );
}
