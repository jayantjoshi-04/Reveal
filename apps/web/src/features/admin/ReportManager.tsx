import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { Card, Button, Skeleton, Badge } from '../../components/ui.js';
import { AdminPageHeader } from './AdminLayout.js';

const STATUS_TONE: Record<string, 'amber' | 'green' | 'slate'> = {
  capture_complete: 'amber',
  released: 'green',
  generated: 'green',
};

export function ReportManager(): JSX.Element {
  const { data: reports, isLoading } = useQuery({ queryKey: ['admin-reports'], queryFn: () => api.adminReports() });
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="animate-fade-in">
      <AdminPageHeader title="Reports" sub="Approve or reject each submission. Approval generates the report and releases it." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-2.5">
          {isLoading ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />)
          ) : reports && reports.length ? (
            reports.map((r) => (
              <button key={r.instance_id} onClick={() => setSelected(r.instance_id)} className="block w-full text-left">
                <Card className={`press flex items-center justify-between p-4 transition-all hover:shadow-lift ${selected === r.instance_id ? 'ring-2 ring-accent/30' : ''}`}>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{r.student_name}</div>
                    <div className="mt-0.5 text-xs text-slate-400">{r.cohort ? `cohort ${r.cohort} · ` : ''}{r.status.replace(/_/g, ' ')}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {r.surprise_count > 0 ? <Badge tone="accent">{r.surprise_count} ⚡</Badge> : null}
                    {r.coherence_flag ? <Badge tone="amber">coherence</Badge> : null}
                    <Badge tone={STATUS_TONE[r.status] ?? 'slate'}>{r.status === 'capture_complete' ? 'review' : r.status}</Badge>
                  </div>
                </Card>
              </button>
            ))
          ) : (
            <Card className="p-8 text-center text-sm text-slate-400">No submissions yet.</Card>
          )}
        </div>

        <div className="lg:sticky lg:top-8 lg:self-start">
          {selected ? <ReportDetail id={selected} /> : <Card className="p-8 text-center text-sm text-slate-400">Select a submission to review its findings.</Card>}
        </div>
      </div>
    </div>
  );
}

function ReportDetail({ id }: { id: string }): JSX.Element {
  const qc = useQueryClient();
  const nav = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ['admin-report', id], queryFn: () => api.adminReport(id) });
  const refresh = () => { qc.invalidateQueries({ queryKey: ['admin-report', id] }); qc.invalidateQueries({ queryKey: ['admin-reports'] }); };
  const approve = useMutation({ mutationFn: () => api.approveReport(id), onSuccess: refresh });
  const reject = useMutation({ mutationFn: () => api.rejectReport(id, 'Sent back for review'), onSuccess: refresh });

  if (isLoading || !data) return <Skeleton className="h-96" />;
  const f = data.findings;

  return (
    <Card className="animate-fade-in p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-xl text-slate-900">Before you generate</h3>
        <Badge tone={data.status === 'released' ? 'green' : 'amber'}>{data.status.replace(/_/g, ' ')}</Badge>
      </div>

      {f ? (
        <div className="space-y-2">
          {f.surprises.map((s) => (
            <Row key={s.trait} label="Surprise" tone="accent">{cap(s.trait)} — strong in behaviour, never claimed ({s.situations}×)</Row>
          ))}
          {f.coherence?.contradiction ? (
            <Row label="Coherence" tone="amber">resume reads {f.coherence.resume_frame}, work shows {f.coherence.work_frame} — behaviour wins</Row>
          ) : null}
          {f.gap.filter((g) => g.classification === 'real').map((g) => (
            <Row key={g.capability} label="Gap" tone="green">{g.capability.replace(/_/g, ' ')} · {Math.round(g.current * 100)}→{Math.round(g.desired * 100)} · Real</Row>
          ))}
          {f.market.classification !== 'aligned' ? (
            <Row label="Market" tone="slate">pulls {f.market.wish_dir}, believes {f.market.pays_dir} pays — examine belief</Row>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No computed findings yet.</p>
      )}

      <div className="mt-5 flex gap-3">
        {data.status === 'released' ? (
          <Button className="flex-1" onClick={() => nav(`/report/${id}`)}>Open report →</Button>
        ) : (
          <>
            <Button className="flex-1" loading={approve.isPending} onClick={() => approve.mutate()}>Approve & generate</Button>
            <Button variant="danger" loading={reject.isPending} onClick={() => reject.mutate()}>Reject</Button>
          </>
        )}
      </div>
    </Card>
  );
}

function Row({ label, tone, children }: { label: string; tone: 'accent' | 'amber' | 'green' | 'slate'; children: React.ReactNode }): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5 text-[13px]">
      <span className="text-slate-700"><b className="text-slate-900">{label} ·</b> {children}</span>
    </div>
  );
}
function cap(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' '); }
