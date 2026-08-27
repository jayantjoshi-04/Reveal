/**
 * Behavioural archetypes — the 14 activities read from what the student does,
 * not from authored options. Each is a focused interaction that emits the
 * engine `signals` its derivation rules call for. (These are compact,
 * honest interactions rather than the full instrumented tasks in the spec.)
 */
import { useRef, useState } from 'react';
import { B4_SCENES } from '@reveal/shared';
import { Chip, NextButton, Prompt, sig, type ArchetypeProps, type Signal } from './shell.js';

const clamp = (n: number) => Math.max(0, Math.min(100, n));

// ── A3 / O2 · Tap-scene — where your eye goes ──────────────────────────────
const CAT_CONSTRUCT: Record<string, string> = { PEOPLE: 'Empathy', FORM: 'Aesthetic', SYSTEM: 'Systems', DETAIL: 'Naturalistic', TEXT: 'Analytical' };
export function TapScene({ activity, busy, onSubmit }: ArchetypeProps): JSX.Element {
  const scene = B4_SCENES[activity.code === 'O2' ? 2 : 0]!;
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const items = scene.items;
  const submit = (): void => {
    const counts: Record<string, number> = {};
    let total = 0;
    picked.forEach((i) => { const c = items[i]!.category; counts[c] = (counts[c] ?? 0) + 1; total++; });
    const signals: Signal[] = Object.entries(CAT_CONSTRUCT)
      .map(([cat, cid]) => sig(cid, 'do', total ? clamp(((counts[cat] ?? 0) / total) * 200) : 0));
    onSubmit({ signals });
  };
  return (
    <div>
      <Prompt eyebrow={activity.code} title="What do you notice first?" sub={`A ${scene.title.toLowerCase()}. Tap the things that catch your eye — there’s no right answer.`} />
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((it, i) => <Chip key={i} on={picked.has(i)} onClick={() => setPicked((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; })}>{it.label}</Chip>)}
      </div>
      <NextButton busy={busy} disabled={picked.size === 0} onClick={submit} label="Save & continue" />
    </div>
  );
}

// ── A1 / A7 · Allocation — what you protect under pressure ──────────────────
const A1_MOVES = [
  { label: 'Talk to the people it’s for', cid: 'Empathy', edge: null },
  { label: 'Sketch lots of options', cid: 'Aesthetic', edge: null },
  { label: 'Build a rough prototype', cid: 'Making', edge: null },
  { label: 'Plan the steps carefully', cid: 'Analytical', edge: null },
  { label: 'Polish the craft', cid: 'Craft↔Velocity', edge: 'Craft' },
];
export function Allocation({ activity, busy, onSubmit }: ArchetypeProps): JSX.Element {
  const squeeze = activity.code === 'A7';
  const cuts = squeeze ? 2 : 1; // A7 squeezes twice; A1 once — reads what you protect
  const [budget, setBudget] = useState(squeeze ? 16 : 20);
  const [alloc, setAlloc] = useState<number[]>(A1_MOVES.map(() => 0));
  const [phase, setPhase] = useState(0); // cuts applied so far
  const tops = useRef<number[]>([]);
  const spent = alloc.reduce((a, b) => a + b, 0);
  const left = budget - spent;
  const set = (i: number, d: number): void => setAlloc((a) => { if (d > 0 && left <= 0) return a; const n = [...a]; n[i] = Math.max(0, n[i]! + d); return n; });
  const topIndex = (): number => alloc.indexOf(Math.max(...alloc));

  const submit = (topsHist: number[]): void => {
    const total = spent || 1;
    const signals: Signal[] = A1_MOVES.map((m, i) => {
      const share = (alloc[i]! / total) * 100;
      return m.edge ? sig(m.cid, 'do', share, { edge: m.edge, position: -share }) : sig(m.cid, 'do', clamp(share * 1.6));
    });
    const top = topsHist[topsHist.length - 1] ?? topIndex();
    signals.push(sig('Conviction', 'do', clamp(55 + (alloc[top]! / total) * 60))); // the held priority
    if (squeeze) {
      const stable = topsHist.every((t) => t === topsHist[0]); // kept the same top through the cuts
      signals.push(stable ? sig('Persist↔Pivot', 'do', -50, { edge: 'Persist', position: -50 }) : sig('Persist↔Pivot', 'do', 50, { edge: 'Pivot', position: 50 }));
      signals.push(sig('Routine↔Challenge', 'do', 62, { edge: 'Challenge', position: 62 })); // still engaging under pressure
      signals.push(sig('Boot↔Resourced', 'do', -40, { edge: 'Boot', position: -40 })); // making do with less
    }
    onSubmit({ signals });
  };

  const lock = (): void => {
    const hist = [...tops.current, topIndex()];
    tops.current = hist;
    if (phase < cuts) {
      setBudget((b) => Math.ceil(b / 2));
      setAlloc((a) => a.map((x) => Math.floor(x / 2)));
      setPhase((p) => p + 1);
    } else {
      submit(hist);
    }
  };

  return (
    <div>
      <Prompt
        eyebrow={activity.code}
        title={phase === 0 ? (squeeze ? 'A live brief — spend your moves.' : 'You’ve got a new brief. Spend your moves.') : 'A constraint just hit — you have less. What do you keep?'}
        sub={`Distribute your moves across what you’d actually do.${phase > 0 ? ` Cut ${phase} of ${cuts}.` : ''}`}
      />
      <div className="space-y-3">
        {A1_MOVES.map((m, i) => (
          <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]">
            <span className="text-[13.5px] text-slate-700 dark:text-slate-200">{m.label}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => set(i, -1)} className="h-7 w-7 rounded-lg bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">−</button>
              <span className="w-6 text-center font-mono text-sm text-slate-900 dark:text-white">{alloc[i]}</span>
              <button onClick={() => set(i, +1)} disabled={left <= 0} className="h-7 w-7 rounded-lg bg-accent/10 text-accent disabled:opacity-30">+</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-center font-mono text-[11px] text-slate-400">{left} of {budget} moves left</div>
      <NextButton busy={busy} disabled={spent === 0} onClick={lock} label={phase < cuts ? 'Lock it in' : 'Save & continue'} />
    </div>
  );
}

// ── A2 · Taste duel — quick which-is-stronger ──────────────────────────────
// Left is the more-resolved piece in each pair — a consistent left-lean reads as
// a trustworthy eye; how fast the calls come reads as decisiveness.
const DUELS = [
  ['A tight, restrained layout', 'A loud, maximal layout'],
  ['Muted, considered colour', 'Bright, high-contrast colour'],
  ['One bold idea, clearly told', 'Many ideas at once'],
  ['Refined, resolved detail', 'Rough, energetic detail'],
  ['Calm, generous spacing', 'Dense, packed spacing'],
  ['A quiet, confident type choice', 'A decorative, ornate one'],
  ['A clear focal point', 'Competing focal points'],
  ['Consistent, systematic grid', 'Freeform, improvised placement'],
] as const;
export function Duel({ busy, onSubmit }: ArchetypeProps): JSX.Element {
  const [picks, setPicks] = useState<(0 | 1 | null)[]>(DUELS.map(() => null));
  const times = useRef<number[]>([]);
  const last = useRef(Date.now());
  const choose = (i: number, side: 0 | 1): void => {
    times.current[i] = Date.now() - last.current;
    last.current = Date.now();
    setPicks((p) => { const n = [...p]; n[i] = side; return n; });
  };
  const done = picks.every((p) => p !== null);
  const submit = (): void => {
    const resolved = picks.filter((p) => p === 0).length;
    const aesthetic = clamp((resolved / DUELS.length) * 100);
    const consistency = Math.abs(resolved - DUELS.length / 2) / (DUELS.length / 2);
    const deep = clamp(consistency * 100);
    const valid = times.current.filter((t) => t > 0).sort((a, b) => a - b);
    const median = valid.length ? valid[Math.floor(valid.length / 2)]! : 3000;
    const decisive = median < 2200 ? sig('Bold↔Careful', 'do', -45, { edge: 'Bold', position: -45 }) : median > 4800 ? sig('Bold↔Careful', 'do', 45, { edge: 'Careful', position: 45 }) : sig('Bold↔Careful', 'do', 0);
    onSubmit({ signals: [sig('Aesthetic', 'do', aesthetic), sig('Deep↔Broad', 'do', -deep, { edge: 'Deep', position: -deep }), decisive] });
  };
  return (
    <div>
      <Prompt eyebrow="A2" title="Which is stronger?" sub="Trust your gut and move fast — pick the one that reads as the better piece." />
      <div className="space-y-3">
        {DUELS.map((d, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            {[0, 1].map((side) => (
              <Chip key={side} on={picks[i] === side} onClick={() => choose(i, side as 0 | 1)}>{d[side]}</Chip>
            ))}
          </div>
        ))}
      </div>
      <NextButton busy={busy} disabled={!done} onClick={submit} label="Save & continue" />
    </div>
  );
}

// ── A9 · Spatial play — a real ordering task ───────────────────────────────
const A9_STEPS = [
  { label: 'Talk to the people it’s for', o: 0 },
  { label: 'Frame the real problem', o: 1 },
  { label: 'Sketch a few options', o: 2 },
  { label: 'Prototype the strongest one', o: 3 },
  { label: 'Test it and refine', o: 4 },
];
export function Arrange({ activity, busy, onSubmit }: ArchetypeProps): JSX.Element {
  if (activity.code === 'GF1') return <MaterialImprov busy={busy} onSubmit={onSubmit} />;
  const t0 = useRef(Date.now());
  const [shuffled] = useState(() => [...A9_STEPS].map((s, i) => ({ ...s, i })).sort(() => Math.random() - 0.5));
  const [order, setOrder] = useState<number[]>([]);
  const done = order.length === shuffled.length;
  const add = (i: number): void => setOrder((o) => (o.includes(i) ? o : [...o, i]));

  const submit = (): void => {
    const seq = order.map((idx) => shuffled.find((s) => s.i === idx)!.o);
    let correct = 0, total = 0;
    for (let a = 0; a < seq.length; a++) for (let b = a + 1; b < seq.length; b++) { total++; if (seq[a]! < seq[b]!) correct++; }
    const acc = total ? correct / total : 0; // how well the dependency order was recovered
    const reflected = Date.now() - t0.current > 14000; // took time to plan the sequence
    onSubmit({
      signals: [
        sig('Analytical', 'do', clamp(30 + acc * 70)),
        sig('Systems', 'do', clamp(40 + acc * 50)),
        sig('Spatial', 'do', clamp(55 + acc * 30)),
        reflected ? sig('Reflect↔Action', 'do', -45, { edge: 'Reflect', position: -45 }) : sig('Reflect↔Action', 'do', 45, { edge: 'Action', position: 45 }),
      ],
    });
  };

  return (
    <div>
      <Prompt eyebrow="A9" title="Put these in the order you’d actually work." sub="Tap them one by one to build your sequence. There’s a logic to it — find yours." />
      <div className="space-y-2">
        {shuffled.map((s) => {
          const pos = order.indexOf(s.i);
          return (
            <button key={s.i} onClick={() => add(s.i)} disabled={pos >= 0}
              className={`press flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-[13.5px] transition-colors ${pos >= 0 ? 'border-accent/40 bg-accent-soft text-slate-500 dark:bg-accent/10' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200'}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] ${pos >= 0 ? 'bg-accent text-white' : 'bg-slate-100 text-slate-400 dark:bg-white/10'}`}>{pos >= 0 ? pos + 1 : '·'}</span>
              {s.label}
            </button>
          );
        })}
      </div>
      {order.length > 0 ? <button onClick={() => setOrder([])} className="mt-3 text-[12px] text-slate-400 hover:text-slate-600">Start over</button> : null}
      <NextButton busy={busy} disabled={!done} onClick={submit} label="Save & continue" />
    </div>
  );
}

// ── GF1 · Material improv — a tactile 30-second beat ───────────────────────
function MaterialImprov({ busy, onSubmit }: { busy: boolean; onSubmit: ArchetypeProps['onSubmit'] }): JSX.Element {
  const opts = [
    { label: 'Dive in hands-first and see what happens', s: [sig('Kinesthetic', 'do', 78), sig('Experiment↔Study', 'do', -55, { edge: 'Experiment', position: -55 }), sig('Hands↔Visual', 'do', -50, { edge: 'Hands', position: -50 })] },
    { label: 'Turn it over, feel it out, then commit', s: [sig('Kinesthetic', 'do', 62), sig('Experiment↔Study', 'do', -10, { edge: 'Experiment', position: -10 }), sig('Hands↔Visual', 'do', -20, { edge: 'Hands', position: -20 })] },
    { label: 'Picture the result first, then handle it', s: [sig('Kinesthetic', 'do', 45), sig('Experiment↔Study', 'do', 45, { edge: 'Study', position: 45 }), sig('Hands↔Visual', 'do', 45, { edge: 'Visual', position: 45 })] },
  ];
  const [pick, setPick] = useState<number | null>(null);
  return (
    <div>
      <Prompt eyebrow="GF1" title="Thirty seconds. Make something from these parts." sub="What’s your very first instinct?" />
      <div className="space-y-2">{opts.map((o, i) => <Chip key={i} on={pick === i} onClick={() => setPick(i)}>{o.label}</Chip>)}</div>
      <NextButton busy={busy} disabled={pick === null} onClick={() => onSubmit({ signals: opts[pick!]!.s })} label="Save & continue" />
    </div>
  );
}

// ── O1 · Pick-from-menu — which briefs pull you ────────────────────────────
const BRIEFS = [
  { label: 'A physical product', s: [sig('Making', 'do', 70), sig('Spatial', 'do', 60)] },
  { label: 'A screen / app', s: [sig('Digital/Intx', 'do', 72)] },
  { label: 'A service or system', s: [sig('Systems', 'do', 72), sig('Sustain/Sys', 'do', 55)] },
  { label: 'A research study', s: [sig('Research', 'do', 72), sig('Empathy', 'do', 58)] },
  { label: 'A space / environment', s: [sig('Spatial', 'do', 72), sig('Aesthetic', 'do', 55)] },
  { label: 'A brand / identity', s: [sig('Aesthetic', 'do', 70), sig('Narrative', 'do', 58)] },
];
export function PickMenu({ activity, busy, onSubmit }: ArchetypeProps): JSX.Element {
  const [picked, setPicked] = useState<Set<number>>(new Set());
  return (
    <div>
      <Prompt eyebrow="O1" title="Which of these briefs pull you?" sub="Pick the two or three you’d most want to take on." />
      <div className="grid gap-2 sm:grid-cols-2">
        {BRIEFS.map((b, i) => <Chip key={i} on={picked.has(i)} onClick={() => setPicked((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; })}>{b.label}</Chip>)}
      </div>
      <NextButton busy={busy} disabled={picked.size === 0} onClick={() => onSubmit({ signals: [...picked].flatMap((i) => BRIEFS[i]!.s) })} label="Save & continue" />
    </div>
  );
}

// ── O3 · Two-version fork ──────────────────────────────────────────────────
export function Fork({ busy, onSubmit }: ArchetypeProps): JSX.Element {
  const [commit, setCommit] = useState<number | null>(null);
  const [kind, setKind] = useState<number | null>(null);
  const done = commit !== null && kind !== null;
  const submit = (): void => {
    const signals: Signal[] = [];
    signals.push(commit === 0 ? sig('Bold↔Careful', 'do', -60, { edge: 'Bold', position: -60 }) : sig('Bold↔Careful', 'do', 55, { edge: 'Careful', position: 55 }));
    signals.push(kind === 0 ? sig('Reinvent↔Redefine', 'do', -55, { edge: 'Reinvent', position: -55 }) : sig('Reinvent↔Redefine', 'do', 55, { edge: 'Redefine', position: 55 }));
    onSubmit({ signals });
  };
  return (
    <div>
      <Prompt eyebrow="O3" title="Two directions, same brief." sub="You can’t do both." />
      <div className="mb-2 text-[12.5px] font-medium text-slate-500 dark:text-slate-400">Which is more you?</div>
      <div className="grid grid-cols-2 gap-2">
        <Chip on={commit === 0} onClick={() => setCommit(0)}>Commit hard to one</Chip>
        <Chip on={commit === 1} onClick={() => setCommit(1)}>Keep both alive a while</Chip>
      </div>
      <div className="mb-2 mt-4 text-[12.5px] font-medium text-slate-500 dark:text-slate-400">And the direction you’d fork toward?</div>
      <div className="grid grid-cols-2 gap-2">
        <Chip on={kind === 0} onClick={() => setKind(0)}>The reinvented, riskier one</Chip>
        <Chip on={kind === 1} onClick={() => setKind(1)}>The refined, surer one</Chip>
      </div>
      <NextButton busy={busy} disabled={!done} onClick={submit} label="Save & continue" />
    </div>
  );
}

// ── GF2 · Cold open ────────────────────────────────────────────────────────
export function ColdOpen({ busy, onSubmit }: ArchetypeProps): JSX.Element {
  const [pick, setPick] = useState<number | null>(null);
  const opts = [
    { label: 'Start exploring — try things and see', s: [sig('Ambig↔Logical', 'do', -55, { edge: 'Ambig', position: -55 }), sig('Experiment↔Study', 'do', -55, { edge: 'Experiment', position: -55 })] },
    { label: 'Set up some structure first', s: [sig('Ambig↔Logical', 'do', 55, { edge: 'Logical', position: 55 }), sig('Experiment↔Study', 'do', 50, { edge: 'Study', position: 50 })] },
  ];
  return (
    <div>
      <Prompt eyebrow="GF2" title="Begin." sub="No brief, no instructions. What do you do first?" />
      <div className="space-y-2">{opts.map((o, i) => <Chip key={i} on={pick === i} onClick={() => setPick(i)}>{o.label}</Chip>)}</div>
      <NextButton busy={busy} disabled={pick === null} onClick={() => onSubmit({ signals: opts[pick!]!.s })} label="Save & continue" />
    </div>
  );
}

// ── B4 · Handoff (compose) ─────────────────────────────────────────────────
export function Compose({ busy, onSubmit }: ArchetypeProps): JSX.Element {
  const tags = [
    { label: 'A clear written story of the project', s: [sig('Narrative', 'do', 72)] },
    { label: 'A map of how the parts connect', s: [sig('Systems', 'do', 70), sig('Sustain/Sys', 'do', 50)] },
    { label: 'Notes aimed at whoever picks it up', s: [sig('With↔Alone', 'do', -50, { edge: 'With', position: -50 }), sig('Collab', 'do', 55)] },
    { label: 'Just the files — they’ll figure it out', s: [sig('With↔Alone', 'do', 50, { edge: 'Alone', position: 50 })] },
  ];
  const [picked, setPicked] = useState<Set<number>>(new Set());
  return (
    <div>
      <Prompt eyebrow="B4" title="Hand one of your projects to someone else." sub="What would you actually prepare for them? Pick what you’d include." />
      <div className="grid gap-2">{tags.map((t, i) => <Chip key={i} on={picked.has(i)} onClick={() => setPicked((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; })}>{t.label}</Chip>)}</div>
      <NextButton busy={busy} disabled={picked.size === 0} onClick={() => onSubmit({ signals: [...picked].flatMap((i) => tags[i]!.s) })} label="Save & continue" />
    </div>
  );
}

// ── U1 / U2 / U3 · Uploads (self-report checklists) ────────────────────────
const CAPABILITIES = [
  ['Sketching / visualisation', 'Sketch/Viz'], ['Digital / interaction', 'Digital/Intx'], ['Making / prototyping', 'Making'],
  ['Materials / fabrication', 'Materials'], ['Research', 'Research'], ['Sustainability / systems', 'Sustain/Sys'], ['Collaboration', 'Collab'],
] as const;
export function Upload({ activity, busy, onSubmit }: ArchetypeProps): JSX.Element {
  const [sel, setSel] = useState<Set<number>>(new Set());
  const kind = activity.code;
  const heading = kind === 'U1' ? 'Which skills are on your résumé?' : kind === 'U2' ? 'What kinds of rooms have you worked in?' : 'What does your portfolio actually show?';
  const list: readonly (readonly [string, string, ('say' | 'do')?])[] =
    kind === 'U2'
      ? ([
          ['Structured, process-heavy places', 'Auto↔Structure', 'say'], ['Feedback-rich, collaborative places', 'Insul↔Feedback', 'say'],
          ['High-stakes, fast places', 'Routine↔Challenge', 'say'], ['Cross-disciplinary teams', 'Silo↔CrossD', 'say'],
          ['Well-resourced studios', 'Boot↔Resourced', 'say'], ['Safe-to-fail environments', 'Blame↔Safe', 'say'],
        ] as const)
      : (CAPABILITIES.map(([l, c]) => [l, c, kind === 'U1' ? 'say' : 'do'] as const));
  const submit = (): void => {
    const signals: Signal[] = [...sel].map((i) => {
      const [, cid, ch] = list[i]!;
      const channel = (ch ?? 'do') as 'say' | 'do';
      if (cid.includes('↔')) { const v = 60; return sig(cid, channel, v, { edge: cid.split('↔')[1]!, position: v }); }
      return sig(cid, channel, 65);
    });
    onSubmit({ signals });
  };
  return (
    <div>
      <Prompt eyebrow={kind} title={heading} sub="This stands in for the résumé/portfolio upload — tick what genuinely applies." />
      <div className="grid gap-2">{list.map(([label], i) => <Chip key={i} on={sel.has(i)} onClick={() => setSel((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; })}>{label}</Chip>)}</div>
      <NextButton busy={busy} disabled={sel.size === 0} onClick={submit} label="Save & continue" />
    </div>
  );
}
