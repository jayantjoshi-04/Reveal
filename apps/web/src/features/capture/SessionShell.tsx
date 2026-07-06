import type { ReactNode } from 'react';

/** The phone-frame chrome from the AppFlow mockup: status bar, progress, chip. */
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
      ? 'bg-blue-bg text-blue'
      : chipTone === 'b'
        ? 'bg-orange-bg text-orange'
        : chipTone === 'sealed'
          ? 'bg-[#eee] text-mid'
          : 'bg-[#efece6] text-mid';

  return (
    <div className="flex min-h-[560px] w-full max-w-[360px] flex-col overflow-hidden rounded-[20px] border border-rule bg-white shadow-sm">
      <div className="flex h-7 items-center justify-between border-b border-[#E6E3DD] bg-cream px-4 font-mono text-[9px] text-dim">
        <span className="font-sans text-[9px] font-bold tracking-[2px] text-ink">REVEAL</span>
        <span>9:41</span>
      </div>
      <div className="h-[3px] bg-[#E6E3DD]">
        <div className="h-full bg-orange transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className={`chip mb-3 self-start ${chipClass}`}>{chip}</span>
        {children}
      </div>
    </div>
  );
}
