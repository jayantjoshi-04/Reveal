/**
 * Differentiated archetypes — the activities that used to collapse into the same
 * "why / underneath" ladder now each have their own interaction that emits the
 * DO (behavioural) signals their derivation rules call for. One component per
 * activity, keyed by archetype in survey.routes.ts + CaptureV2's REGISTRY.
 */
import { useRef, useState } from 'react';
import { Chip, NextButton, Prompt, sig, type ArchetypeProps, type Signal } from './shell.js';

const clamp = (n: number): number => Math.max(0, Math.min(100, n));
/** A signed bipolar/axis signal: negative toward the low edge, positive toward the high. */
const lean = (cid: string, edge: string, lowEdge: string, mag = 55): Signal => {
  const v = edge === lowEdge ? -mag : mag;
  return sig(cid, 'do', v, { edge, position: v });
};

// A small section label reused across these screens.
function Step({ label }: { label: string }): JSX.Element {
  return <div className="mb-2 mt-4 text-[12.5px] font-medium text-slate-500 first:mt-0 dark:text-slate-400">{label}</div>;
}

// ── A4 · Project-Wall Sequencing — arrange a project's pieces, then the break ──
const A4_PIECES = [
  { label: 'The brief & problem framing', o: 0 },
  { label: 'User / context research', o: 1 },
  { label: 'Concepts & references', o: 2 },
  { label: 'Wireframes / rough builds', o: 3 },
  { label: 'The resolved prototype', o: 4 },
  { label: 'Test notes & the final cut', o: 5 },
];
export function ProjectWall({ busy, onSubmit }: ArchetypeProps): JSX.Element {
  const t0 = useRef(Date.now());
  const [shuffled] = useState(() => A4_PIECES.map((s, i) => ({ ...s, i })).sort(() => Math.random() - 0.5));
  const [order, setOrder] = useState<number[]>([]);
  const [phase, setPhase] = useState<'seq' | 'break'>('seq');
  const done = order.length === shuffled.length;
  const add = (i: number): void => setOrder((o) => (o.includes(i) ? o : [...o, i]));

  const finish = (persistEdge: 'Persist' | 'Pivot'): void => {
    const seq = order.map((idx) => shuffled.find((s) => s.i === idx)!.o);
    let correct = 0, total = 0;
    for (let a = 0; a < seq.length; a++) for (let b = a + 1; b < seq.length; b++) { total++; if (seq[a]! < seq[b]!) correct++; }
    const acc = total ? correct / total : 0; // recovered the dependency order
    const planned = Date.now() - t0.current > 12000; // took time before committing
    onSubmit({
      signals: [
        sig('Analytical', 'do', clamp(30 + acc * 70)),
        sig('Systems', 'do', clamp(40 + acc * 50)),
        planned ? lean('Reflect↔Action', 'Reflect', 'Reflect', 45) : lean('Reflect↔Action', 'Action', 'Reflect', 45),
        lean('Persist↔Pivot', persistEdge, 'Persist', 50),
      ],
    });
  };

  if (phase === 'break') {
    return (
      <div>
        <Prompt eyebrow="A4" title="Halfway through, the order broke — a dependency you didn’t expect." sub="What did you actually do?" />
        <div className="space-y-2">
          <Chip on={false} onClick={() => finish('Pivot')}>I stopped, re-planned, and resequenced around it</Chip>
          <Chip on={false} onClick={() => finish('Persist')}>I pushed my original order through anyway</Chip>
        </div>
      </div>
    );
  }
  return (
    <div>
      <Prompt eyebrow="A4" title="A project’s pieces, scrambled on the wall." sub="Tap them into the order you’d actually run it — the sequence that gets it built." />
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
      <NextButton busy={busy} disabled={!done} onClick={() => setPhase('break')} label="Lock the order" />
    </div>
  );
}

// ── B1 · Curate Your Own Show — pick the pieces, then what ties them ──────────
const B1_PIECES = [
  { label: 'A polished visual / brand piece', cid: 'Sketch/Viz', ii: 'Income' as const },
  { label: 'An app / interactive build', cid: 'Digital/Intx', ii: 'Income' as const },
  { label: 'A hands-made / fabricated object', cid: 'Making', ii: 'Impact' as const },
  { label: 'A materials / craft experiment', cid: 'Materials', ii: 'Impact' as const },
  { label: 'A research or discovery project', cid: 'Research', ii: 'Impact' as const },
  { label: 'A systems / service piece', cid: 'Sustain/Sys', ii: 'Impact' as const },
  { label: 'A team / collaboration project', cid: 'Collab', ii: 'Income' as const },
];
const B1_FRAMES = [
  { label: 'A clear through-line — they tell one story', s: [sig('Narrative', 'do', 78)] },
  { label: 'My range — they show how much I can do', s: [sig('Narrative', 'do', 45)] },
  { label: 'My best craft — the most resolved work', s: [sig('Narrative', 'do', 55)] },
];
export function CurateShow({ busy, onSubmit }: ArchetypeProps): JSX.Element {
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [frame, setFrame] = useState<number | null>(null);
  const toggle = (i: number): void => setPicked((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : (n.size < 3 && n.add(i)); return n; });
  const submit = (): void => {
    const chosen = [...picked];
    const impact = chosen.filter((i) => B1_PIECES[i]!.ii === 'Impact').length;
    const income = chosen.length - impact;
    const signals: Signal[] = chosen.map((i) => sig(B1_PIECES[i]!.cid, 'do', 66));
    // Conviction: fewer, firmer picks read as a stronger point of view.
    signals.push(sig('Conviction', 'do', clamp(90 - (chosen.length - 1) * 12)));
    if (impact !== income) signals.push(lean('Impact↔Income', impact > income ? 'Impact' : 'Income', 'Impact', 40));
    if (frame !== null) signals.push(...B1_FRAMES[frame]!.s);
    onSubmit({ signals });
  };
  return (
    <div>
      <Prompt eyebrow="B1" title="Curate a small show of your own work." sub="Pick the three pieces you’d actually hang — the ones that are most you." />
      <Step label={`Choose up to three (${picked.size}/3)`} />
      <div className="grid gap-2">{B1_PIECES.map((p, i) => <Chip key={i} on={picked.has(i)} onClick={() => toggle(i)}>{p.label}</Chip>)}</div>
      {picked.size > 0 ? (<><Step label="What ties them together?" /><div className="grid gap-2">{B1_FRAMES.map((f, i) => <Chip key={i} on={frame === i} onClick={() => setFrame(i)}>{f.label}</Chip>)}</div></>) : null}
      <NextButton busy={busy} disabled={picked.size === 0 || frame === null} onClick={submit} label="Save & continue" />
    </div>
  );
}

// ── B2 · Reframe Your Case Study — which angle you retell it from ─────────────
const B2_ANGLES = [
  { label: 'The people it was for — who it helped', s: [sig('Empathy', 'do', 72)] },
  { label: 'The decisions & logic behind it', s: [sig('Analytical', 'do', 70)] },
  { label: 'The story arc — how it unfolded', s: [sig('Narrative', 'do', 72)] },
  { label: 'How it looks — the craft & finish', s: [sig('Aesthetic', 'do', 70)] },
  { label: 'How the parts connect — the whole system', s: [sig('Systems', 'do', 70)] },
];
export function Reframe({ busy, onSubmit }: ArchetypeProps): JSX.Element {
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const toggle = (i: number): void => setPicked((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });
  return (
    <div>
      <Prompt eyebrow="B2" title="Re-tell one of your projects — not the polished pitch, the real one." sub="Which angles would you lead with? Pick the ones that fit how you’d actually tell it." />
      <div className="grid gap-2">{B2_ANGLES.map((a, i) => <Chip key={i} on={picked.has(i)} onClick={() => toggle(i)}>{a.label}</Chip>)}</div>
      <NextButton busy={busy} disabled={picked.size === 0} onClick={() => onSubmit({ signals: [...picked].flatMap((i) => B2_ANGLES[i]!.s) })} label="Save & continue" />
    </div>
  );
}

// ── B3 · The Autopsy — how you handled it + what room it was ──────────────────
const B3_ROOMS: { q: string; a: [string, string]; cid: string; low: string }[] = [
  { q: 'The room was…', a: ['free & self-directed', 'structured & directed'], cid: 'Auto↔Structure', low: 'Auto' },
  { q: 'Feedback was…', a: ['scarce — I worked insulated', 'rich — lots of eyes on it'], cid: 'Insul↔Feedback', low: 'Insul' },
  { q: 'Failing there felt…', a: ['risky — high blame', 'safe — safe to fail'], cid: 'Blame↔Safe', low: 'Blame' },
  { q: 'The team was…', a: ['siloed — my discipline only', 'cross-disciplinary'], cid: 'Silo↔CrossD', low: 'Silo' },
];
export function Autopsy({ busy, onSubmit }: ArchetypeProps): JSX.Element {
  const [recover, setRecover] = useState<'Bounce' | 'Needs' | null>(null);
  const [diagnose, setDiagnose] = useState<'Reflect' | 'Action' | null>(null);
  const [rooms, setRooms] = useState<Record<number, 0 | 1>>({});
  const [value, setValue] = useState<{ cid: string; edge: string; low: string } | null>(null);
  const values = [
    { label: 'Doing good vs. paying off', cid: 'Impact↔Income', edge: 'Impact', low: 'Impact', alt: 'Income' },
    { label: 'The user vs. the business', cid: 'User↔Business', edge: 'User', low: 'User', alt: 'Business' },
    { label: 'Reaching many vs. going deep for a few', cid: 'Equity↔Focus', edge: 'Equity', low: 'Equity', alt: 'Focus' },
  ];
  const ready = recover && diagnose && Object.keys(rooms).length === B3_ROOMS.length && value;
  const submit = (): void => {
    const signals: Signal[] = [];
    if (recover) signals.push(lean('Bounce↔Needs', recover, 'Bounce', 50));
    if (diagnose) signals.push(lean('Reflect↔Action', diagnose, 'Reflect', 50));
    B3_ROOMS.forEach((r, i) => { const side = rooms[i]; if (side !== undefined) signals.push(lean(r.cid, side === 0 ? r.low : r.cid.split('↔')[1]!, r.low, 45)); });
    if (value) signals.push(lean(value.cid, value.edge, value.low, 45));
    onSubmit({ signals });
  };
  return (
    <div>
      <Prompt eyebrow="B3" title="Pick a project that went wrong — and let’s read the room." sub="Not to relive it. The conditions around a failure say as much as the work." />
      <Step label="When it fell apart, you…" />
      <div className="grid grid-cols-2 gap-2">
        <Chip on={recover === 'Bounce'} onClick={() => setRecover('Bounce')}>bounced back fast</Chip>
        <Chip on={recover === 'Needs'} onClick={() => setRecover('Needs')}>needed time to recover</Chip>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Chip on={diagnose === 'Reflect'} onClick={() => setDiagnose('Reflect')}>paused to diagnose why</Chip>
        <Chip on={diagnose === 'Action'} onClick={() => setDiagnose('Action')}>moved straight on</Chip>
      </div>
      <Step label="What kind of room was it?" />
      <div className="space-y-2">
        {B3_ROOMS.map((r, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            <Chip on={rooms[i] === 0} onClick={() => setRooms((s) => ({ ...s, [i]: 0 }))}>{r.a[0]}</Chip>
            <Chip on={rooms[i] === 1} onClick={() => setRooms((s) => ({ ...s, [i]: 1 }))}>{r.a[1]}</Chip>
          </div>
        ))}
      </div>
      <Step label="And underneath, the tension that really bit?" />
      <div className="space-y-2">{values.map((v) => <Chip key={v.cid} on={value?.cid === v.cid} onClick={() => setValue(v)}>{v.label}</Chip>)}</div>
      <NextButton busy={busy} disabled={!ready} onClick={submit} label="Save & continue" />
    </div>
  );
}

// ── C1 · The Most-You Board — coherence of taste + one world vs many ──────────
const C1_TILES = [
  'Swiss / grid minimalism', 'Warm hand-drawn craft', 'Bold maximal graphics', 'Muted editorial calm',
  'Raw brutalist structure', 'Playful, toy-like forms', 'Organic / natural textures', 'Precise technical systems',
];
export function MoodBoard({ busy, onSubmit }: ArchetypeProps): JSX.Element {
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [span, setSpan] = useState<'Deep' | 'Broad' | null>(null);
  const toggle = (i: number): void => setPicked((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const submit = (): void => {
    // A tighter, more selective board reads as a more discriminating eye.
    const focus = picked.size <= 3 ? 78 : picked.size <= 5 ? 60 : 45;
    const signals: Signal[] = [sig('Aesthetic', 'do', focus)];
    if (span) signals.push(lean('Deep↔Broad', span, 'Deep', 50));
    onSubmit({ signals });
  };
  return (
    <div>
      <Prompt eyebrow="C1" title="Build your Most-You board." sub="Tap the worlds you keep coming back to — the references that feel most like you." />
      <div className="grid gap-2 sm:grid-cols-2">{C1_TILES.map((t, i) => <Chip key={i} on={picked.has(i)} onClick={() => toggle(i)}>{t}</Chip>)}</div>
      {picked.size > 0 ? (<><Step label="Step back — what is your board?" /><div className="grid grid-cols-2 gap-2">
        <Chip on={span === 'Deep'} onClick={() => setSpan('Deep')}>One tight, coherent world</Chip>
        <Chip on={span === 'Broad'} onClick={() => setSpan('Broad')}>A wide range across many</Chip>
      </div></>) : null}
      <NextButton busy={busy} disabled={picked.size === 0 || span === null} onClick={submit} label="Save & continue" />
    </div>
  );
}

// ── C2 · Paths, Not Just Idols — pick the paths you'd want ────────────────────
const C2_PATHS = [
  { label: 'The independent maker — your own studio, your own objects', cids: ['Making'], ii: 'Impact', ab: 'Auton' },
  { label: 'The product designer inside a big tech team', cids: ['Digital/Intx'], ii: 'Income', ab: 'Belong' },
  { label: 'The researcher / strategist shaping what gets made', cids: ['Research'], ii: 'Impact', ab: 'Belong' },
  { label: 'The systems / service designer fixing how things work', cids: ['Sustain/Sys'], ii: 'Impact', ab: 'Belong' },
  { label: 'The brand / visual director with a signature look', cids: ['Aesthetic'], ii: 'Income', ab: 'Auton' },
  { label: 'The craft specialist known for one deep thing', cids: ['Materials'], ii: 'Impact', ab: 'Auton' },
];
export function Paths({ busy, onSubmit }: ArchetypeProps): JSX.Element {
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const toggle = (i: number): void => setPicked((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const submit = (): void => {
    const chosen = [...picked];
    const signals: Signal[] = chosen.flatMap((i) => C2_PATHS[i]!.cids.map((c) => sig(c, 'do', 64)));
    const impact = chosen.filter((i) => C2_PATHS[i]!.ii === 'Impact').length;
    const income = chosen.length - impact;
    if (impact !== income) signals.push(lean('Impact↔Income', impact > income ? 'Impact' : 'Income', 'Impact', 42));
    const auton = chosen.filter((i) => C2_PATHS[i]!.ab === 'Auton').length;
    const belong = chosen.length - auton;
    if (auton !== belong) signals.push(lean('Auton↔Belong', auton > belong ? 'Auton' : 'Belong', 'Auton', 42));
    onSubmit({ signals });
  };
  return (
    <div>
      <Prompt eyebrow="C2" title="Pick the paths you’d want — the whole path, not just the person." sub="Whose working life, not whose highlight reel? Choose the ones that pull you." />
      <div className="grid gap-2">{C2_PATHS.map((p, i) => <Chip key={i} on={picked.has(i)} onClick={() => toggle(i)}>{p.label}</Chip>)}</div>
      <NextButton busy={busy} disabled={picked.size === 0} onClick={submit} label="Save & continue" />
    </div>
  );
}

// ── C3 · The Steal-This Wall — what you'd take, and how you'd use it ──────────
const C3_STEALS = ['A colour move', 'A way of structuring space', 'A type / lettering trick', 'A material or texture', 'A storytelling device', 'A workflow / technique', 'An interaction pattern', 'A conceptual angle'];
export function StealWall({ busy, onSubmit }: ArchetypeProps): JSX.Element {
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [use, setUse] = useState<'Reinvent' | 'Redefine' | null>(null);
  const [open, setOpen] = useState<'Receptive' | 'Question' | null>(null);
  const toggle = (i: number): void => setPicked((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const ready = picked.size > 0 && use && open;
  const submit = (): void => {
    const signals: Signal[] = [sig('Aesthetic', 'do', clamp(50 + picked.size * 6))];
    if (use) signals.push(lean('Reinvent↔Redefine', use, 'Reinvent', 50));
    if (open) signals.push(lean('Question↔Receptive', open, 'Question', 50));
    onSubmit({ signals });
  };
  return (
    <div>
      <Prompt eyebrow="C3" title="A wall of things you’d steal." sub="Moves, techniques, ideas from anywhere. Tap what you’d take." />
      <div className="grid gap-2 sm:grid-cols-2">{C3_STEALS.map((s, i) => <Chip key={i} on={picked.has(i)} onClick={() => toggle(i)}>{s}</Chip>)}</div>
      {picked.size > 0 ? (<>
        <Step label="What do you do with what you take?" />
        <div className="grid grid-cols-2 gap-2">
          <Chip on={use === 'Reinvent'} onClick={() => setUse('Reinvent')}>Transform it into something new</Chip>
          <Chip on={use === 'Redefine'} onClick={() => setUse('Redefine')}>Refine my own with it</Chip>
        </div>
        <Step label="And how freely do you borrow?" />
        <div className="grid grid-cols-2 gap-2">
          <Chip on={open === 'Receptive'} onClick={() => setOpen('Receptive')}>Openly — good ideas are everywhere</Chip>
          <Chip on={open === 'Question'} onClick={() => setOpen('Question')}>Warily — mostly my own way</Chip>
        </div>
      </>) : null}
      <NextButton busy={busy} disabled={!ready} onClick={submit} label="Save & continue" />
    </div>
  );
}

// ── A8 · The Quick Make — instinct + how you get your hands in ────────────────
export function QuickMake({ busy, onSubmit }: ArchetypeProps): JSX.Element {
  const [approach, setApproach] = useState<number | null>(null);
  const opts = [
    { label: 'Grab the parts and start building — think with my hands', s: [sig('Kinesthetic', 'do', 80), sig('Making', 'do', 68), lean('Hands↔Visual', 'Hands', 'Hands', 55)] },
    { label: 'Handle them, feel it out, then commit to a build', s: [sig('Kinesthetic', 'do', 64), sig('Making', 'do', 60), lean('Hands↔Visual', 'Hands', 'Hands', 20)] },
    { label: 'Picture the finished thing first, then assemble to match', s: [sig('Kinesthetic', 'do', 45), sig('Making', 'do', 58), lean('Hands↔Visual', 'Visual', 'Hands', 50)] },
  ];
  return (
    <div>
      <Prompt eyebrow="A8" title="Three minutes. Make something real from these parts." sub="No plan handed to you — just the parts and the clock. What’s your instinct?" />
      <div className="space-y-2">{opts.map((o, i) => <Chip key={i} on={approach === i} onClick={() => setApproach(i)}>{o.label}</Chip>)}</div>
      <NextButton busy={busy} disabled={approach === null} onClick={() => onSubmit({ signals: opts[approach!]!.s })} label="Save & continue" />
    </div>
  );
}

// ── O4 · Teaching Moment — how you make it land ───────────────────────────────
export function Teach({ busy, onSubmit }: ArchetypeProps): JSX.Element {
  const [pick, setPick] = useState<number | null>(null);
  const opts = [
    { label: 'A story or analogy that makes it click', s: [sig('Narrative', 'do', 82)] },
    { label: 'Show them — demonstrate it, hands-on', s: [sig('Narrative', 'do', 55), sig('Kinesthetic', 'do', 50)] },
    { label: 'Walk it step by step, in order', s: [sig('Narrative', 'do', 60), sig('Analytical', 'do', 55)] },
    { label: 'Draw it out so they can see it', s: [sig('Narrative', 'do', 58), sig('Sketch/Viz', 'do', 55)] },
  ];
  return (
    <div>
      <Prompt eyebrow="O4" title="Explain one thing you know well to someone who doesn’t." sub="How would you actually get it across?" />
      <div className="space-y-2">{opts.map((o, i) => <Chip key={i} on={pick === i} onClick={() => setPick(i)}>{o.label}</Chip>)}</div>
      <NextButton busy={busy} disabled={pick === null} onClick={() => onSubmit({ signals: opts[pick!]!.s })} label="Save & continue" />
    </div>
  );
}

// ── O5 · Rescue vs Rebuild — three forks on a struggling project ──────────────
export function Rescue({ busy, onSubmit }: ArchetypeProps): JSX.Element {
  const [move, setMove] = useState<'Careful' | 'Bold' | null>(null);
  const [bones, setBones] = useState<'Persist' | 'Pivot' | null>(null);
  const [result, setResult] = useState<'Redefine' | 'Reinvent' | null>(null);
  const ready = move && bones && result;
  const submit = (): void => {
    const signals: Signal[] = [];
    if (move) signals.push(lean('Bold↔Careful', move, 'Bold', 55));
    if (bones) signals.push(lean('Persist↔Pivot', bones, 'Persist', 55));
    if (result) signals.push(lean('Reinvent↔Redefine', result, 'Reinvent', 55));
    onSubmit({ signals });
  };
  return (
    <div>
      <Prompt eyebrow="O5" title="A project is struggling. It’s yours to save." sub="Three calls — make each honestly." />
      <Step label="Your first move?" />
      <div className="grid grid-cols-2 gap-2">
        <Chip on={move === 'Careful'} onClick={() => setMove('Careful')}>Rescue — salvage what’s good</Chip>
        <Chip on={move === 'Bold'} onClick={() => setMove('Bold')}>Rebuild — tear it down</Chip>
      </div>
      <Step label="The bones of it?" />
      <div className="grid grid-cols-2 gap-2">
        <Chip on={bones === 'Persist'} onClick={() => setBones('Persist')}>Keep them, fix around them</Chip>
        <Chip on={bones === 'Pivot'} onClick={() => setBones('Pivot')}>Start the structure over</Chip>
      </div>
      <Step label="The result you’d aim for?" />
      <div className="grid grid-cols-2 gap-2">
        <Chip on={result === 'Redefine'} onClick={() => setResult('Redefine')}>A cleaner version of the same</Chip>
        <Chip on={result === 'Reinvent'} onClick={() => setResult('Reinvent')}>A genuine reinvention</Chip>
      </div>
      <NextButton busy={busy} disabled={!ready} onClick={submit} label="Save & continue" />
    </div>
  );
}
