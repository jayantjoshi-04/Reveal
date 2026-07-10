import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { B4_CATEGORIES, DISRUPTION_RESPONSES, type Value } from '@reveal/shared';
import { api } from '../../../lib/api.js';
import type { ModuleProps } from '../types.js';
import { Prompt, PrimaryBtn, Option } from './ui.js';

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
      <div className="mb-1 flex justify-between font-mono text-[9px] text-slate-500">
        <span>{4 - (2 - cut.length) > 4 ? 4 : cards.length - cut.length} kept</span>
        <span>{cut.length}/2 to remove</span>
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {cards.map((v) => (
          <button
            key={v}
            onClick={() => toggle(v)}
            className={`rounded-full border px-2.5 py-1 text-[10px] ${cut.includes(v) ? 'border-rose-300 text-rose-500 line-through' : 'border-accent text-accent'}`}
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
  const scenarios = [
    { id: '1', q: 'Client rejects your bolder concept.', a: 'build the safe one · accommodate', b: 'make the bold one · conviction' },
    { id: '2', q: 'Two offers, same pay.', a: 'respected commercial studio · commercial', b: 'scrappy NGO, real-world · impact' },
    { id: '5', q: 'New brief lands. First instinct.', a: 'talk to the people · empathy', b: 'map the structure · analytical' },
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
      <div className="mb-1 text-[11px] text-slate-500">Card {i + 1} of {scenarios.length} · go with your gut</div>
      <Prompt>{s.q}</Prompt>
      <Option onClick={() => pick(s.a, s.a.split('·')[1]?.trim() ?? '')}>{s.a}</Option>
      <Option onClick={() => pick(s.b, s.b.split('·')[1]?.trim() ?? '')}>{s.b}</Option>
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
      <div className="mb-4">
        {palette.map((m) => {
          const pos = order.indexOf(m);
          return (
            <Option key={m} selected={pos >= 0} onClick={() => toggle(m)}>
              {pos >= 0 ? `${pos + 1} · ` : ''}
              {m}
            </Option>
          );
        })}
      </div>
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
  if (!scenes || scenes.length === 0) return <p className="text-sm text-slate-500">Loading scenes…</p>;
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
      <Prompt>Tap the 3 things that jump out. <span className="font-normal text-slate-500">8s</span></Prompt>
      <div className="mb-3 flex h-24 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center font-mono text-[10px] uppercase tracking-wide text-slate-400">
        ▦ SCENE {sceneIdx + 1} of {scenes.length} · {scene.stimulus_id}
      </div>
      <div className="mb-4 grid grid-cols-2 gap-1.5">
        {B4_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => tap(cat)}
            className={`rounded-lg border px-2 py-2 text-[10px] ${taps.includes(cat) ? 'border-accent bg-accent-soft text-accent-dark' : 'border-slate-200'}`}
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
  if (!artifacts) return <p className="text-sm text-slate-500">Loading the wall…</p>;

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
      <div className="mb-1 font-mono text-[10px] text-slate-500">Pass {passIdx + 1} of 3</div>
      <Prompt>Pick the {passes[passIdx]}.</Prompt>
      <div className="mb-3 grid max-h-56 grid-cols-2 gap-1.5 overflow-auto pr-1">
        {artifacts.map((a) => (
          <button
            key={a.seq}
            onClick={() => toggle(a.seq)}
            className={`rounded-lg border px-2 py-1.5 text-left text-[9.5px] leading-tight ${picked.includes(a.seq) ? 'border-accent bg-accent-soft text-accent-dark' : 'border-slate-200 text-slate-600'}`}
          >
            {a.title}
          </button>
        ))}
      </div>
      <div className="mb-2 font-mono text-[9px] text-slate-500">{picked.length}/8 chosen</div>
      <PrimaryBtn disabled={busy || picked.length === 0} onClick={nextPass}>
        {passIdx + 1 < passes.length ? 'Next pass' : 'See what it shows'}
      </PrimaryBtn>
    </>
  );
}

/** B6 · Bring three things. */
export function B6Module({ onSubmit, busy }: ModuleProps): JSX.Element {
  const [whys, setWhys] = useState(['', '', '']);
  return (
    <>
      <Prompt>Bring 3 things you can't stop looking at.</Prompt>
      <p className="mb-3 text-[11px] text-slate-500">Not your own work. One line on why, each.</p>
      {whys.map((w, i) => (
        <input
          key={i}
          value={w}
          onChange={(e) => setWhys(whys.map((x, j) => (j === i ? e.target.value : x)))}
          placeholder={`Image ${i + 1} · why`}
          className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
        />
      ))}
      <PrimaryBtn
        disabled={busy || whys.filter(Boolean).length < 3}
        onClick={() =>
          onSubmit({ images: whys.map((why, i) => ({ ref: `img${i + 1}`, why })), detected_thread: [], confirmed: null })
        }
      >
        Next
      </PrimaryBtn>
    </>
  );
}

/** B8 · Disruption — your main approach is disallowed. */
export function B8Module({ onSubmit, busy }: ModuleProps): JSX.Element {
  const [t] = useState(Date.now());
  return (
    <>
      <div className="mb-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-center font-mono text-[10px] uppercase tracking-wide text-amber-700">
        ⚡ THE BRIEF JUST CHANGED · your main approach is no longer allowed.
      </div>
      <Prompt>What do you do now?</Prompt>
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
