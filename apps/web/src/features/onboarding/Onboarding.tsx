import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui.js';
import { api } from '../../lib/api.js';
import { useAuth } from '../../store/auth.js';

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

  const points = [
    { n: '01', t: 'Three short sittings', d: 'Interleaved reflections and quick tasks — about 15 minutes each.' },
    { n: '02', t: 'Read from behaviour', d: 'We learn from what you do under gentle constraint, not just what you claim.' },
    { n: '03', t: 'A Design Signature', d: 'A high-fidelity report of your strengths, gaps, and a growth path.' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 text-white">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="animate-slide-up">
          <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
            {name ? `${name}, ` : ''}you’re in
          </div>
          <h1 className="font-serif text-4xl leading-tight md:text-6xl">
            Unlock your potential.<br /><span className="italic text-accent">Let’s get started.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-slate-300">
            You’re about to discover the designer your work already shows — and the one you’re becoming. Answer honestly;
            there are no wrong answers, only yours.
          </p>
        </div>

        <div className="mt-12 grid w-full gap-4 sm:grid-cols-3">
          {points.map((p, i) => (
            <div key={p.n} className="animate-slide-up rounded-2xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur" style={{ animationDelay: `${120 + i * 90}ms` }}>
              <div className="font-mono text-xs text-accent">{p.n}</div>
              <div className="mt-2 text-[15px] font-semibold">{p.t}</div>
              <div className="mt-1 text-[13px] leading-snug text-slate-400">{p.d}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 animate-slide-up" style={{ animationDelay: '420ms' }}>
          <Button className="px-8 py-3 text-[15px]" loading={busy} onClick={begin}>
            Begin the assessment →
          </Button>
        </div>
      </div>
    </div>
  );
}
