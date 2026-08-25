/**
 * Behavioural archetypes — the 14 activities read from what the student does,
 * not from authored options. Each is a focused interaction that emits the
 * engine `signals` its derivation rules call for. (These are compact,
 * honest interactions rather than the full instrumented tasks in the spec.)
 */
import { useState } from 'react';
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
  const budget = squeeze ? 10 : 20;
  const [alloc, setAlloc] = useState<number[]>(A1_MOVES.map(() => 0));
  const [cut, setCut] = useState(false);
  const spent = alloc.reduce((a, b) => a + b, 0);
  const left = budget - spent;
  const set = (i: number, d: number): void => setAlloc((a) => { const n = [...a]; n[i] = Math.max(0, n[i]! + d); if (d > 0 && left <= 0) n[i] = a[i]!; return n; });

  const submit = (): void => {
    const total = spent || 1;
    const signals: Signal[] = A1_MOVES.map((m, i) => {
      const share = (alloc[i]! / total) * 100;
      return m.edge ? sig(m.cid, 'do', share, { edge: m.edge, position: -share }) : sig(m.cid, 'do', clamp(share * 1.6));
    });
    // what you protected most reads as Conviction (a held priority)
    const top = alloc.indexOf(Math.max(...alloc));
    signals.push(sig('Conviction', 'do', clamp(60 + (alloc[top]! / total) * 60)));
    onSubmit({ signals });
  };

  return (
    <div>
      <Prompt eyebrow={activity.code} title={squeeze ? 'A tight brief — spend your moves.' : 'You’ve got a new brief. Spend your moves.'} sub={`Distribute ${budget} moves across what you’d actually do. ${cut ? 'A constraint just hit — you have less to spend. What do you keep?' : ''}`} />
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
      <div className="mt-3 text-center font-mono text-[11px] text-slate-400">{left} moves left</div>
      {!cut ? (
        <NextButton busy={busy} disabled={spent === 0} onClick={() => { setCut(true); setAlloc((a) => a.map((x) => Math.min(x, Math.ceil(x / 2)))); }} label="Lock it in" />
      ) : (
        <NextButton busy={busy} disabled={spent === 0} onClick={submit} label="Save & continue" />
      )}
    </div>
  );
}

// ── A2 · Taste duel — quick which-is-stronger ──────────────────────────────
const DUELS = [
  ['A tight, restrained layout', 'A loud, maximal layout', 0],
  ['Muted, considered colour', 'Bright, high-contrast colour', 0],
  ['One bold idea, clearly told', 'Many ideas at once', 0],
  ['Refined, resolved detail', 'Rough, energetic detail', 0],
  ['Calm, generous spacing', 'Dense, packed spacing', 0],
  ['A quiet, confident type choice', 'A decorative, ornate type choice', 0],
] as const;
export function Duel({ activity, busy, onSubmit }: ArchetypeProps): JSX.Element {
  const [picks, setPicks] = useState<(0 | 1 | null)[]>(DUELS.map(() => null));
  const done = picks.every((p) => p !== null);
  const submit = (): void => {
    const resolvedCount = picks.filter((p) => p === 0).length; // left = the more resolved eye
    const aesthetic = clamp((resolvedCount / DUELS.length) * 100);
    const consistency = Math.abs(resolvedCount - DUELS.length / 2) / (DUELS.length / 2); // 0..1
    const deep = clamp(consistency * 100); // consistent lane → Deep
    onSubmit({ signals: [sig('Aesthetic', 'do', aesthetic), sig('Deep↔Broad', 'do', -deep, { edge: 'Deep', position: -deep })] });
  };
  return (
    <div>
      <Prompt eyebrow="A2" title="Which is stronger?" sub="Trust your gut — pick the one that reads as the better piece." />
      <div className="space-y-3">
        {DUELS.map((d, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            {[0, 1].map((side) => (
              <Chip key={side} on={picks[i] === side} onClick={() => setPicks((p) => { const n = [...p]; n[i] = side as 0 | 1; return n; })}>{d[side]}</Chip>
            ))}
          </div>
        ))}
      </div>
      <NextButton busy={busy} disabled={!done} onClick={submit} label="Save & continue" />
    </div>
  );
}

// ── A9 / GF1 · Arrange & make — spatial / tactile beat ─────────────────────
export function Arrange({ activity, busy, onSubmit }: ArchetypeProps): JSX.Element {
  const gf = activity.code === 'GF1';
  const opts = gf
    ? [
        { label: 'Dive in hands-first and see what happens', s: [sig('Kinesthetic', 'do', 78), sig('Experiment↔Study', 'do', -55, { edge: 'Experiment', position: -55 }), sig('Hands↔Visual', 'do', -50, { edge: 'Hands', position: -50 })] },
        { label: 'Handle it carefully, plan the moves', s: [sig('Kinesthetic', 'do', 45), sig('Experiment↔Study', 'do', 45, { edge: 'Study', position: 45 }), sig('Hands↔Visual', 'do', 40, { edge: 'Visual', position: 40 })] },
      ]
    : [
        { label: 'Arrange by function — what goes with what', s: [sig('Analytical', 'do', 72), sig('Systems', 'do', 60), sig('Spatial', 'do', 62)] },
        { label: 'Arrange by flow — how you’d move through it', s: [sig('Systems', 'do', 74), sig('Spatial', 'do', 70), sig('Empathy', 'do', 55)] },
        { label: 'Arrange by feel — what looks right', s: [sig('Aesthetic', 'do', 74), sig('Spatial', 'do', 58), sig('Analytical', 'do', 40)] },
      ];
  const [pick, setPick] = useState<number | null>(null);
  return (
    <div>
      <Prompt eyebrow={activity.code} title={gf ? 'Thirty seconds. Make something from these parts.' : 'Lay out this space so it works.'} sub={gf ? 'How do you go about it?' : 'What’s your instinct for arranging it?'} />
      <div className="space-y-2">
        {opts.map((o, i) => <Chip key={i} on={pick === i} onClick={() => setPick(i)}>{o.label}</Chip>)}
      </div>
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
