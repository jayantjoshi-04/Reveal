import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { TopBar } from '../../components/TopBar.js';

export function ReviewGate(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ['review', id], queryFn: () => api.review(id!), enabled: !!id });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ generated: boolean; model: string } | null>(null);

  async function approve(): Promise<void> {
    if (!id) return;
    setBusy(true);
    try {
      const r = await api.approve(id);
      setDone(r);
    } finally {
      setBusy(false);
    }
  }

  if (isLoading || !data) return <div className="min-h-screen bg-canvas"><TopBar doc="Facilitator" /><p className="p-10 text-sm text-mid">Loading…</p></div>;

  const f = data.findings;
  return (
    <div className="min-h-screen bg-canvas">
      <TopBar doc="Facilitator" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <button className="mb-4 font-mono text-[11px] text-mid hover:text-orange" onClick={() => nav('/facilitator')}>
          ← Back to queue
        </button>
        <div className="eyebrow mb-2">Before you generate</div>
        <h1 className="mb-1 font-serif text-3xl">Check the high-stakes calls</h1>
        <p className="mb-6 text-sm text-mid">Everything below is computed by the engine. Approve to run the single synthesis pass and release the report.</p>

        <div className="space-y-2">
          {f.surprises.map((s) => (
            <Row key={s.trait} label="Surprise" badge={`${s.situations} of ${s.situations} situations`} tone="mag">
              {cap(s.trait)} — strong in behaviour, never claimed
            </Row>
          ))}
          {f.project_pattern.outlier ? (
            <Row label="Coherence" badge={`adjudicated: work`} tone="orange">
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

        {done ? (
          <div className="mt-6 rounded-xl border border-green bg-[#e6f2e7] p-4 text-sm text-[#245a2a]">
            {done.generated ? 'Report generated and released' : 'Report was already generated (cached)'} · model:{' '}
            <span className="font-mono text-xs">{done.model}</span>
            <div className="mt-3">
              <button className="btn" onClick={() => nav(`/report/${id}`)}>Open the report</button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex gap-3">
            <button className="btn" disabled={busy} onClick={approve}>
              {busy ? 'Generating…' : 'Approve & generate'}
            </button>
            <button className="btn-ghost" disabled={busy}>Edit</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  badge,
  tone,
  children,
}: {
  label: string;
  badge: string;
  tone: 'mag' | 'orange' | 'green' | 'steel';
  children: React.ReactNode;
}): JSX.Element {
  const badgeClass = {
    mag: 'bg-[#fbe6f1] text-mag',
    orange: 'bg-orange-bg text-orange',
    green: 'bg-[#e6f2e7] text-green',
    steel: 'bg-steel-bg text-steel',
  }[tone];
  return (
    <div className="flex items-center justify-between rounded-xl border border-rule bg-white px-4 py-3 text-sm">
      <span>
        <b>{label} ·</b> {children}
      </span>
      <span className={`chip ${badgeClass}`}>{badge}</span>
    </div>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
}
