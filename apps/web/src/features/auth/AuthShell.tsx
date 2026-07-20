import type { ReactNode } from 'react';
import { LogoLink } from '../../components/Logo.js';

/** Centered premium layout for auth screens: a quiet gradient, brand, and a card. */
export function AuthShell({ children, wide }: { children: ReactNode; wide?: boolean }): JSX.Element {
  return (
    <div className="relative min-h-screen overflow-hidden bg-mesh">
      <div className="pointer-events-none absolute -left-32 top-24 h-80 w-80 animate-blob rounded-full bg-accent/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-48 h-72 w-72 animate-blob rounded-full bg-violet-400/15 blur-3xl [animation-delay:4s]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6">
        <header className="flex items-center justify-between py-6">
          <LogoLink markClass="h-6 w-6" wordClass="text-[17px]" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Radikle</span>
        </header>
        <main className="flex flex-1 items-center justify-center py-6">
          <div className={`w-full animate-slide-up ${wide ? 'max-w-2xl' : 'max-w-md'}`}>{children}</div>
        </main>
      </div>
    </div>
  );
}
