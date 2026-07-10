import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/** Centered premium layout for auth screens: a quiet gradient, brand, and a card. */
export function AuthShell({ children, wide }: { children: ReactNode; wide?: boolean }): JSX.Element {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-accent-soft/60 to-transparent" />
      <div className="pointer-events-none absolute -left-32 top-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6">
        <header className="flex items-center justify-between py-6">
          <Link to="/" className="text-[13px] font-bold uppercase tracking-[0.28em] text-slate-900">
            Re<span className="text-accent">veal</span>
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Ingenium · dventurelabs</span>
        </header>
        <main className="flex flex-1 items-center justify-center py-6">
          <div className={`w-full animate-slide-up ${wide ? 'max-w-2xl' : 'max-w-md'}`}>{children}</div>
        </main>
      </div>
    </div>
  );
}
