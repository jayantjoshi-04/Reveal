import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CAPACITIES,
  CAPACITY_BY_TAG,
  CAPABILITIES,
  VALUES,
  THRIVE_CONDITIONS,
  WITHER_CONDITIONS,
  type Capacity,
} from '@reveal/shared';
import { api } from '../../../lib/api.js';
import type { ModuleProps } from '../types.js';
import { Prompt, PrimaryBtn, Option } from './ui.js';

interface AItem {
  item_id: string;
  seq: number;
  prompt: string;
  options: { option_id: string; label: string; tag: string }[];
}

/** A1 · Capacities — forced choice across items; score normalised by appearances. */
export function A1Module({ onSubmit, busy }: ModuleProps): JSX.Element {
  const { data: items } = useQuery({ queryKey: ['a-items'], queryFn: () => api.content<AItem[]>('a-items') });
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<{ prompt_id: string; chosen_capacity: Capacity; ms: number }[]>([]);
  const [startedAt] = useState(Date.now());

  if (!items || items.length === 0) return <p className="text-sm text-slate-500">Loading items…</p>;
  const item = items[idx]!;

  function choose(tag: string): void {
    const cap = CAPACITY_BY_TAG[tag];
    if (!cap) return;
    const next = [...picks, { prompt_id: item.item_id, chosen_capacity: cap, ms: Date.now() - startedAt }];
    setPicks(next);
    if (idx + 1 < items!.length) {
      setIdx(idx + 1);
    } else {
      // appearance-normalised score
      const appeared: Record<string, number> = {};
      for (const it of items!) for (const o of it.options) {
        const c = CAPACITY_BY_TAG[o.tag];
        if (c) appeared[c] = (appeared[c] ?? 0) + 1;
      }
      const chosen: Record<string, number> = {};
      for (const p of next) chosen[p.chosen_capacity] = (chosen[p.chosen_capacity] ?? 0) + 1;
      const score: Partial<Record<Capacity, number>> = {};
      for (const c of CAPACITIES) score[c] = appeared[c] ? (chosen[c] ?? 0) / appeared[c] : 0;
      onSubmit({ items: next, score }, Date.now() - startedAt);
    }
  }

  return (
    <>
      <div className="mb-1 font-mono text-[10px] text-slate-500">Item {idx + 1} of {items.length}</div>
      <Prompt>{item.prompt}</Prompt>
      <div className="mt-1">
        {item.options.map((o) => (
          <Option key={o.option_id} onClick={() => choose(o.tag)}>
            {o.label}
          </Option>
        ))}
      </div>
    </>
  );
}

/** A3 · Values — reorder the 12 into true order; protect one, drop two. */
export function A3Module({ onSubmit, busy }: ModuleProps): JSX.Element {
  const [order, setOrder] = useState<string[]>([...VALUES]);
  const move = (i: number, d: -1 | 1): void => {
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j]!, next[i]!];
    setOrder(next);
  };
  return (
    <>
      <Prompt>Drag these into your true order.</Prompt>
      <p className="mb-3 text-[11px] text-slate-500">You've already shown us under pressure — this can't be walked back.</p>
      <div className="mb-3 max-h-64 space-y-1 overflow-auto">
        {order.map((v, i) => (
          <div key={v} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-1.5 text-xs">
            <span>{i + 1}. {label(v)}</span>
            <span className="flex gap-1">
              <button className="text-slate-500 hover:text-accent" onClick={() => move(i, -1)}>↑</button>
              <button className="text-slate-500 hover:text-accent" onClick={() => move(i, 1)}>↓</button>
            </span>
          </div>
        ))}
      </div>
      <PrimaryBtn
        disabled={busy}
        onClick={() =>
          onSubmit({
            ranked: order,
            never_compromise: { value: order[0], why: 'it is the point of the work' },
            let_go: order.slice(-2),
          })
        }
      >
        Next
      </PrimaryBtn>
    </>
  );
}

/** A4 · Conditions — thrive / wither checklists. */
export function A4Module({ onSubmit, busy }: ModuleProps): JSX.Element {
  const [thrive, setThrive] = useState<string[]>([]);
  const [wither, setWither] = useState<string[]>([]);
  const toggle = (list: string[], set: (v: string[]) => void, v: string): void =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  return (
    <>
      <Prompt>Tick what's true — be honest, not aspirational.</Prompt>
      <div className="mb-2 font-mono text-[10px] uppercase text-emerald-600">You thrive when…</div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {THRIVE_CONDITIONS.map((c) => (
          <Toggle key={c} on={thrive.includes(c)} onClick={() => toggle(thrive, setThrive, c)}>
            {human(c)}
          </Toggle>
        ))}
      </div>
      <div className="mb-2 font-mono text-[10px] uppercase text-slate-500">You wither when…</div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {WITHER_CONDITIONS.map((c) => (
          <Toggle key={c} on={wither.includes(c)} onClick={() => toggle(wither, setWither, c)}>
            {human(c)}
          </Toggle>
        ))}
      </div>
      <PrimaryBtn disabled={busy || thrive.length === 0} onClick={() => onSubmit({ thrive, wither })}>
        Next
      </PrimaryBtn>
    </>
  );
}

/** A6 · Obsessions — pick recurring topics. */
export function A6Module({ onSubmit, busy }: ModuleProps): JSX.Element {
  const topics = ['cities', 'education', 'children', 'health', 'mental health', 'sustainability', 'community', 'culture', 'history', 'craft', 'justice', 'disability & access', 'rural life', 'the informal economy'];
  const [picked, setPicked] = useState<string[]>([]);
  return (
    <>
      <Prompt>What do you keep coming back to — that nobody assigned you?</Prompt>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {topics.map((t) => (
          <Toggle key={t} on={picked.includes(t)} onClick={() => setPicked(picked.includes(t) ? picked.filter((x) => x !== t) : [...picked, t])}>
            {t}
          </Toggle>
        ))}
      </div>
      <PrimaryBtn disabled={busy} onClick={() => onSubmit({ topics: picked, admired: [] })}>
        Next
      </PrimaryBtn>
    </>
  );
}

/** A7 · Aspiration — desired capability levels + market belief. */
export function A7Module({ onSubmit, busy }: ModuleProps): JSX.Element {
  const [levels, setLevels] = useState<Record<string, number>>(() =>
    Object.fromEntries(CAPABILITIES.map((c) => [c, 0.4])),
  );
  const [stance, setStance] = useState<'aligned' | 'slightly_apart' | 'opposed'>('slightly_apart');
  return (
    <>
      <Prompt>Where do you want to be strong?</Prompt>
      <div className="mb-3 max-h-52 space-y-2 overflow-auto pr-1">
        {CAPABILITIES.map((c) => (
          <div key={c}>
            <div className="mb-0.5 flex justify-between text-[10px] text-slate-500">
              <span>{label(c)}</span>
              <span className="font-mono">{Math.round(levels[c]! * 100)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(levels[c]! * 100)}
              onChange={(e) => setLevels({ ...levels, [c]: Number(e.target.value) / 100 })}
              className="w-full accent-accent"
            />
          </div>
        ))}
      </div>
      <div className="mb-3 text-[11px] text-slate-500">What interests you vs. what pays best:</div>
      <div className="mb-4 flex flex-col gap-1">
        {(['aligned', 'slightly_apart', 'opposed'] as const).map((s) => (
          <Option key={s} selected={stance === s} onClick={() => setStance(s)}>
            {s === 'aligned' ? 'the same' : s === 'slightly_apart' ? 'a little apart' : 'opposite directions'}
          </Option>
        ))}
      </div>
      <PrimaryBtn
        disabled={busy}
        onClick={() =>
          onSubmit({
            desired_levels: levels,
            desired_skills_ranked: Object.entries(levels)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([k]) => k),
            perceived_market_rank: [{ field: 'UI/UX', rank: 1 }, { field: 'social-impact', rank: 9 }],
            direction_market_stance: stance,
          })
        }
      >
        Next
      </PrimaryBtn>
    </>
  );
}

// ── small local helpers ──────────────────────────────────────────────────────
function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 text-[10px] ${on ? 'border-accent bg-accent-soft text-accent-dark' : 'border-slate-200 text-slate-600'}`}
    >
      {children}
    </button>
  );
}
function label(code: string): string {
  return code.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}
function human(code: string): string {
  return code.replace(/_/g, ' ');
}
