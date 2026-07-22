import { useEffect, useRef, useState } from 'react';

/** The live "confusion → clarity" hero showpiece.
 *
 *  Tangled brand-colour threads weave in from the left (the noise of everything
 *  you do) and converge into a frosted glass capsule — the REVEAL lens — which
 *  fires a clean beam of clarity to the right. The capsule types out the kind of
 *  questions a designer can't answer about themselves; the beam is the answer.
 *
 *  Interactive: the whole field parallaxes with the pointer, and hovering the
 *  capsule intensifies the beam. Honours prefers-reduced-motion. */
export function ClarityStage(): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  // Pointer parallax → CSS vars consumed by the thread group + beam.
  function onMove(e: React.PointerEvent): void {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width - 0.5; // −0.5..0.5
    const my = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--mx', String(mx));
    el.style.setProperty('--my', String(my));
  }
  function onLeave(): void {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--mx', '0');
    el.style.setProperty('--my', '0');
  }

  const phrase = useTypewriter([
    'what am I actually good at?',
    'my work feels scattered…',
    'strength, or just a habit?',
    'who am I as a designer?',
    'what do my choices say?',
  ]);

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="group relative mx-auto aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[#08080f] shadow-lift"
      style={{ '--mx': 0, '--my': 0 } as React.CSSProperties}
    >
      {/* faint vignette + brand wash */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_120%_at_15%_50%,rgba(124,58,237,0.16),transparent_60%)]" />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-soft-light" />

      {/* ── the tangled → resolved threads ─────────────────────────────── */}
      <svg
        viewBox="0 0 1200 675"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="cs-violet" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7c3aed" stopOpacity="0" />
            <stop offset="0.4" stopColor="#7c3aed" />
            <stop offset="1" stopColor="#a878f8" />
          </linearGradient>
          <linearGradient id="cs-pool" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2192d9" stopOpacity="0" />
            <stop offset="0.45" stopColor="#2192d9" />
            <stop offset="1" stopColor="#46c2d6" />
          </linearGradient>
          <linearGradient id="cs-lime" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#c2d039" stopOpacity="0" />
            <stop offset="0.5" stopColor="#bee65f" />
            <stop offset="1" stopColor="#bee65f" />
          </linearGradient>
          <linearGradient id="cs-warm" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#d6418f" stopOpacity="0" />
            <stop offset="0.5" stopColor="#d6418f" />
            <stop offset="1" stopColor="#ec6540" />
          </linearGradient>
          <linearGradient id="cs-iris" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#a878f8" stopOpacity="0" />
            <stop offset="0.5" stopColor="#a878f8" />
            <stop offset="1" stopColor="#2192d9" />
          </linearGradient>
          <filter id="cs-soft" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="11" />
          </filter>
        </defs>

        {/* group carries the pointer parallax; each thread floats on its own */}
        <g
          filter="url(#cs-soft)"
          style={{
            transform: 'translate3d(calc(var(--mx) * 26px), calc(var(--my) * 18px), 0)',
            transition: 'transform .5s cubic-bezier(.16,1,.3,1)',
          }}
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
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'center',
                animation: `thread-float ${t.dur}s ease-in-out ${t.delay}s infinite`,
                opacity: 0.9,
              }}
            />
          ))}
        </g>
      </svg>

      {/* ── the beam of clarity (fires right from the capsule) ──────────── */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[3px] w-[46%] -translate-y-1/2 origin-left"
        style={{
          transform: 'translateY(calc(-50% + var(--my) * 18px)) translateX(calc(var(--mx) * 26px))',
          background: 'linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.7) 22%, rgba(168,120,248,0.35) 55%, transparent 100%)',
          filter: 'blur(0.4px)',
        }}
      >
        <div className="beam-breathe absolute inset-x-0 -top-2 h-6 rounded-full bg-white/25 blur-xl transition-opacity duration-500 group-hover:opacity-100" style={{ animation: 'beam-breathe 4s ease-in-out infinite' }} />
      </div>

      {/* ── the frosted capsule (the lens) ─────────────────────────────── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ transform: 'translate(calc(-50% + var(--mx) * 26px), calc(-50% + var(--my) * 18px))' }}
      >
        {/* convergence glow where the threads enter */}
        <div className="pointer-events-none absolute -left-6 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-white/70 blur-2xl" />
        <div className="relative flex h-[54px] min-w-[300px] items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 text-left shadow-[0_8px_40px_-8px_rgba(124,58,237,0.5)] backdrop-blur-xl sm:min-w-[340px]">
          <span aria-hidden className="grid h-4 w-4 place-items-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" />
            </svg>
          </span>
          <span className="font-sans text-[15px] text-white/90">
            {phrase}
            <span className="ml-0.5 inline-block w-[2px] translate-y-[2px] bg-white/80" style={{ height: '1em', animation: 'caret-blink 1.1s step-end infinite' }} />
          </span>
        </div>
      </div>

      {/* bright end-node where the beam leaves the frame */}
      <div className="pointer-events-none absolute top-1/2 right-[6%] h-2 w-2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_30px_10px_rgba(255,255,255,0.55)]" />
    </div>
  );
}

/** Woven thread paths — all converge on the capsule at the viewBox centre. */
const THREADS: { d: string; grad: string; w: number; dur: number; delay: number }[] = [
  { d: 'M -90 250 C 220 150 340 420 600 338', grad: 'cs-violet', w: 30, dur: 9, delay: 0 },
  { d: 'M -90 420 C 200 470 400 210 600 338', grad: 'cs-pool', w: 26, dur: 11, delay: 1.2 },
  { d: 'M -90 170 C 260 260 360 500 600 338', grad: 'cs-lime', w: 22, dur: 10, delay: 0.6 },
  { d: 'M -90 500 C 240 380 380 420 600 338', grad: 'cs-warm', w: 24, dur: 12, delay: 2 },
  { d: 'M -90 320 C 160 280 340 350 600 338', grad: 'cs-iris', w: 34, dur: 8.5, delay: 0.3 },
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
    // del
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
