import type { ReactNode } from 'react';

export function Prompt({ children }: { children: ReactNode }): JSX.Element {
  return <div className="mb-2 text-[15px] font-semibold leading-tight text-ink">{children}</div>;
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
      className={`mb-1.5 flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition ${
        selected ? 'border-orange bg-orange-bg text-orange' : 'border-rule text-[#3a3a36] hover:border-orange'
      }`}
    >
      <span
        className={`h-3 w-3 flex-shrink-0 rounded-full border ${selected ? 'border-orange bg-orange' : 'border-dim'}`}
      />
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
      className="mt-auto rounded-lg bg-orange py-2.5 text-center text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
    >
      {children}
    </button>
  );
}
