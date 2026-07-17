import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

/** Public marketing landing — light premium style, modern touches. Nav · hero ·
 *  about/vision · founders · footer. (Tutorial/how-it-works section removed.) */
export function Landing(): JSX.Element {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-mesh text-slate-900">
      <Nav onContact={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} />
      <Hero onStart={() => nav('/signup')} onSignIn={() => nav('/signin')} />
      <About />
      <Founders />
      <Footer onSignIn={() => nav('/signin')} onAdmin={() => nav('/admin/signin')} onStart={() => nav('/signup')} />
    </div>
  );
}

// ── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ onContact }: { onContact: () => void }): JSX.Element {
  return (
    <header className="sticky top-0 z-40">
      <div className="glass mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3 sm:px-6">
        <span className="text-sm font-bold uppercase tracking-[0.3em] text-slate-900">Re<span className="text-accent">veal</span></span>
        <button
          onClick={onContact}
          className="press rounded-xl bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800"
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
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 animate-blob rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-40 h-80 w-80 animate-blob rounded-full bg-violet-400/20 blur-3xl [animation-delay:4s]" />
      <div className="relative mx-auto max-w-4xl text-center">
        <div className="animate-slide-up inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-accent backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Design diagnostic · for design students
        </div>
        <h1 className="animate-slide-up mt-6 font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl" style={{ animationDelay: '80ms' }}>
          See the designer your
          <br />
          <span className="text-gradient italic">work already shows.</span>
        </h1>
        <p className="animate-slide-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600" style={{ animationDelay: '160ms' }}>
          REVEAL reads how you design — from what you <em>do</em>, not just what you say — and returns a
          high-fidelity Design Signature: your strengths today, where you’re heading, and the steps that close the gap.
        </p>
        <div className="animate-slide-up mt-9 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '240ms' }}>
          <button onClick={onStart} className="press rounded-2xl bg-accent px-7 py-3.5 text-[15px] font-semibold text-white shadow-lift transition-transform hover:scale-[1.02]">
            Get started →
          </button>
          <button onClick={onSignIn} className="press rounded-2xl border border-slate-300 bg-white/70 px-7 py-3.5 text-[15px] font-semibold text-slate-700 backdrop-blur transition-colors hover:border-slate-400">
            Sign in
          </button>
        </div>

        {/* floating structural preview — subtle gradient ring (modern touch) */}
        <div className="animate-slide-up mt-16" style={{ animationDelay: '320ms' }}>
          <div className="mx-auto max-w-3xl rounded-[28px] bg-gradient-to-br from-accent/30 via-violet-400/20 to-transparent p-px shadow-lift">
            <div className="rounded-[27px] bg-white/70 p-3 backdrop-blur">
              <div className="rounded-2xl bg-white p-6 text-left sm:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-accent-soft px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-accent-dark">A · stated</span>
                  <span className="font-mono text-[11px] text-slate-400">42%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent to-violet-500" style={{ width: '42%' }} />
                </div>
                <div className="mt-5 font-serif text-2xl text-slate-900">Tick what’s true — be honest, not aspirational.</div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {['clear purpose', 'see who it helps', 'in the field', 'genuinely hard'].map((t, i) => (
                    <div key={t} className={`rounded-xl border px-3 py-2 text-xs font-medium ${i < 2 ? 'border-accent bg-accent-soft text-accent-dark' : 'border-slate-200 text-slate-500'}`}>{t}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* stat row */}
        <div className="animate-slide-up mt-12 grid grid-cols-3 gap-4" style={{ animationDelay: '400ms' }}>
          {[
            { k: '2 channels', s: 'what you say · what you do' },
            { k: '15 question sets', s: 'across Section A & B' },
            { k: 'Re-runnable', s: 'a snapshot, not a verdict' },
          ].map((m) => (
            <div key={m.k} className="rounded-2xl border border-slate-200 bg-white/60 p-4 backdrop-blur">
              <div className="font-serif text-xl text-slate-900 sm:text-2xl">{m.k}</div>
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
        <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-slate-900 sm:text-5xl">
          A mirror for the designer you’re becoming.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <InfoCard tone="light" eyebrow="Our mission" title="Recognition, not a test">
            Design students already carry thick, formed instincts — REVEAL exists to reflect them back. It watches the
            choices you make across a series of situations, then compares that with what you claim, so the picture is
            read from evidence rather than self-report. Nothing is graded; there’s no cohort to beat. Everything compares
            you to you.
          </InfoCard>
          <InfoCard tone="dark" eyebrow="Our vision" title="A loop you re-run for life">
            One reading captures where you are today. The real value is the trajectory: do the things your Signature
            suggests, come back in a few months, and watch the shape move. REVEAL is built to be re-run — a developmental
            loop that grows with you, surfacing gaps as learnable steps and strengths as directions to lean into.
          </InfoCard>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { i: '🧭', t: 'Two channels', d: 'Channel A reads what you state; Channel B reads what you reveal under gentle constraint. Surprises live in the gap between them.' },
            { i: '📐', t: 'Deterministic core', d: 'Findings are computed by a transparent engine — every number traces back to a choice you made. No black box.' },
            { i: '✦', t: 'Design Signature', d: 'A premium, visual report: capacities, values, roles, your reach & gap, and specific growth experiments.' },
          ].map((c) => (
            <div key={c.t} className="hover-lift rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-xl">{c.i}</div>
              <div className="text-[15px] font-semibold text-slate-900">{c.t}</div>
              <div className="mt-1.5 text-[13px] leading-relaxed text-slate-500">{c.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InfoCard({ tone, eyebrow, title, children }: { tone: 'light' | 'dark'; eyebrow: string; title: string; children: ReactNode }): JSX.Element {
  const dark = tone === 'dark';
  return (
    <div className={`hover-lift relative overflow-hidden rounded-3xl p-8 shadow-card ${dark ? 'bg-slate-900 text-slate-200' : 'border border-slate-200 bg-white'}`}>
      {dark ? <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" /> : null}
      <div className={`relative font-mono text-[11px] uppercase tracking-[0.2em] ${dark ? 'text-indigo-300' : 'text-accent'}`}>{eyebrow}</div>
      <h3 className={`relative mt-2 font-serif text-2xl ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
      <p className={`relative mt-3 text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{children}</p>
    </div>
  );
}

// ── Founders ─────────────────────────────────────────────────────────────────
function Founders(): JSX.Element {
  const people = [
    { name: 'Jhaanvi Hiremath', role: 'Founder', initials: 'JH' },
    { name: 'Prashant Anolkar', role: 'Founder', initials: 'PA' },
    { name: 'Reva', role: 'Founder', initials: 'R' },
  ];
  return (
    <section id="founders" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionLabel>The team</SectionLabel>
        <h2 className="mt-3 font-serif text-4xl leading-tight text-slate-900 sm:text-5xl">Built by designers, for designers.</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {people.map((p, i) => (
            <div key={p.name} className="hover-lift animate-slide-up rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-card" style={{ animationDelay: `${i * 90}ms` }}>
              <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-accent via-violet-400 to-fuchsia-400 p-[3px]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                  <span className="font-serif text-3xl text-accent-dark">{p.initials}</span>
                </div>
              </div>
              <div className="mt-5 text-lg font-semibold text-slate-900">{p.name}</div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-accent">{p.role}</div>
              <div className="mt-3 text-[12px] text-slate-400">Headshot coming soon</div>
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
    <footer id="contact" className="bg-slate-950 px-6 pb-10 pt-16 text-slate-300">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.3em] text-white">Re<span className="text-accent">veal</span></div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
              A hybrid design diagnostic that reads how you design and returns a high-fidelity Design Signature.
            </p>
            <button onClick={onStart} className="press mt-5 rounded-xl bg-accent px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-accent-dark">
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
    <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
      <span className="h-px w-6 bg-accent/50" />
      {children}
    </div>
  );
}
