import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlowCard } from '../../components/ui.js';

/** Public marketing landing — noir theme with glowing gradient-border cards. */
const HUES = {
  warm: { from: '#fb7185', to: '#f59e0b' },
  cool: { from: '#38bdf8', to: '#6366f1' },
  violet: { from: '#c084fc', to: '#ec4899' },
  brand: { from: '#6366f1', to: '#a855f7' },
} as const;

export function Landing(): JSX.Element {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-noir text-white">
      <Nav onContact={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} />
      <Hero onStart={() => nav('/signup')} onSignIn={() => nav('/signin')} />
      <About />
      <Workflow />
      <Founders />
      <Footer onSignIn={() => nav('/signin')} onAdmin={() => nav('/admin/signin')} onStart={() => nav('/signup')} />
    </div>
  );
}

// ── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ onContact }: { onContact: () => void }): JSX.Element {
  return (
    <header className="sticky top-0 z-40 px-4 pt-3">
      <div className="glass-noir mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3 sm:px-6">
        <span className="text-sm font-bold uppercase tracking-[0.3em]">Re<span className="text-gradient-bright">veal</span></span>
        <button
          onClick={onContact}
          className="press rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-white/10"
        >
          Contact
        </button>
      </div>
    </header>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onStart, onSignIn }: { onStart: () => void; onSignIn: () => void }): JSX.Element {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-16 sm:pt-24">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 animate-blob rounded-full bg-indigo-600/25 blur-[100px]" />
      <div className="pointer-events-none absolute -right-16 top-40 h-80 w-80 animate-blob rounded-full bg-fuchsia-600/20 blur-[100px] [animation-delay:4s]" />
      <div className="relative mx-auto max-w-4xl text-center">
        <div className="animate-slide-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-indigo-300 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Design diagnostic · for design students
        </div>
        <h1 className="animate-slide-up mt-6 font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl" style={{ animationDelay: '80ms' }}>
          See the designer your
          <br />
          <span className="text-gradient-bright italic">work already shows.</span>
        </h1>
        <p className="animate-slide-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400" style={{ animationDelay: '160ms' }}>
          REVEAL reads how you design — from what you <em>do</em>, not just what you say — and returns a
          high-fidelity Design Signature: your strengths today, where you’re heading, and the steps that close the gap.
        </p>
        <div className="animate-slide-up mt-9 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '240ms' }}>
          <button onClick={onStart} className="press rounded-2xl bg-white px-7 py-3.5 text-[15px] font-semibold text-slate-900 shadow-[0_0_40px_-8px_rgba(129,140,248,0.8)] transition-transform hover:scale-[1.02]">
            Get started →
          </button>
          <button onClick={onSignIn} className="press rounded-2xl border border-white/15 bg-white/5 px-7 py-3.5 text-[15px] font-semibold text-white backdrop-blur transition-colors hover:bg-white/10">
            Sign in
          </button>
        </div>

        {/* floating structural preview */}
        <div className="animate-slide-up mt-16" style={{ animationDelay: '320ms' }}>
          <GlowCard {...HUES.brand} glow={0.7} className="mx-auto max-w-2xl" innerClassName="p-6 text-left sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-indigo-300">A · stated</span>
              <span className="font-mono text-[11px] text-slate-500">42%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-500" style={{ width: '42%' }} />
            </div>
            <div className="mt-5 font-serif text-2xl text-white">Tick what’s true — be honest, not aspirational.</div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {['clear purpose', 'see who it helps', 'in the field', 'genuinely hard'].map((t, i) => (
                <div key={t} className={`rounded-xl border px-3 py-2 text-xs font-medium ${i < 2 ? 'border-indigo-400/50 bg-indigo-500/15 text-indigo-200' : 'border-white/10 text-slate-500'}`}>{t}</div>
              ))}
            </div>
          </GlowCard>
        </div>

        {/* stat row */}
        <div className="animate-slide-up mt-12 grid grid-cols-3 gap-4" style={{ animationDelay: '400ms' }}>
          {[
            { k: '2 channels', s: 'what you say · what you do' },
            { k: '15 question sets', s: 'across Section A & B' },
            { k: 'Re-runnable', s: 'a snapshot, not a verdict' },
          ].map((m) => (
            <div key={m.k} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
              <div className="font-serif text-xl text-white sm:text-2xl">{m.k}</div>
              <div className="mt-1 text-[12px] text-slate-500">{m.s}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── About & Vision ───────────────────────────────────────────────────────────
function About(): JSX.Element {
  return (
    <section id="about" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionLabel>About REVEAL</SectionLabel>
        <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">A mirror for the designer you’re becoming.</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <GlowCard {...HUES.warm} innerClassName="p-8">
            <Eyebrow className="text-rose-300">Our mission</Eyebrow>
            <h3 className="mt-2 font-serif text-2xl text-white">Recognition, not a test</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Design students already carry thick, formed instincts — REVEAL exists to reflect them back. It watches the
              choices you make across a series of situations, then compares that with what you claim, so the picture is
              read from evidence rather than self-report. Nothing is graded; there’s no cohort to beat.
            </p>
          </GlowCard>
          <GlowCard {...HUES.cool} innerClassName="p-8">
            <Eyebrow className="text-sky-300">Our vision</Eyebrow>
            <h3 className="mt-2 font-serif text-2xl text-white">A loop you re-run for life</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              One reading captures where you are today. The real value is the trajectory: do the things your Signature
              suggests, come back in a few months, and watch the shape move. REVEAL is built to be re-run — a
              developmental loop that grows with you.
            </p>
          </GlowCard>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { i: '🧭', t: 'Two channels', d: 'Channel A reads what you state; Channel B reads what you reveal under gentle constraint. Surprises live in the gap.' },
            { i: '📐', t: 'Deterministic core', d: 'Findings are computed by a transparent engine — every number traces back to a choice you made. No black box.' },
            { i: '✦', t: 'Design Signature', d: 'A premium, visual report: capacities, values, roles, your reach & gap, and specific growth experiments.' },
          ].map((c) => (
            <div key={c.t} className="glass-noir rounded-2xl p-5 transition-colors hover:border-white/20">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl">{c.i}</div>
              <div className="text-[15px] font-semibold text-white">{c.t}</div>
              <div className="mt-1.5 text-[13px] leading-relaxed text-slate-400">{c.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Workflow / tutorial ──────────────────────────────────────────────────────
function Workflow(): JSX.Element {
  const steps = [
    { n: '01', t: 'Read the intro, once', d: 'A short primer on how to answer — when to slow down, when to trust your gut.', snap: <SnapIntro />, hue: HUES.brand },
    { n: '02', t: 'Section A · stated', d: 'Forced-choice reflections on capacities, values, conditions and aspiration.', snap: <SnapChoice />, hue: HUES.cool },
    { n: '03', t: 'Section B · revealed', d: 'Quick behavioural tasks — budgets, dilemmas, a 40-artifact wish-sort.', snap: <SnapSort />, hue: HUES.violet },
    { n: '04', t: 'Your Design Signature', d: 'A visual report you can revisit, search in your history, and re-run.', snap: <SnapReport />, hue: HUES.warm },
  ];
  return (
    <section id="how" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionLabel>How it works</SectionLabel>
        <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">Four steps, about 20 minutes each.</h2>
        <p className="mt-3 max-w-2xl text-slate-400">Do them in one sitting or across a few days. Each session seals when you finish it — that’s part of how the reading stays honest.</p>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.n} className="animate-slide-up" style={{ animationDelay: `${i * 90}ms` }}>
              <GlowCard {...s.hue} glow={0.4} innerClassName="p-4">
                <div className="mb-4 aspect-[4/3] overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-3">{s.snap}</div>
                <div className="font-mono text-xs text-indigo-300">{s.n}</div>
                <div className="mt-1 text-[15px] font-semibold text-white">{s.t}</div>
                <div className="mt-1 text-[13px] leading-relaxed text-slate-400">{s.d}</div>
              </GlowCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// structural survey snapshots (dark)
function SnapFrame({ children }: { children: ReactNode }): JSX.Element {
  return <div className="flex h-full flex-col rounded-xl bg-[#141418] p-3 text-white ring-1 ring-white/5">{children}</div>;
}
function SnapIntro(): JSX.Element {
  return (
    <SnapFrame>
      <div className="font-serif text-[13px] leading-tight">Before you start, read this once.</div>
      <div className="mt-2 space-y-1.5">
        <div className="h-1.5 w-full rounded bg-white/10" />
        <div className="h-1.5 w-4/5 rounded bg-white/10" />
        <div className="h-1.5 w-3/5 rounded bg-white/10" />
      </div>
      <div className="mt-auto grid grid-cols-2 gap-1.5 pt-2">
        <div className="rounded-md bg-amber-500/15 px-2 py-1 text-[8px] font-medium text-amber-300">🕰 Slow down</div>
        <div className="rounded-md bg-indigo-500/15 px-2 py-1 text-[8px] font-medium text-indigo-300">⚡ Go with gut</div>
      </div>
    </SnapFrame>
  );
}
function SnapChoice(): JSX.Element {
  return (
    <SnapFrame>
      <div className="font-serif text-[13px] leading-tight">What do you notice first?</div>
      <div className="mt-2 space-y-1.5">
        {['talk to the people', 'work out the logic', 'picture how it looks'].map((t, i) => (
          <div key={t} className={`rounded-md border px-2 py-1 text-[8.5px] ${i === 0 ? 'border-sky-400/50 bg-sky-500/15 text-sky-200' : 'border-white/10 text-slate-500'}`}>{t}</div>
        ))}
      </div>
    </SnapFrame>
  );
}
function SnapSort(): JSX.Element {
  return (
    <SnapFrame>
      <div className="font-serif text-[13px] leading-tight">Pick the 8 you wish you’d made.</div>
      <div className="mt-2 grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className={`aspect-square rounded ${[1, 2, 5, 6].includes(i) ? 'bg-gradient-to-br from-fuchsia-500 to-violet-500' : 'bg-white/10'}`} />
        ))}
      </div>
    </SnapFrame>
  );
}
function SnapReport(): JSX.Element {
  return (
    <SnapFrame>
      <div className="font-serif text-[13px] leading-tight">Your Design Signature</div>
      <div className="mt-2 flex gap-1.5">
        {['#818cf8', '#c084fc', '#2dd4bf'].map((c) => (
          <div key={c} className="h-8 w-8 rounded-full border-2" style={{ borderColor: c }} />
        ))}
      </div>
      <div className="mt-auto space-y-1 pt-2">
        <div className="h-1.5 w-full rounded bg-white/10" />
        <div className="h-1.5 w-2/3 rounded bg-amber-400/40" />
      </div>
    </SnapFrame>
  );
}

// ── Founders ─────────────────────────────────────────────────────────────────
function Founders(): JSX.Element {
  const people = [
    { name: 'Jhaanvi Hiremath', role: 'Founder', initials: 'JH', hue: HUES.warm },
    { name: 'Prashant Anolkar', role: 'Founder', initials: 'PA', hue: HUES.cool },
    { name: 'Reva', role: 'Founder', initials: 'R', hue: HUES.violet },
  ];
  return (
    <section id="founders" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionLabel>The team</SectionLabel>
        <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Built by designers, for designers.</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {people.map((p, i) => (
            <div key={p.name} className="animate-slide-up" style={{ animationDelay: `${i * 90}ms` }}>
              <GlowCard {...p.hue} glow={0.45} innerClassName="p-6 text-center">
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]" style={{ boxShadow: `0 0 40px -10px ${p.hue.from}` }}>
                  <span className="font-serif text-3xl text-white">{p.initials}</span>
                </div>
                <div className="mt-5 text-lg font-semibold text-white">{p.name}</div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-indigo-300">{p.role}</div>
                <div className="mt-3 text-[12px] text-slate-500">Headshot coming soon</div>
              </GlowCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer({ onSignIn, onAdmin, onStart }: { onSignIn: () => void; onAdmin: () => void; onStart: () => void }): JSX.Element {
  return (
    <footer id="contact" className="border-t border-white/10 px-6 pb-10 pt-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.3em] text-white">Re<span className="text-indigo-400">veal</span></div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
              A hybrid design diagnostic that reads how you design and returns a high-fidelity Design Signature.
            </p>
            <button onClick={onStart} className="press mt-5 rounded-xl bg-white px-5 py-2.5 text-[13px] font-semibold text-slate-900 transition-transform hover:scale-[1.02]">
              Get started →
            </button>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">Contact</div>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li><a className="transition-colors hover:text-white" href="mailto:hello@reveal.design">hello@reveal.design</a></li>
              <li>dventurelabs · Ingenium</li>
              <li>Bengaluru, India</li>
            </ul>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">Elsewhere</div>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li><a className="transition-colors hover:text-white" href="#" aria-label="Instagram">Instagram</a></li>
              <li><a className="transition-colors hover:text-white" href="#" aria-label="LinkedIn">LinkedIn</a></li>
              <li><a className="transition-colors hover:text-white" href="#" aria-label="X / Twitter">X (Twitter)</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-[12px] text-slate-500 sm:flex-row">
          <div>© {new Date().getFullYear()} REVEAL · dventurelabs. All rights reserved.</div>
          <div className="flex items-center gap-5">
            <a className="transition-colors hover:text-slate-300" href="#">Terms &amp; Conditions</a>
            <a className="transition-colors hover:text-slate-300" href="#">Privacy</a>
            <button className="transition-colors hover:text-slate-300" onClick={onSignIn}>Sign in</button>
            <button className="transition-colors hover:text-slate-300" onClick={onAdmin}>Admin</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── shared ───────────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-indigo-300">
      <span className="h-px w-6 bg-indigo-400/50" />
      {children}
    </div>
  );
}
function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }): JSX.Element {
  return <div className={`font-mono text-[11px] uppercase tracking-[0.2em] ${className}`}>{children}</div>;
}
