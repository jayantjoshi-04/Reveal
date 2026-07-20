import { useState, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui.js';
import { LogoLink } from '../../components/Logo.js';
import { api } from '../../lib/api.js';
import { useAuth } from '../../store/auth.js';

/** The survey intro — "Before you begin". Sets expectations, then starts (or resumes) the run. */
export function Onboarding(): JSX.Element {
  const { role, name, setInstance } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);

  if (role !== 'student') return <Navigate to="/" replace />;

  async function begin(): Promise<void> {
    setBusy(true);
    try {
      const state = await api.startInstance();
      setInstance(state.instance_id);
      nav('/survey');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-mesh">
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-noir-2/70">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3.5">
          <LogoLink markClass="h-5 w-5" wordClass="text-[16px]" />
          <button className="text-[13px] font-medium text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200" onClick={() => nav('/dashboard')}>Back to dashboard</button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 pb-24">
        {/* hero */}
        <section className="animate-slide-up pt-14 text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">{name ? `${name}, ` : ''}before you begin</div>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-slate-900 dark:text-white sm:text-5xl">
            Read this once,<br />then <span className="text-gradient italic">meet it honestly.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
            REVEAL isn’t a test, and there’s nothing to pass. It reads the choices you make and shows you the designer
            already in your work — including things you may never have put into words. Two minutes here makes the next
            hour worth it.
          </p>
        </section>

        {/* the deal */}
        <Panel className="mt-12 bg-slate-900 text-slate-200">
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-accent/20 blur-3xl" />
          <Eyebrow dark>The one thing that matters</Eyebrow>
          <h2 className="relative mt-2 font-serif text-2xl text-white sm:text-3xl">Be honest — you’re the only one it costs.</h2>
          <p className="relative mt-3 text-sm leading-relaxed text-slate-300">
            REVEAL doesn’t just ask what you’re good at — it watches <b className="text-white">what you actually do</b> across
            a series of situations, then compares that with what you <b className="text-white">said</b>. Answer as the
            designer you think you should be and it shows up as a contradiction — a report about someone who doesn’t exist.
          </p>
          <p className="relative mt-4 border-l-2 border-accent pl-4 font-serif text-lg italic text-accent">
            The most valuable thing REVEAL can give you is a surprise — a real strength you’d never have claimed. Those only appear when you stop performing.
          </p>
        </Panel>

        {/* two modes */}
        <section className="mt-8">
          <Eyebrow>How to answer</Eyebrow>
          <h2 className="mt-2 font-serif text-2xl text-slate-900 dark:text-white sm:text-3xl">Two modes — and knowing which is which matters.</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <ModeCard icon="🕰" tone="amber" tag="Mode 1 · Slow down" title="Think hard. Seek the truth.">
              Some questions ask you to look back honestly, name what you actually value, or say where you want to go.
              Take your time — the easy answer is usually the borrowed one. Ask: <b>is that true, or does it just sound right?</b>
            </ModeCard>
            <ModeCard icon="⚡" tone="accent" tag="Mode 2 · Don’t overthink" title="Go with your gut.">
              Other questions drop you into a situation and ask what you’d do first. Answer with your first instinct and
              move on. The moment you reason about what a “good designer” would pick, you’ve started performing.
            </ModeCard>
          </div>
        </section>

        {/* what to expect */}
        <section className="mt-10">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-2 font-serif text-2xl text-slate-900 dark:text-white sm:text-3xl">What to expect.</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { k: 'Length', v: '3 sessions', s: '~15–20 min each. One sitting or across a few days.' },
              { k: 'Order', v: 'Fixed', s: 'Questions come in a set order, on purpose.' },
              { k: 'Going back', v: 'Sealed', s: 'Once a session is finished it locks — no revising.' },
            ].map((f) => (
              <div key={f.k} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-noir-card p-4 shadow-card">
                <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400">{f.k}</div>
                <div className="mt-1 font-serif text-xl text-slate-900 dark:text-white">{f.v}</div>
                <div className="mt-1 text-[12px] leading-snug text-slate-500 dark:text-slate-400">{f.s}</div>
              </div>
            ))}
          </div>
          <ul className="mt-4 space-y-px overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-noir-card">
            {[
              ['Do it alone, in one go.', 'Find a quiet half-hour where nobody’s reading over your shoulder.'],
              ['Have your work ready.', 'You’ll upload images and a résumé — the real ones, not polished-up versions.'],
              ['The “why?” boxes are for you.', 'A line or two is plenty; nothing there is scored — it comes back in your report.'],
              ['Leave contradictions alone.', 'Don’t tidy up. The honest inconsistencies are often the most interesting finding.'],
            ].map(([t, d], i) => (
              <li key={t} className={`flex gap-3 px-4 py-3 ${i > 0 ? 'border-t border-slate-100 dark:border-white/10' : ''}`}>
                <span className="mt-0.5 font-mono text-[11px] text-accent">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[13px] text-slate-600 dark:text-slate-300"><b className="text-slate-900 dark:text-white">{t}</b> {d}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* what it isn't */}
        <section className="mt-10">
          <Eyebrow>To be clear</Eyebrow>
          <h2 className="mt-2 font-serif text-2xl text-slate-900 dark:text-white sm:text-3xl">What this isn’t.</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {['Not graded', 'Not a personality type', 'Not a ranking', 'Not permanent', 'Not a verdict'].map((n) => (
              <span key={n} className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-noir-card px-4 py-1.5 text-[13px] text-slate-600 dark:text-slate-300">{n}</span>
            ))}
          </div>
        </section>

        {/* close */}
        <section className="mt-14 rounded-3xl bg-gradient-to-br from-white to-slate-50 p-10 text-center shadow-card ring-1 ring-slate-200 dark:from-noir-card dark:to-noir-2 dark:ring-white/10">
          <p className="mx-auto max-w-md font-serif text-2xl italic leading-snug text-slate-800 dark:text-slate-100">
            Answer as the designer you <span className="text-accent">are</span> — not the one you think you’re supposed to be.
          </p>
          <Button className="mx-auto mt-7 px-8 py-3.5 text-[15px]" loading={busy} onClick={begin}>
            I’m ready · Begin →
          </Button>
          <div className="mt-4 font-mono text-[11px] tracking-wide text-slate-400">Session 1 of 3 · about 15 minutes · you can stop between sessions</div>
        </section>
      </div>
    </div>
  );
}

function Panel({ className = '', children }: { className?: string; children: ReactNode }): JSX.Element {
  return <div className={`relative overflow-hidden rounded-3xl p-8 shadow-card ${className}`}>{children}</div>;
}
function Eyebrow({ children, dark }: { children: ReactNode; dark?: boolean }): JSX.Element {
  return <div className={`relative font-mono text-[10px] uppercase tracking-[0.2em] ${dark ? 'text-indigo-300' : 'text-accent'}`}>{children}</div>;
}
function ModeCard({ icon, tone, tag, title, children }: { icon: string; tone: 'amber' | 'accent'; tag: string; title: string; children: ReactNode }): JSX.Element {
  const tagCls = tone === 'amber' ? 'text-amber-600' : 'text-accent';
  return (
    <div className="hover-lift rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-noir-card p-5 shadow-card">
      <div className="mb-3 text-2xl">{icon}</div>
      <div className={`font-mono text-[9px] uppercase tracking-[0.1em] ${tagCls}`}>{tag}</div>
      <div className="mt-1 font-serif text-lg text-slate-900 dark:text-white">{title}</div>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">{children}</p>
    </div>
  );
}
