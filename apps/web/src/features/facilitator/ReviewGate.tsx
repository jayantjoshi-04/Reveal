import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { REPORT_SLOTS, type ReportSlots } from '@reveal/shared';
import { api, ApiError, type ReviewDetail } from '../../lib/api.js';
import { TopBar } from '../../components/TopBar.js';

export function ReviewGate(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { data, isLoading, refetch } = useQuery({ queryKey: ['review', id], queryFn: () => api.review(id!), enabled: !!id });
  const [busy, setBusy] = useState(false);

  async function approve(): Promise<void> {
    if (!id) return;
    setBusy(true);
    try {
      await api.approve(id);
      await refetch(); // pull back the generated slots so they can be edited
    } finally {
      setBusy(false);
    }
  }

  if (isLoading || !data)
    return <div className="min-h-screen bg-canvas"><TopBar doc="Facilitator" /><p className="p-10 text-sm text-mid">Loading…</p></div>;

  const f = data.findings;
  const generated = !!data.slots;

  return (
    <div className="min-h-screen bg-canvas">
      <TopBar doc="Facilitator" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <button className="mb-4 font-mono text-[11px] text-mid hover:text-orange" onClick={() => nav('/facilitator')}>
          ← Back to queue
        </button>
        <div className="eyebrow mb-2">Before you generate</div>
        <h1 className="mb-1 font-serif text-3xl">Check the high-stakes calls</h1>
        <p className="mb-6 text-sm text-mid">
          Everything below is computed by the engine. Approve to run the single synthesis pass, then lightly edit the
          wording before release.
        </p>

        <div className="space-y-2">
          {f.surprises.map((s) => (
            <Row key={s.trait} label="Surprise" badge={`${s.situations} of ${s.situations} situations`} tone="mag">
              {cap(s.trait)} — strong in behaviour, never claimed
            </Row>
          ))}
          {f.project_pattern.outlier ? (
            <Row label="Coherence" badge="adjudicated: work" tone="orange">
              resume vs. work diverge — outlier {f.project_pattern.outlier}
            </Row>
          ) : null}
          {f.gap.filter((g) => g.classification === 'real').map((g) => (
            <Row key={g.capability} label="Gap" badge="Real" tone="green">
              {g.capability.replace(/_/g, ' ')} · {Math.round(g.current * 100)}→{Math.round(g.desired * 100)}
            </Row>
          ))}
          {f.market.classification !== 'aligned' ? (
            <Row label="Market" badge={f.market.classification.replace(/_/g, ' ')} tone="steel">
              pulls {f.market.wish_dir}, believes {f.market.pays_dir} pays — examine belief
            </Row>
          ) : null}
        </div>

        {generated ? (
          <SlotEditor id={id!} detail={data} onOpen={() => nav(`/report/${id}`)} />
        ) : (
          <div className="mt-6 flex gap-3">
            <button className="btn" disabled={busy} onClick={approve}>
              {busy ? 'Generating…' : 'Approve & generate'}
            </button>
            <button className="btn-ghost" disabled={busy} onClick={() => api.saveNote(id!, 'flagged for review').then(() => nav('/facilitator'))}>
              Flag
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Edit the generated wording — each slot held to its contract server-side. */
function SlotEditor({ id, detail, onOpen }: { id: string; detail: ReviewDetail; onOpen: () => void }): JSX.Element {
  const merged: Partial<ReportSlots> = { ...(detail.slots ?? {}), ...(detail.slot_edits ?? {}) };
  const base: Record<string, string> = {};
  for (const def of REPORT_SLOTS) base[def.id] = merged[def.id] ?? '';
  const [draft, setDraft] = useState<Record<string, string>>(base);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  function edit(slotId: string, value: string): void {
    setDraft({ ...draft, [slotId]: value });
    setDirty(new Set(dirty).add(slotId));
    setSaved(false);
  }

  async function save(): Promise<void> {
    if (dirty.size === 0) return onOpen();
    setBusy(true);
    setErrors([]);
    try {
      const changed = Object.fromEntries([...dirty].map((k) => [k, draft[k]!]));
      await api.saveSlots(id, changed);
      setSaved(true);
      setDirty(new Set());
    } catch (e) {
      if (e instanceof ApiError && e.issues) setErrors(e.issues);
      else setErrors([e instanceof ApiError ? e.message : 'Save failed']);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="mb-2 flex items-center gap-2">
        <span className="chip bg-[#e6f2e7] text-green">generated</span>
        <h2 className="font-serif text-xl">Report wording — edit before release</h2>
      </div>
      <p className="mb-4 text-[13px] text-mid">
        Edits are held to the same contract as the model (word ceilings, the surprise ends in a question, no comparison
        to others). Only edited slots are saved.
      </p>

      <div className="space-y-4">
        {REPORT_SLOTS.map((def) => {
          const val = draft[def.id] ?? '';
          const words = val.trim() ? val.trim().split(/\s+/).length : 0;
          const over = words > def.maxWords;
          return (
            <div key={def.id}>
              <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wide text-mid">
                <span>{def.id.replace(/_/g, ' ')}</span>
                <span className={over ? 'text-mag' : 'text-dim'}>
                  {words}/{def.maxWords} words{dirty.has(def.id) ? ' · edited' : ''}
                </span>
              </div>
              <textarea
                value={val}
                onChange={(e) => edit(def.id, e.target.value)}
                rows={def.maxWords > 60 ? 3 : 2}
                className={`w-full rounded-lg border px-3 py-2 text-[13px] ${over ? 'border-mag' : 'border-rule'}`}
              />
            </div>
          );
        })}
      </div>

      {errors.length > 0 ? (
        <ul className="mt-4 rounded-lg border border-mag bg-[#fbe6f1] p-3 text-[12px] text-mag">
          {errors.map((e, i) => <li key={i}>· {e}</li>)}
        </ul>
      ) : null}
      {saved ? <p className="mt-3 text-[13px] text-green">Edits saved — they now override the wording the student sees.</p> : null}

      <div className="mt-5 flex gap-3">
        <button className="btn" disabled={busy} onClick={save}>
          {busy ? 'Saving…' : dirty.size > 0 ? 'Save edits' : 'Done'}
        </button>
        <button className="btn-ghost" onClick={onOpen}>Open the report</button>
      </div>
    </div>
  );
}

function Row({ label, badge, tone, children }: { label: string; badge: string; tone: 'mag' | 'orange' | 'green' | 'steel'; children: React.ReactNode }): JSX.Element {
  const badgeClass = { mag: 'bg-[#fbe6f1] text-mag', orange: 'bg-orange-bg text-orange', green: 'bg-[#e6f2e7] text-green', steel: 'bg-steel-bg text-steel' }[tone];
  return (
    <div className="flex items-center justify-between rounded-xl border border-rule bg-white px-4 py-3 text-sm">
      <span><b>{label} ·</b> {children}</span>
      <span className={`chip ${badgeClass}`}>{badge}</span>
    </div>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
}
