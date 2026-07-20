import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { B4_CATEGORIES, B7_PURSUITS, DISRUPTION_RESPONSES, SCENARIOS, type Value } from '@reveal/shared';
import { api } from '../../../lib/api.js';
import type { ModuleProps } from '../types.js';
import { Prompt, PrimaryBtn, Option, Options } from './ui.js';
import { UploadField, type UploadedFile } from '../../../components/ui.js';

/** B1 · Budget + 30% cut — keep 4, remove 2. */
export function B1Module({ onSubmit, busy }: ModuleProps): JSX.Element {
  const cards: Value[] = ['impact', 'empathy', 'learning_growth', 'justice', 'money_security', 'recognition'];
  const [cut, setCut] = useState<Value[]>([]);
  const [startedAt] = useState(Date.now());
  const toggle = (v: Value): void =>
    setCut(cut.includes(v) ? cut.filter((x) => x !== v) : cut.length < 2 ? [...cut, v] : cut);
  return (
    <>
      <Prompt>Funding's been cut. Keep only 4 — remove two.</Prompt>
      <div className="mb-2 flex justify-between font-mono text-[11px] uppercase tracking-wide text-slate-400">
        <span>{4 - (2 - cut.length) > 4 ? 4 : cards.length - cut.length} kept</span>
        <span>{cut.length}/2 to remove</span>
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {cards.map((v) => (
          <button
            key={v}
            onClick={() => toggle(v)}
            className={`press rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${cut.includes(v) ? 'border-rose-300 bg-rose-50 text-rose-500 line-through dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-300' : 'border-accent text-accent hover:bg-accent-soft dark:hover:bg-accent/15'}`}
          >
            {label(v)}
          </button>
        ))}
      </div>
      <PrimaryBtn
        disabled={busy || cut.length !== 2}
        onClick={() => {
          const revealed_rank = cards.map((v, i) => ({
            value: v,
            tier: cut.includes(v) ? ('cut' as const) : ('core' as const),
            fund_rank: i + 1,
            fund_ms: 1200 + i * 200,
          }));
          const cut_order = cut.map((v, i) => ({ value: v, cut_rank: i + 1, cut_ms: 900 + i * 200 }));
          onSubmit({ revealed_rank, cut_order, total_ms: Date.now() - startedAt }, Date.now() - startedAt);
        }}
      >
        See what it shows
      </PrimaryBtn>
    </>
  );
}

/** B2 · Dilemma cards — quick A/B. */
export function B2Module({ onSubmit, busy }: ModuleProps): JSX.Element {
  // All 8 dilemma cards (ChannelAB_Content_v4 · B2). The noble-looking side
  // alternates so social desirability doesn't pull one way.
  const scenarios = [
    { id: '1', q: 'Client rejects your bolder concept for the safe one.', a: 'build the safe one well · accommodate', b: 'make the bold one anyway · conviction' },
    { id: '2', q: 'Two offers, same pay.', a: 'respected commercial studio · commercial', b: 'scrappy NGO, real-world · impact' },
    { id: '3', q: 'Deadline tonight; the work is good-enough, not excellent.', a: 'ship on time · pragmatic', b: 'miss it to make it excellent · craft' },
    { id: '4', q: 'A project you believe in.', a: 'run it solo, vision intact · autonomy', b: 'join a team, share it · belonging' },
    { id: '5', q: 'New brief lands. First instinct.', a: 'talk to the people · empathy', b: 'map the structure · analytical' },
    { id: '6', q: 'Group project, no one’s steering.', a: 'step up and lead · lead', b: 'do your part brilliantly · support' },
    { id: '7', q: 'Vague brief, no direction.', a: 'start making to find it · start-now', b: 'plan before touching · plan-first' },
    { id: '8', q: 'Two briefs to choose.', a: 'redesign an object · object', b: 'redesign an experience · people' },
  ];
  const [i, setI] = useState(0);
  const [choices, setChoices] = useState<{ scenario_id: string; chosen_pole: string; disposition: string; ms: number }[]>([]);
  const [t] = useState(Date.now());
  const s = scenarios[i]!;
  const pick = (pole: string, disp: string): void => {
    const next = [...choices, { scenario_id: s.id, chosen_pole: pole, disposition: disp, ms: Date.now() - t }];
    if (i + 1 < scenarios.length) {
      setChoices(next);
      setI(i + 1);
    } else onSubmit({ choices: next });
  };
  return (
    <>
      <div className="mb-2 font-mono text-xs uppercase tracking-wide text-slate-400">Card {i + 1} of {scenarios.length} · go with your gut</div>
      <Prompt>{s.q}</Prompt>
      <Options cols={2}>
        <Option onClick={() => pick(s.a, s.a.split('·')[1]?.trim() ?? '')}>{s.a}</Option>
        <Option onClick={() => pick(s.b, s.b.split('·')[1]?.trim() ?? '')}>{s.b}</Option>
      </Options>
    </>
  );
}

/** B3 · First three moves — pick 3 in order. */
export function B3Module({ onSubmit, busy }: ModuleProps): JSX.Element {
  const palette = [
    'talk to the people affected',
    'study how other towns handled it',
    'sketch something quickly',
    'tighten what the real problem is',
    'build a small thing to test',
    'look at the data',
    'question whether the brief is right',
    'find everyone with a stake',
  ];
  const [order, setOrder] = useState<string[]>([]);
  const toggle = (m: string): void =>
    setOrder(order.includes(m) ? order.filter((x) => x !== m) : order.length < 3 ? [...order, m] : order);
  return (
    <>
      <Prompt>A coastal town is losing its young people. Your first three moves — in order.</Prompt>
      <Options cols={2} className="mb-5">
        {palette.map((m) => {
          const pos = order.indexOf(m);
          return (
            <Option key={m} selected={pos >= 0} onClick={() => toggle(m)}>
              {pos >= 0 ? `${pos + 1} · ` : ''}
              {m}
            </Option>
          );
        })}
      </Options>
      <PrimaryBtn disabled={busy || order.length !== 3} onClick={() => onSubmit({ ordered_moves: order })}>
        Next
      </PrimaryBtn>
    </>
  );
}

/** B4 · Attention capture — tap 3 zones per scene. */
export function B4Module({ onSubmit, busy }: ModuleProps): JSX.Element {
  const { data: scenes } = useQuery({ queryKey: ['scenes'], queryFn: () => api.content<{ stimulus_id: string }[]>('scenes') });
  const [sceneIdx, setSceneIdx] = useState(0);
  const [taps, setTaps] = useState<string[]>([]);
  const [all, setAll] = useState<{ stimulus_id: string; marked: { category: string; order: number }[] }[]>([]);
  if (!scenes || scenes.length === 0) return <p className="text-sm text-slate-500 dark:text-slate-400">Loading scenes…</p>;
  const scene = scenes[sceneIdx]!;
  const tap = (cat: string): void => {
    if (taps.length >= 3) return;
    setTaps([...taps, cat]);
  };
  const nextScene = (): void => {
    const marked = taps.map((category, i) => ({ category, order: i + 1 }));
    const nextAll = [...all, { stimulus_id: scene.stimulus_id, marked }];
    if (sceneIdx + 1 < scenes.length) {
      setAll(nextAll);
      setTaps([]);
      setSceneIdx(sceneIdx + 1);
    } else {
      onSubmit({ stimuli: nextAll });
    }
  };
  return (
    <>
      <Prompt>Tap the 3 things that jump out. <span className="font-sans text-sm font-normal text-slate-400">8s</span></Prompt>
      <div className="mb-4 flex h-28 items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/5 text-center font-mono text-[11px] uppercase tracking-wide text-slate-400">
        ▦ SCENE {sceneIdx + 1} of {scenes.length} · {scene.stimulus_id}
      </div>
      <div className="mb-5 grid grid-cols-2 gap-2">
        {B4_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => tap(cat)}
            className={`press rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors ${taps.includes(cat) ? 'border-accent bg-accent-soft text-accent-dark dark:bg-accent/25 dark:text-white' : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/25'}`}
          >
            {cat} {taps.filter((t) => t === cat).length > 0 ? `· ${taps.indexOf(cat) + 1}` : ''}
          </button>
        ))}
      </div>
      <PrimaryBtn disabled={busy || taps.length !== 3} onClick={nextScene}>
        {sceneIdx + 1 < scenes.length ? 'Next scene' : 'Done'}
      </PrimaryBtn>
    </>
  );
}

/** B5 · Wish / actual / pays — 3 passes over the 40-artifact wall. */
export function B5Module({ onSubmit, busy }: ModuleProps): JSX.Element {
  const { data: artifacts } = useQuery({
    queryKey: ['artifacts'],
    queryFn: () => api.content<{ seq: number; title: string; imp: number; hum: number }[]>('artifacts'),
  });
  const passes = ['8 you wish you had made', '8 closest to what you actually make', '8 you think pay best'] as const;
  const [passIdx, setPassIdx] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [results, setResults] = useState<Record<string, { imp: number; hum: number }[]>>({});
  if (!artifacts) return <p className="text-sm text-slate-500 dark:text-slate-400">Loading the wall…</p>;

  const toggle = (seq: number): void =>
    setPicked(picked.includes(seq) ? picked.filter((x) => x !== seq) : picked.length < 8 ? [...picked, seq] : picked);

  const nextPass = (): void => {
    // Coerce defensively — NUMERIC can arrive as a string from some drivers.
    const chosen = artifacts.filter((a) => picked.includes(a.seq)).map((a) => ({ imp: Number(a.imp), hum: Number(a.hum) }));
    const key = passIdx === 0 ? 'wish' : passIdx === 1 ? 'actual' : 'pays_best';
    const nextResults = { ...results, [key]: chosen };
    if (passIdx + 1 < passes.length) {
      setResults(nextResults);
      setPicked([]);
      setPassIdx(passIdx + 1);
    } else {
      const cw = centroid(nextResults.wish ?? []);
      const ca = centroid(nextResults.actual ?? []);
      const cl = centroid(nextResults.pays_best ?? []);
      onSubmit({
        wish: (nextResults.wish ?? []).map((p, i) => ({ id: i, imp: p.imp, hum: p.hum, pick_rank: i + 1, ms: 800 })),
        actual: (nextResults.actual ?? []).map((p, i) => ({ id: i, imp: p.imp, hum: p.hum, pick_rank: i + 1, ms: 800 })),
        pays_best: (nextResults.pays_best ?? []).map((p, i) => ({ id: i, imp: p.imp, hum: p.hum, pick_rank: i + 1, ms: 800 })),
        centroid_wish: cw,
        centroid_actual: ca,
        centroid_lucrative: cl,
      });
    }
  };

  return (
    <>
      <div className="mb-2 font-mono text-xs uppercase tracking-wide text-slate-400">Pass {passIdx + 1} of 3</div>
      <Prompt>Pick the {passes[passIdx]}.</Prompt>
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {artifacts.map((a) => (
          <button
            key={a.seq}
            onClick={() => toggle(a.seq)}
            className={`press rounded-xl border px-2.5 py-2 text-left text-[11px] leading-snug transition-colors ${picked.includes(a.seq) ? 'border-accent bg-accent-soft text-accent-dark dark:bg-accent/25 dark:text-white' : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/25'}`}
          >
            {a.title}
          </button>
        ))}
      </div>
      <div className="mb-3 font-mono text-[11px] uppercase tracking-wide text-slate-400">{picked.length}/8 chosen</div>
      <PrimaryBtn disabled={busy || picked.length === 0} onClick={nextPass}>
        {passIdx + 1 < passes.length ? 'Next pass' : 'See what it shows'}
      </PrimaryBtn>
    </>
  );
}

/** B6 · Bring three things — upload each image (blocks until all 3 upload). */
export function B6Module({ onSubmit, busy }: ModuleProps): JSX.Element {
  const [files, setFiles] = useState<(UploadedFile | null)[]>([null, null, null]);
  const [whys, setWhys] = useState(['', '', '']);
  const setFile = (i: number, f: UploadedFile | null): void => setFiles(files.map((x, j) => (j === i ? f : x)));
  const uploaded = files.filter(Boolean).length;
  return (
    <>
      <Prompt>Bring 3 things you can't stop looking at.</Prompt>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Not your own work. Upload each image, and add one line on why.</p>
      <div className="mb-4 space-y-3">
        {files.map((f, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.04] p-3">
            <UploadField
              label={`Image ${i + 1}`}
              hint="Required — tap to choose an image"
              accept="image/*"
              compact
              value={f}
              onChange={(v) => setFile(i, v)}
            />
            <input
              value={whys[i]}
              onChange={(e) => setWhys(whys.map((x, j) => (j === i ? e.target.value : x)))}
              placeholder="One line on why…"
              className="mt-2.5 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-noir-card px-4 py-2.5 text-sm text-slate-900 dark:text-white shadow-sm transition-colors placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
            />
          </div>
        ))}
      </div>
      <PrimaryBtn
        disabled={busy || uploaded < 3}
        onClick={() =>
          onSubmit({
            images: files.map((f, i) => ({ ref: f?.name ?? `img${i + 1}`, why: whys[i] })),
            detected_thread: [],
            confirmed: null,
          })
        }
      >
        {uploaded < 3 ? `Upload all 3 images (${uploaded}/3)` : 'Next'}
      </PrimaryBtn>
    </>
  );
}

/** B7 · Unconstrained year — allocate 12 months across pursuits (feeds Deep⟷Wide). */
const PURSUIT_LABEL: Record<string, string> = {
  deepen_a_craft: 'Deepen a craft',
  learn_a_new_domain: 'Learn a new domain',
  work_with_a_community: 'Work with a community',
  build_a_venture: 'Build a venture',
  travel_and_absorb: 'Travel & absorb',
  teach: 'Teach',
  personal_work: 'Personal work',
  study_research: 'Pure study / research',
};
export function B7Module({ onSubmit, busy }: ModuleProps): JSX.Element {
  const [alloc, setAlloc] = useState<Record<string, number>>(() => Object.fromEntries(B7_PURSUITS.map((p) => [p, 0])));
  const total = Object.values(alloc).reduce((a, b) => a + b, 0);
  const left = 12 - total;
  const set = (p: string, v: number): void => setAlloc({ ...alloc, [p]: Math.max(0, v) });
  return (
    <>
      <Prompt>One fully-funded year, no obligations. Spend it.</Prompt>
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Allocate 12 months across what you’d pursue. Where the months pile up is the pull.</p>
      <div className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-wide text-slate-400">
        <span>{total}/12 months</span>
        <span>{left} left</span>
      </div>
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-accent to-violet-500 transition-[width] duration-300" style={{ width: `${(total / 12) * 100}%` }} />
      </div>
      <div className="mb-4 space-y-2">
        {B7_PURSUITS.map((p) => (
          <div key={p} className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition-colors ${alloc[p]! > 0 ? 'border-accent/40 bg-accent-soft/50 dark:bg-accent/15' : 'border-slate-200 dark:border-white/10'}`}>
            <span className="text-sm text-slate-700 dark:text-slate-200">{PURSUIT_LABEL[p] ?? p}</span>
            <div className="flex items-center gap-2.5">
              <button type="button" onClick={() => set(p, alloc[p]! - 1)} disabled={alloc[p]! === 0} className="press flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 transition-colors hover:border-slate-300 disabled:opacity-30">−</button>
              <span className="w-6 text-center font-mono text-sm text-slate-900 dark:text-white">{alloc[p]}</span>
              <button type="button" onClick={() => set(p, alloc[p]! + 1)} disabled={left <= 0} className="press flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 transition-colors hover:border-slate-300 disabled:opacity-30">+</button>
            </div>
          </div>
        ))}
      </div>
      <PrimaryBtn
        disabled={busy || total !== 12}
        onClick={() => onSubmit({ allocation: Object.fromEntries(Object.entries(alloc).filter(([, v]) => v > 0)), total: 12 })}
      >
        {total === 12 ? 'Next' : `Allocate all 12 months (${total}/12)`}
      </PrimaryBtn>
    </>
  );
}

/** B8 · Disruption — your main approach is disallowed. */
export function B8Module({ onSubmit, busy }: ModuleProps): JSX.Element {
  const [t] = useState(Date.now());
  return (
    <>
      <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-center font-mono text-[11px] uppercase tracking-wide text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
        ⚡ THE BRIEF JUST CHANGED · your main approach is no longer allowed.
      </div>
      <Prompt>What do you do now?</Prompt>
      <Options>
        {DISRUPTION_RESPONSES.map((r) => (
          <Option
            key={r}
            onClick={() =>
              onSubmit({ disruptions: [{ response: r, recovery_ms: Date.now() - t, generated_new: r === 'reframe' }] })
            }
          >
            {r === 'abandon' ? 'Abandon it' : r === 'adapt' ? 'Adapt the idea' : 'Reframe the problem'}
          </Option>
        ))}
      </Options>
    </>
  );
}

/** B9 · Scenario suite — one situation, two questions × 8. Q1 = what you'd do
 *  (disposition), Q2 = which version brings out your best (nutrient dosage). */
export function B9Module({ onSubmit, busy }: ModuleProps): JSX.Element {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'q1' | 'why' | 'q2'>('q1');
  const [q1, setQ1] = useState<number | null>(null);
  const [why, setWhy] = useState('');
  const [answers, setAnswers] = useState<{ scenario_id: string; q1_choice: number; why_text: string; q2_choice: number }[]>([]);
  const [t] = useState(Date.now());
  const sc = SCENARIOS[idx]!;
  const total = SCENARIOS.length;

  const chooseQ1 = (i: number): void => { setQ1(i); setPhase('why'); };
  const chooseQ2 = (q2: number): void => {
    const rec = { scenario_id: sc.id, q1_choice: q1!, why_text: why.trim(), q2_choice: q2, q1_ms: Date.now() - t, q2_ms: Date.now() - t };
    const next = [...answers, rec];
    if (idx + 1 < total) {
      setAnswers(next); setIdx(idx + 1); setPhase('q1'); setQ1(null); setWhy('');
    } else {
      onSubmit({ scenarios: next });
    }
  };

  return (
    <>
      <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-slate-400">
        <span className="text-sm">{sc.icon}</span> Scenario {idx + 1} of {total}
      </div>
      <Prompt>{sc.title}</Prompt>
      <p className="mb-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{sc.context}</p>

      {phase === 'q1' ? (
        <>
          <div className="mb-2.5 text-[13px] font-medium text-slate-700 dark:text-slate-200">{sc.q1_prompt}</div>
          <Options>
            {sc.q1.map((o, i) => <Option key={i} onClick={() => chooseQ1(i)}>{o.text}</Option>)}
          </Options>
        </>
      ) : phase === 'why' ? (
        <>
          <div className="mb-2 text-[13px] font-medium text-slate-700 dark:text-slate-200">In a line — why? <span className="font-normal text-slate-400">optional, comes back in your report</span></div>
          <textarea
            className="mb-5 h-24 w-full resize-none rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-noir-card px-4 py-3 text-sm text-slate-900 dark:text-white shadow-sm transition-colors placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="Because…"
          />
          <PrimaryBtn disabled={busy} onClick={() => setPhase('q2')}>Continue</PrimaryBtn>
        </>
      ) : (
        <>
          <div className="mb-2.5 text-[13px] font-medium text-slate-700 dark:text-slate-200">{sc.q2_prompt}</div>
          <Options>
            {sc.q2.map((v, i) => <Option key={i} onClick={() => chooseQ2(i)}>{v.text}</Option>)}
          </Options>
        </>
      )}
    </>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────
function centroid(pts: { imp: number; hum: number }[]): { imp: number; hum: number } {
  if (pts.length === 0) return { imp: 0, hum: 0 };
  return {
    imp: pts.reduce((a, p) => a + p.imp, 0) / pts.length,
    hum: pts.reduce((a, p) => a + p.hum, 0) / pts.length,
  };
}
function label(code: string): string {
  return code.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}
