import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo.js';
import { Grain } from '../../components/Grain.js';
import { useTheme } from '../../store/theme.js';
import { ClarityHero } from './ClarityStage.js';

/** Public marketing landing — cinematic, minimalist, theme-aware.
 *  Nav · hero · about · pricing · footer. */
export function Landing(): JSX.Element {
  const nav = useNavigate();
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  return (
    <div className="bg-mesh relative min-h-screen text-slate-900 dark:text-slate-100">
      {/* Full-page aurora BEHIND everything (incl. the nav) so the gradient
          reaches the very top. Clipped here — not on a sticky ancestor — so the
          navbar can stay sticky. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-2 h-80 w-80 animate-aurora rounded-full bg-accent/25 blur-[90px] dark:bg-accent/40" />
        <div className="absolute right-[-6rem] top-24 h-96 w-96 animate-aurora rounded-full bg-fuchsia-400/20 blur-[100px] [animation-delay:5s] dark:bg-fuchsia-500/25" />
        <div className="absolute left-1/3 top-[520px] h-72 w-72 animate-aurora rounded-full bg-signature/20 blur-[90px] [animation-delay:9s]" />
        <OrbitVector className="absolute left-1/2 top-[-14%] h-[1000px] w-[1000px] -translate-x-1/2 text-accent/10 dark:text-white/[0.06]" />
      </div>
      <Grain />
      <Nav onPricing={() => go('pricing')} onHelp={() => go('contact')} onSignIn={() => nav('/signin')} />
      <ClarityHero onStart={() => nav('/signup')} onSignIn={() => nav('/signin')} />
      <About />
      <Pricing onStart={() => nav('/signup')} />
      <Footer onSignIn={() => nav('/signin')} onAdmin={() => nav('/admin/signin')} onStart={() => nav('/signup')} />
    </div>
  );
}

// ── Scroll-reveal helper ─────────────────────────────────────────────────────
function Rise({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e!.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${shown ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-6 opacity-0 blur-[6px]'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ── Theme toggle ─────────────────────────────────────────────────────────────
function ThemeToggle(): JSX.Element {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="press grid h-9 w-9 place-items-center rounded-full border border-slate-200/80 bg-white/70 text-slate-600 transition-colors hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
    >
      {dark ? (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.2" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A8.5 8.5 0 1111.2 3a6.5 6.5 0 009.8 9.8z" />
        </svg>
      )}
    </button>
  );
}

// ── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ onPricing, onHelp, onSignIn }: { onPricing: () => void; onHelp: () => void; onSignIn: () => void }): JSX.Element {
  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/55 px-3.5 py-2.5 shadow-card backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045]">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="press">
          <Logo markClass="h-6 w-6" wordClass="text-[18px]" />
        </button>
        <nav className="hidden items-center gap-1 md:flex">
          <NavItem onClick={onPricing}>Explore pricing</NavItem>
          <NavItem onClick={onHelp}>Help &amp; Support</NavItem>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onSignIn}
            className="press rounded-xl bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Sign in
          </button>
        </div>
      </div>
    </header>
  );
}

function NavItem({ children, onClick }: { children: ReactNode; onClick: () => void }): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="press rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-900/[0.04] hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
    >
      {children}
    </button>
  );
}

// A faint concentric-orbit vector graphic (aperture rings) for depth.
function OrbitVector({ className = '' }: { className?: string }): JSX.Element {
  return (
    <svg viewBox="0 0 600 600" className={className} fill="none" aria-hidden="true">
      {[70, 130, 195, 265].map((r) => (
        <circle key={r} cx="300" cy="300" r={r} stroke="currentColor" strokeWidth="1" />
      ))}
      <circle cx="300" cy="300" r="265" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 12" className="origin-center animate-aperture-spin [animation-duration:60s]" />
      <circle cx="300" cy="35" r="4" fill="currentColor" />
      <circle cx="565" cy="300" r="3" fill="currentColor" />
    </svg>
  );
}

// ── About / Vision ───────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-accent dark:text-indigo-300">
      <span className="h-px w-8 bg-accent/50 dark:bg-indigo-300/40" />
      {children}
    </div>
  );
}

function About(): JSX.Element {
  const cards = [
    { t: 'What you say', d: 'Forced-choice scenarios surface your stated values, capacities, and the domains you gravitate toward.', k: 'Channel A' },
    { t: 'What you do', d: 'Constrained tasks — budget cuts, timed attention, visual sorts — read your behaviour, not your intentions.', k: 'Channel B' },
    { t: 'Your signature', d: 'A deterministic engine turns both into one high-fidelity picture — then it’s phrased into a report you can act on.', k: 'The output' },
  ];
  return (
    <section id="about" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Rise>
          <SectionLabel>The idea</SectionLabel>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-medium leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl" style={{ letterSpacing: '-0.02em' }}>
            Two channels, read together, reveal what a portfolio alone can’t.
          </h2>
        </Rise>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {cards.map((c, i) => (
            <Rise key={c.t} delay={i * 110}>
              <div className="group hover-lift relative h-full overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 p-7 backdrop-blur dark:border-white/10 dark:bg-white/[0.035]">
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent/10 blur-2xl transition-opacity group-hover:opacity-100 dark:bg-accent/20" />
                <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-signature">{c.k}</div>
                <div className="mt-4 font-display text-2xl font-medium text-slate-900 dark:text-white">{c.t}</div>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">{c.d}</p>
              </div>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ──────────────────────────────────────────────────────────────────
function Pricing({ onStart }: { onStart: () => void }): JSX.Element {
  const tiers = [
    { name: 'Explorer', price: 'Free', note: 'during the pilot', features: ['One full Design Signature', 'All 15 question sets', 'Re-run anytime'], cta: 'Get started', highlight: false },
    { name: 'Studio', price: 'Coming soon', note: 'for cohorts & studios', features: ['Everything in Explorer', 'Cohort dashboard', 'Facilitator review tools'], cta: 'Talk to us', highlight: true },
    { name: 'Campus', price: 'Custom', note: 'for institutions', features: ['Everything in Studio', 'Bulk onboarding', 'Priority support'], cta: 'Talk to us', highlight: false },
  ];
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Rise className="text-center">
          <SectionLabel>
            <span className="mx-auto flex items-center gap-3">Pricing</span>
          </SectionLabel>
          <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-slate-900 dark:text-white sm:text-5xl" style={{ letterSpacing: '-0.02em' }}>
            Simple and honest.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-300">Free while we pilot. You only ever pay for what genuinely helps you grow.</p>
        </Rise>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {tiers.map((t, i) => (
            <Rise key={t.name} delay={i * 110} className="h-full">
              <div className={`relative flex h-full flex-col rounded-3xl border p-7 ${t.highlight ? 'glow-ring border-transparent bg-white shadow-glow dark:bg-noir-card' : 'border-slate-200/70 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-white/[0.035]'}`}>
                {t.highlight ? <div className="mb-3 inline-flex w-fit rounded-full bg-accent-soft px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-accent-dark dark:bg-accent/15 dark:text-indigo-200">Most popular</div> : null}
                <div className="font-display text-2xl font-medium text-slate-900 dark:text-white">{t.name}</div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-medium text-slate-900 dark:text-white">{t.price}</span>
                  <span className="text-[13px] text-slate-500 dark:text-slate-400">{t.note}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3 text-[14px] text-slate-600 dark:text-slate-300">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-accent dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 10.5l3.2 3.2L15 6" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={onStart} className={`press mt-7 rounded-xl px-5 py-3 text-[14px] font-semibold transition-colors ${t.highlight ? 'bg-accent text-white hover:bg-accent-dark' : 'border border-slate-300 text-slate-700 hover:border-slate-400 dark:border-white/15 dark:text-slate-200 dark:hover:border-white/30'}`}>
                  {t.cta}
                </button>
              </div>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer({ onSignIn, onAdmin, onStart }: { onSignIn: () => void; onAdmin: () => void; onStart: () => void }): JSX.Element {
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-slate-200 bg-slate-50 px-6 pb-10 pt-20 text-slate-600 dark:border-transparent dark:bg-noir dark:text-slate-300">
      <OrbitVector className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] text-slate-900/[0.04] dark:text-white/[0.05]" />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo markClass="h-7 w-7" wordClass="text-[20px]" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              A hybrid design diagnostic that reads how you design and returns a high-fidelity Design Signature.
            </p>
            <button onClick={onStart} className="press mt-6 rounded-xl bg-accent px-5 py-2.5 text-[13px] font-semibold text-white shadow-glow transition-colors hover:bg-accent-dark">
              Get started →
            </button>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Help &amp; Support</div>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><a className="transition-colors hover:text-slate-900 dark:hover:text-white" href="mailto:service@radikle.org">service@radikle.org</a></li>
              <li>Radikle</li>
              <li>Mumbai, India</li>
            </ul>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Elsewhere</div>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><a className="transition-colors hover:text-slate-900 dark:hover:text-white" href="#" aria-label="Instagram">Instagram</a></li>
              <li><a className="transition-colors hover:text-slate-900 dark:hover:text-white" href="#" aria-label="LinkedIn">LinkedIn</a></li>
              <li><a className="transition-colors hover:text-slate-900 dark:hover:text-white" href="#" aria-label="X / Twitter">X (Twitter)</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-[12px] text-slate-500 dark:border-white/10 sm:flex-row">
          <div>© {new Date().getFullYear()} REVEAL · Radikle. All rights reserved.</div>
          <div className="flex items-center gap-5">
            <a className="transition-colors hover:text-slate-900 dark:hover:text-slate-300" href="#">Terms &amp; Conditions</a>
            <a className="transition-colors hover:text-slate-900 dark:hover:text-slate-300" href="#">Privacy</a>
            <button className="transition-colors hover:text-slate-900 dark:hover:text-slate-300" onClick={onSignIn}>Sign in</button>
            <button className="transition-colors hover:text-slate-900 dark:hover:text-slate-300" onClick={onAdmin}>Admin</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
