import type { ReactNode } from 'react';

export function Prompt({ children }: { children: ReactNode }): JSX.Element {
  return <div className="mb-3 font-serif text-xl leading-snug text-slate-900">{children}</div>;
}

export function Option({
  children,
  selected,
  onClick,
}: {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`press mb-2.5 flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-200 ${
        selected
          ? 'border-accent bg-accent-soft text-accent-dark shadow-sm'
          : 'border-slate-200 text-slate-700 hover:border-accent/50 hover:bg-slate-50'
      }`}
    >
      <span
        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
          selected ? 'border-accent bg-accent text-white' : 'border-slate-300'
        }`}
      >
        {selected ? <span className="text-[9px] leading-none">✓</span> : null}
      </span>
      {children}
    </button>
  );
}

export function PrimaryBtn({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="press mt-auto rounded-2xl bg-accent py-3 text-center text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-accent-dark disabled:opacity-40"
    >
      {children}
    </button>
  );
}
