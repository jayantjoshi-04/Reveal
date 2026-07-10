import { Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, type Dashboard } from '../../lib/api.js';
import { useAuth } from '../../store/auth.js';
import { Button, Card, Skeleton, Badge } from '../../components/ui.js';

const STEPS = [
  { key: 'submitted', label: 'Submitted', note: 'Your responses are in.' },
  { key: 'review', label: 'Under review', note: 'A facilitator is checking the high-stakes findings.' },
  { key: 'approved', label: 'Approved', note: 'Your report has been generated.' },
  { key: 'ready', label: 'Report ready', note: 'Your Design Signature is unlocked.' },
];

function stageOf(status: string | undefined): number {
  switch (status) {
    case 'capture_complete': return 1;
    case 'generated': case 'reviewed': return 2;
    case 'released': return 3;
    default: return 0;
  }
}

export function StudentDashboard(): JSX.Element {
  const { role, name, signOut } = useAuth();
  const nav = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['me-dashboard'],
    queryFn: () => api.meDashboard(),
    refetchInterval: 8000, // poll so the report unlocks automatically on approval
  });

  if (role !== 'student') return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header name={name} onSignOut={() => { signOut(); nav('/'); }} />
      <div className="mx-auto max-w-3xl px-6 py-10">
        {isLoading || !data ? <DashboardSkeleton /> : <Body data={data} nav={nav} />}
      </div>
    </div>
  );
}

function Body({ data, nav }: { data: Dashboard; nav: (p: string) => void }): JSX.Element {
  const status = data.instance?.status;
  const stage = stageOf(status);

  // no run yet or still in progress → route into the survey
  if (!data.instance || status === 'in_progress') {
    return (
      <Card className="animate-slide-up p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-xl">✦</div>
        <h1 className="font-serif text-2xl text-slate-900">{data.instance ? 'Pick up where you left off' : 'Start your assessment'}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Your Design Signature is built from three short sittings. You can pause and resume anytime.</p>
        <Button className="mx-auto mt-6" onClick={() => nav('/survey')}>{data.instance ? 'Resume assessment' : 'Begin assessment'} →</Button>
      </Card>
    );
  }

  // released → unlock the report
  if (data.report_ready && data.instance) {
    return (
      <div className="animate-slide-up space-y-5">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-accent to-accent-dark p-8 text-white">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-white/70">Ready</div>
            <h1 className="font-serif text-3xl">Your Design Signature is ready.</h1>
            <p className="mt-2 max-w-md text-sm text-white/80">Two designers inside it — the one your evidence shows, and the one you’re becoming, including one thing you didn’t expect.</p>
            <Button variant="ghost" className="mt-6 border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={() => nav(`/report/${data.instance!.instance_id}`)}>Open my report →</Button>
          </div>
        </Card>
        <Timeline stage={3} />
      </div>
    );
  }

  // capture complete → "Report Under Review" tracking
  return (
    <div className="animate-slide-up space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-slate-900">Report under review</h1>
          <p className="mt-1 text-sm text-slate-500">Thanks for completing the assessment. Here’s where things stand.</p>
        </div>
        <Badge tone="amber">In review</Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Status" value="Under review" />
        <Stat label="Reports generated" value={stage >= 2 ? '1' : '0'} />
        <Stat label="Submitted" value={data.instance.completed_at ? new Date(data.instance.completed_at).toLocaleDateString() : '—'} />
      </div>

      <Timeline stage={stage} />

      <Card className="p-5">
        <p className="text-sm text-slate-500">
          A facilitator reviews every submission — especially the surprises and the resume-vs-work coherence — before your
          report is generated and released. This page updates automatically the moment it’s approved.
        </p>
      </Card>
    </div>
  );
}

function Timeline({ stage }: { stage: number }): JSX.Element {
  return (
    <Card className="p-6">
      <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-slate-400">Processing timeline</div>
      <ol className="relative space-y-5 pl-2">
        {STEPS.map((s, i) => {
          const done = i < stage;
          const active = i === stage;
          return (
            <li key={s.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors ${done ? 'bg-emerald-500 text-white' : active ? 'bg-accent text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {done ? '✓' : i + 1}
                </span>
                {i < STEPS.length - 1 ? <span className={`mt-1 h-8 w-0.5 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} /> : null}
              </div>
              <div className="pb-1">
                <div className={`text-sm font-semibold ${active ? 'text-accent' : done ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}{active ? ' · in progress' : ''}</div>
                <div className="text-[13px] text-slate-500">{s.note}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <Card className="p-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
    </Card>
  );
}

function Header({ name, onSignOut }: { name: string | null; onSignOut: () => void }): JSX.Element {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3.5">
        <span className="text-[13px] font-bold uppercase tracking-[0.28em] text-slate-900">Re<span className="text-accent">veal</span></span>
        <div className="flex items-center gap-4">
          <span className="text-[13px] text-slate-500">{name}</span>
          <button className="text-[13px] font-medium text-slate-400 hover:text-slate-700" onClick={onSignOut}>Sign out</button>
        </div>
      </div>
    </header>
  );
}

function DashboardSkeleton(): JSX.Element {
  return (
    <div className="space-y-5">
      <Skeleton className="h-9 w-64" />
      <div className="grid grid-cols-3 gap-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      <Skeleton className="h-64" />
    </div>
  );
}
