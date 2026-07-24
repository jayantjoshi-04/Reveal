import { useEffect, useRef, useState } from 'react';
import { LogoMark } from '../../components/Logo.js';
import { useTheme } from '../../store/theme.js';

/** The full-bleed hero — a live "confusion → clarity" scene, theme-aware.
 *
 *  Tangled brand-colour threads weave in from the left (the noise of everything
 *  you do) and converge into a frosted glass capsule — the REVEAL lens — which
 *  fires a clean beam of clarity to the right. The capsule types the questions a
 *  designer can't answer about themselves; the beam is the answer.
 *
 *  Light mode renders on the lavender canvas with dark type and an indigo beam;
 *  dark mode is the deep-noir cinematic version. Interactive: the whole field
 *  parallaxes with the pointer, hovering intensifies the beam, and it honours
 *  prefers-reduced-motion. */
export function ClarityHero({ onStart, onSignIn }: { onStart: () => void; onSignIn: () => void }): JSX.Element {
  const ref = useRef<HTMLElement>(null);
  const dark = useTheme((s) => s.theme) === 'dark';

  function onMove(e: React.PointerEvent): void {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', String((e.clientX - r.left) / r.width - 0.5));
    el.style.setProperty('--my', String((e.clientY - r.top) / r.height - 0.5));
  }
  function onLeave(): void {
    ref.current?.style.setProperty('--mx', '0');
    ref.current?.style.setProperty('--my', '0');
  }

  const phrase = useTypewriter([
    'what am I actually good at?',
    'my work feels scattered…',
    'strength, or just a habit?',
    'who am I as a designer?',
    'what do my choices say?',
  ]);

  const beam = dark
    ? 'linear-gradient(90deg,#fff 0%,rgba(255,255,255,0.7) 22%,rgba(168,120,248,0.35) 55%,transparent 100%)'
    : 'linear-gradient(90deg,#4f46e5 0%,rgba(79,70,229,0.5) 24%,rgba(124,58,237,0.25) 55%,transparent 100%)';

  return (
    <section
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="group relative min-h-[100svh] overflow-hidden bg-[#f3f2fb] text-slate-900 dark:bg-[#060608] dark:text-white"
      style={{ '--mx': 0, '--my': 0 } as React.CSSProperties}
    >
      {/* ── ambient wash + grain ───────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_110%_at_12%_50%,rgba(124,58,237,0.14),transparent_60%)] dark:bg-[radial-gradient(80%_110%_at_12%_50%,rgba(124,58,237,0.18),transparent_60%)]" />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-soft-light dark:opacity-[0.11]" />

      {/* ── the tangled → resolved threads ─────────────────────────────── */}
      <svg viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="ch-violet" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7c3aed" stopOpacity="0" /><stop offset="0.4" stopColor="#7c3aed" /><stop offset="1" stopColor="#a878f8" />
          </linearGradient>
          <linearGradient id="ch-pool" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2192d9" stopOpacity="0" /><stop offset="0.45" stopColor="#2192d9" /><stop offset="1" stopColor="#46c2d6" />
          </linearGradient>
          <linearGradient id="ch-lime" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#c2d039" stopOpacity="0" /><stop offset="0.5" stopColor="#bee65f" /><stop offset="1" stopColor="#bee65f" />
          </linearGradient>
          <linearGradient id="ch-warm" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#d6418f" stopOpacity="0" /><stop offset="0.5" stopColor="#d6418f" /><stop offset="1" stopColor="#ec6540" />
          </linearGradient>
          <linearGradient id="ch-iris" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#a878f8" stopOpacity="0" /><stop offset="0.5" stopColor="#a878f8" /><stop offset="1" stopColor="#2192d9" />
          </linearGradient>
          <filter id="ch-soft" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="11" /></filter>
        </defs>
        <g
          filter="url(#ch-soft)"
          style={{ transform: 'translate3d(calc(var(--mx) * 30px), calc(var(--my) * 20px), 0)', transition: 'transform .5s cubic-bezier(.16,1,.3,1)' }}
        >
          {THREADS.map((t, i) => (
            <path
              key={i}
              d={t.d}
              stroke={`url(#${t.grad})`}
              strokeWidth={t.w}
              strokeLinecap="round"
              fill="none"
              className="thread-float"
              style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: `thread-float ${t.dur}s ease-in-out ${t.delay}s infinite`, opacity: dark ? 0.9 : 0.85 }}
            />
          ))}
        </g>
      </svg>

      {/* ── beam of clarity + convergence glow + end node ──────────────── */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[3px] w-[44%] origin-left"
        style={{
          transform: 'translateY(calc(-50% + var(--my) * 20px)) translateX(calc(var(--mx) * 30px))',
          background: beam,
        }}
      >
        <div className="beam-breathe absolute inset-x-0 -top-2 h-6 rounded-full bg-accent/25 blur-xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-white/25" style={{ animation: 'beam-breathe 4s ease-in-out infinite' }} />
      </div>
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/40 blur-[40px] dark:bg-white/60" style={{ transform: 'translate(calc(-50% + var(--mx) * 30px), calc(-50% + var(--my) * 20px))' }} />
      <div
        className="pointer-events-none absolute top-1/2 right-[7%] h-2 w-2 -translate-y-1/2 rounded-full bg-accent dark:bg-white"
        style={{ boxShadow: dark ? '0 0 30px 10px rgba(255,255,255,0.5)' : '0 0 26px 8px rgba(79,70,229,0.35)' }}
      />

      {/* ── overlaid content: headline above centre, capsule at centre, CTAs below ── */}
      <div className="relative z-10 grid min-h-[100svh] grid-rows-[1fr_auto_1fr] px-6">
        <div className="flex flex-col items-center justify-end pb-9 text-center">
          <div className="animate-reveal-up inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-accent backdrop-blur dark:border-white/15 dark:bg-white/5 dark:text-indigo-300">
            <LogoMark className="h-3.5 w-3.5" /> Design diagnostic · for design students
          </div>
          <h1 className="animate-reveal-up mt-6 font-display text-4xl font-medium leading-[1.03] tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl" style={{ animationDelay: '90ms', letterSpacing: '-0.03em' }}>
            From a tangle of signals
            <br />
            <span className="text-gradient-signature italic">to one clear signature.</span>
          </h1>
        </div>

        <div className="grid place-items-center">
          <div className="relative flex h-[56px] min-w-[300px] items-center gap-2.5 rounded-full border border-slate-900/10 bg-white/70 px-6 text-left shadow-[0_10px_44px_-8px_rgba(79,70,229,0.3)] backdrop-blur-xl dark:border-white/25 dark:bg-white/10 dark:shadow-[0_10px_44px_-8px_rgba(124,58,237,0.55)] sm:min-w-[360px]">
            <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0 text-slate-500 dark:text-white/80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" />
            </svg>
            <span className="font-sans text-[15px] text-slate-700 dark:text-white/90">
              {phrase}
              <span className="ml-0.5 inline-block w-[2px] translate-y-[2px] bg-slate-500 dark:bg-white/80" style={{ height: '1em', animation: 'caret-blink 1.1s step-end infinite' }} />
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-start pt-9 text-center">
          <p className="animate-reveal-up mx-auto max-w-xl text-[15px] leading-relaxed text-slate-600 dark:text-white/60" style={{ animationDelay: '150ms' }}>
            REVEAL reads how you work — from what you <em>do</em>, not just what you say — and pulls the through-line out
            of the noise.
          </p>
          <div className="animate-reveal-up mt-7 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '230ms' }}>
            <button onClick={onStart} className="press group/btn relative overflow-hidden rounded-2xl bg-accent px-7 py-3.5 text-[15px] font-semibold text-white shadow-glow transition-transform hover:scale-[1.02]">
              <span className="relative z-10">Get started →</span>
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
            </button>
            <button onClick={onSignIn} className="press rounded-2xl border border-slate-300 bg-white/70 px-7 py-3.5 text-[15px] font-semibold text-slate-700 backdrop-blur transition-colors hover:border-slate-400 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-white/30 dark:hover:bg-white/10">
              Sign in
            </button>
          </div>
        </div>
      </div>

      {/* soft fade into the page below + scroll cue */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#f3f2fb] dark:to-noir" />
      <button
        onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
        aria-label="Scroll to learn more"
        className="press absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:text-white/40 dark:hover:text-white/80"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 animate-bounce" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
    </section>
  );
}

/** Woven thread paths — all converge on the capsule at the viewBox centre. */
const THREADS: { d: string; grad: string; w: number; dur: number; delay: number }[] = [
  { d: 'M -90 250 C 220 150 340 420 600 338', grad: 'ch-violet', w: 30, dur: 9, delay: 0 },
  { d: 'M -90 420 C 200 470 400 210 600 338', grad: 'ch-pool', w: 26, dur: 11, delay: 1.2 },
  { d: 'M -90 170 C 260 260 360 500 600 338', grad: 'ch-lime', w: 22, dur: 10, delay: 0.6 },
  { d: 'M -90 500 C 240 380 380 420 600 338', grad: 'ch-warm', w: 24, dur: 12, delay: 2 },
  { d: 'M -90 320 C 160 280 340 350 600 338', grad: 'ch-iris', w: 34, dur: 8.5, delay: 0.3 },
];

/** Types each phrase, holds, deletes, moves on — forever. */
function useTypewriter(words: string[], { typeMs = 55, delMs = 28, holdMs = 1500 } = {}): string {
  const [text, setText] = useState('');
  const [wi, setWi] = useState(0);
  const [phase, setPhase] = useState<'type' | 'hold' | 'del'>('type');

  useEffect(() => {
    const word = words[wi % words.length]!;
    if (phase === 'type') {
      if (text.length < word.length) {
        const t = setTimeout(() => setText(word.slice(0, text.length + 1)), typeMs);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase('hold'), holdMs);
      return () => clearTimeout(t);
    }
    if (phase === 'hold') {
      const t = setTimeout(() => setPhase('del'), 250);
      return () => clearTimeout(t);
    }
    if (text.length > 0) {
      const t = setTimeout(() => setText(word.slice(0, text.length - 1)), delMs);
      return () => clearTimeout(t);
    }
    setWi((i) => i + 1);
    setPhase('type');
    return undefined;
  }, [text, phase, wi, words, typeMs, delMs, holdMs]);

  return text;
}
