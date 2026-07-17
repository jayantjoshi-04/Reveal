import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type Dashboard, type ReportHistoryRow } from '../../lib/api.js';
import { useAuth } from '../../store/auth.js';
import { Button, Card, Skeleton, Badge, Field, Input } from '../../components/ui.js';

type View = 'home' | 'reports' | 'profile' | 'billing' | 'settings';

const STEPS = [
  { key: 'submitted', label: 'Submitted', note: 'Your responses are in.' },
  { key: 'review', label: 'Under review', note: 'An admin is checking the high-stakes findings.' },
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
  const [view, setView] = useState<View>('home');
  const { data, isLoading } = useQuery({
    queryKey: ['me-dashboard'],
    queryFn: () => api.meDashboard(),
    refetchInterval: 8000, // poll so the report unlocks automatically on approval
  });

  if (role !== 'student') return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-mesh">
      <DashboardNav name={name} view={view} setView={setView} onSignOut={() => { signOut(); nav('/'); }} />
      <div className="mx-auto max-w-4xl px-6 py-10">
        {isLoading || !data ? (
          <DashboardSkeleton />
        ) : view === 'home' ? (
          <Home data={data} nav={nav} setView={setView} />
        ) : view === 'reports' ? (
          <Reports nav={nav} />
        ) : view === 'profile' ? (
          <Profile data={data} />
        ) : view === 'billing' ? (
          <Billing />
        ) : (
          <Settings data={data} onSignOut={() => { signOut(); nav('/'); }} />
        )}
      </div>
    </div>
  );
}

// ── Nav with Profile dropdown + Reports ──────────────────────────────────────
function DashboardNav({ name, view, setView, onSignOut }: { name: string | null; view: View; setView: (v: View) => void; onSignOut: () => void }): JSX.Element {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent): void => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const initials = (name ?? 'You').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
        <button onClick={() => setView('home')} className="text-[13px] font-bold uppercase tracking-[0.28em] text-slate-900">Re<span className="text-accent">veal</span></button>
        <div className="flex items-center gap-1">
          <NavTab active={view === 'home'} onClick={() => setView('home')}>Home</NavTab>
          <NavTab active={view === 'reports'} onClick={() => setView('reports')}>Reports</NavTab>
          <div className="relative ml-1" ref={ref}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="press flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-[13px] font-medium text-slate-700 transition-colors hover:border-slate-300"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">{initials}</span>
              <span className="hidden sm:inline">{name ?? 'You'}</span>
              <span className="text-slate-400">▾</span>
            </button>
            {open ? (
              <div className="animate-fade-in absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lift">
                <MenuItem onClick={() => { setView('profile'); setOpen(false); }} icon="👤" title="Edit profile" sub="Name & information" />
                <MenuItem onClick={() => { setView('billing'); setOpen(false); }} icon="💳" title="Payment & billing" sub="Plan & invoices" />
                <MenuItem onClick={() => { setView('settings'); setOpen(false); }} icon="⚙️" title="Account settings" sub="Email & security" />
                <div className="border-t border-slate-100" />
                <MenuItem onClick={onSignOut} icon="↩" title="Sign out" sub="End this session" danger />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
function NavTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }): JSX.Element {
  return (
    <button onClick={onClick} className={`rounded-xl px-3 py-1.5 text-[13px] font-medium transition-colors ${active ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>{children}</button>
  );
}
function MenuItem({ onClick, icon, title, sub, danger }: { onClick: () => void; icon: string; title: string; sub: string; danger?: boolean }): JSX.Element {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm">{icon}</span>
      <span>
        <span className={`block text-[13px] font-semibold ${danger ? 'text-rose-600' : 'text-slate-800'}`}>{title}</span>
        <span className="block text-[11px] text-slate-400">{sub}</span>
      </span>
    </button>
  );
}

// ── Home ─────────────────────────────────────────────────────────────────────
function Home({ data, nav, setView }: { data: Dashboard; nav: (p: string) => void; setView: (v: View) => void }): JSX.Element {
  const status = data.instance?.status;
  const stage = stageOf(status);
  const firstName = data.profile.name?.split(' ')[0] ?? 'there';

  if (data.report_ready && data.instance) {
    return (
      <div className="animate-slide-up space-y-5">
        <Card className="overflow-hidden">
          <div className="relative overflow-hidden bg-gradient-to-br from-accent to-accent-dark p-8 text-white">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative mb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-white/70">Ready</div>
            <h1 className="relative font-serif text-3xl">Your Design Signature is ready.</h1>
            <p className="relative mt-2 max-w-md text-sm text-white/80">Two designers inside it — the one your evidence shows, and the one you’re becoming, including one thing you didn’t expect.</p>
            <Button variant="ghost" className="relative mt-6 border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={() => nav(`/report/${data.instance!.instance_id}`)}>Open my report →</Button>
          </div>
        </Card>
        <Timeline stage={4} />
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-6">
      {/* welcome hero + CTA */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-card sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 animate-blob rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-44 w-44 animate-blob rounded-full bg-violet-500/20 blur-3xl [animation-delay:5s]" />
        <div className="relative">
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-indigo-300">Welcome back, {firstName}</div>
          <h1 className="mt-3 max-w-lg font-serif text-3xl leading-tight sm:text-4xl">
            {data.instance && status === 'in_progress' ? 'Pick up where you left off.' : status && status !== 'in_progress' ? 'Your report is on its way.' : 'Ready to see your Design Signature?'}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">
            {data.instance && status === 'in_progress'
              ? 'Your run is saved to the exact step you stopped on — nothing to redo.'
              : status && status !== 'in_progress'
                ? 'Track its progress below. This page updates the moment it’s approved.'
                : 'Three short sittings read how you design and return a high-fidelity report you can revisit and re-run.'}
          </p>
          {(!status || status === 'in_progress') ? (
            <button onClick={() => nav('/onboarding')} className="press mt-6 rounded-2xl bg-accent px-6 py-3 text-[15px] font-semibold text-white shadow-lift transition-colors hover:bg-accent-dark">
              {data.instance && status === 'in_progress' ? 'Resume survey →' : 'Take the survey →'}
            </button>
          ) : (
            <button onClick={() => setView('reports')} className="press mt-6 rounded-2xl bg-white/10 px-6 py-3 text-[15px] font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/20">
              View my reports →
            </button>
          )}
        </div>
      </div>

      {status && status !== 'in_progress' ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Status" value={data.report_ready ? 'Ready' : 'Under review'} />
            <Stat label="Reports generated" value={stage >= 2 ? '1' : '0'} />
            <Stat label="Submitted" value={data.instance?.completed_at ? new Date(data.instance.completed_at).toLocaleDateString() : '—'} />
          </div>
          <Timeline stage={stage} />
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { i: '🧭', t: 'Two channels', d: 'What you say vs. what you do.' },
            { i: '⏱', t: '~45 minutes', d: 'Across three sittings you control.' },
            { i: '✦', t: 'Re-runnable', d: 'A snapshot you revisit over time.' },
          ].map((c) => (
            <Card key={c.t} className="p-5">
              <div className="mb-2 text-xl">{c.i}</div>
              <div className="text-[15px] font-semibold text-slate-900">{c.t}</div>
              <div className="mt-1 text-[13px] text-slate-500">{c.d}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Reports history ──────────────────────────────────────────────────────────
function Reports({ nav }: { nav: (p: string) => void }): JSX.Element {
  const { data, isLoading } = useQuery({ queryKey: ['me-reports'], queryFn: () => api.meReports() });
  const [q, setQ] = useState('');

  const rows = (data?.reports ?? []).filter((r) => {
    if (!q.trim()) return true;
    const hay = `${statusLabel(r.status)} ${r.schema_version} ${new Date(r.started_at).toLocaleDateString()}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="animate-slide-up space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-slate-900">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">Every run you’ve taken. Open a released report, or track one in review.</p>
        </div>
        <div className="w-full sm:w-64">
          <Input placeholder="Search by status or date…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-xl">🗂</div>
          <div className="font-serif text-xl text-slate-900">{data?.reports.length ? 'No matches' : 'No reports yet'}</div>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{data?.reports.length ? 'Try a different search.' : 'Take the survey and your Design Signature will appear here.'}</p>
          {!data?.reports.length ? <Button className="mx-auto mt-5" onClick={() => nav('/onboarding')}>Take the survey →</Button> : null}
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => <ReportRow key={r.instance_id} row={r} index={rows.length - i} onOpen={() => nav(`/report/${r.instance_id}`)} />)}
        </div>
      )}
    </div>
  );
}

function ReportRow({ row, index, onOpen }: { row: ReportHistoryRow; index: number; onOpen: () => void }): JSX.Element {
  const tone = row.report_ready ? 'green' : row.status === 'in_progress' ? 'slate' : 'amber';
  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-soft to-violet-100 font-serif text-lg text-accent-dark">✦</div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-slate-900">Design Signature #{index}</span>
            <Badge tone={tone}>{statusLabel(row.status)}</Badge>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 font-mono text-[11px] text-slate-400">
            <span>Started {new Date(row.started_at).toLocaleDateString()}</span>
            {row.generated_at ? <span>Generated {new Date(row.generated_at).toLocaleDateString()}</span> : null}
            <span>v{row.schema_version}</span>
          </div>
        </div>
      </div>
      <div className="flex-shrink-0">
        {row.report_ready ? (
          <Button variant="primary" onClick={onOpen}>Open →</Button>
        ) : (
          <Button variant="ghost" disabled>{row.status === 'in_progress' ? 'In progress' : 'In review'}</Button>
        )}
      </div>
    </Card>
  );
}

// ── Profile edit ─────────────────────────────────────────────────────────────
function Profile({ data }: { data: Dashboard }): JSX.Element {
  const qc = useQueryClient();
  const { name, signIn } = useAuth();
  const [form, setForm] = useState({
    name: data.profile.name ?? '',
    institution: data.profile.institution ?? '',
    domain_of_interest: data.profile.domain_of_interest ?? '',
  });
  const [saved, setSaved] = useState(false);
  const mut = useMutation({
    mutationFn: () => api.updateProfile(form),
    onSuccess: () => {
      // keep the nav initials/name in sync
      const t = localStorage.getItem('reveal_token');
      if (t) signIn('student', form.name, t);
      qc.invalidateQueries({ queryKey: ['me-dashboard'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  return (
    <div className="animate-slide-up max-w-xl space-y-5">
      <div>
        <h1 className="font-serif text-3xl text-slate-900">Edit profile</h1>
        <p className="mt-1 text-sm text-slate-500">Update your name and information. Your email is your login and can’t be changed here.</p>
      </div>
      <Card className="space-y-4 p-6">
        <Field label="Full name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></Field>
        <Field label="Institution"><Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="e.g. NID" /></Field>
        <Field label="Domain of interest"><Input value={form.domain_of_interest} onChange={(e) => setForm({ ...form, domain_of_interest: e.target.value })} placeholder="e.g. Product design" /></Field>
        <Field label="Email (read-only)"><Input value={data.profile.email} disabled className="cursor-not-allowed bg-slate-50 text-slate-400" /></Field>
        <div className="flex items-center gap-3 pt-1">
          <Button loading={mut.isPending} onClick={() => mut.mutate()}>Save changes</Button>
          {saved ? <span className="animate-fade-in text-[13px] font-medium text-emerald-600">✓ Saved</span> : null}
          {mut.isError ? <span className="text-[13px] text-rose-600">Couldn’t save — try again.</span> : null}
        </div>
      </Card>
      <p className="text-[12px] text-slate-400">Signed in as {name}.</p>
    </div>
  );
}

// ── Billing (polished placeholder) ───────────────────────────────────────────
function Billing(): JSX.Element {
  const invoices = [
    { id: 'INV-0007', date: 'Jul 2026', amount: '₹0.00', label: 'Pilot access' },
    { id: 'INV-0006', date: 'Apr 2026', amount: '₹0.00', label: 'Pilot access' },
  ];
  return (
    <div className="animate-slide-up max-w-2xl space-y-5">
      <div>
        <h1 className="font-serif text-3xl text-slate-900">Payment &amp; billing</h1>
        <p className="mt-1 text-sm text-slate-500">Your plan and invoice history.</p>
      </div>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 bg-gradient-to-br from-accent to-accent-dark p-6 text-white">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">Current plan</div>
            <div className="mt-1 font-serif text-2xl">Pilot · Free</div>
            <div className="mt-1 text-sm text-white/80">Full access during the pilot programme.</div>
          </div>
          <Badge tone="green">Active</Badge>
        </div>
        <div className="flex items-center justify-between p-5">
          <div className="text-sm text-slate-500">Payments aren’t enabled yet — this is a preview of billing.</div>
          <Button variant="ghost" disabled>Manage plan</Button>
        </div>
      </Card>
      <Card className="p-5">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-slate-400">Invoice history</div>
        <div className="divide-y divide-slate-100">
          {invoices.map((iv) => (
            <div key={iv.id} className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium text-slate-800">{iv.id} · {iv.label}</div>
                <div className="font-mono text-[11px] text-slate-400">{iv.date}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-700">{iv.amount}</span>
                <button className="text-[13px] font-medium text-accent hover:text-accent-dark" disabled>Receipt</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Settings ─────────────────────────────────────────────────────────────────
function Settings({ data, onSignOut }: { data: Dashboard; onSignOut: () => void }): JSX.Element {
  return (
    <div className="animate-slide-up max-w-xl space-y-5">
      <div>
        <h1 className="font-serif text-3xl text-slate-900">Account settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your login and session.</p>
      </div>
      <Card className="divide-y divide-slate-100">
        <Row k="Email" v={data.profile.email} />
        <Row k="Username" v={data.profile.username ?? '—'} />
        <Row k="Password" v="••••••••" action={<button className="text-[13px] font-medium text-accent hover:text-accent-dark" disabled>Change</button>} />
      </Card>
      <Card className="flex items-center justify-between p-5">
        <div>
          <div className="text-[15px] font-semibold text-slate-900">Sign out</div>
          <div className="text-[13px] text-slate-500">End your session on this device.</div>
        </div>
        <Button variant="ghost" onClick={onSignOut}>Sign out</Button>
      </Card>
      <Card className="flex items-center justify-between border-rose-100 p-5">
        <div>
          <div className="text-[15px] font-semibold text-rose-600">Delete account</div>
          <div className="text-[13px] text-slate-500">Permanently remove your data. Contact support to proceed.</div>
        </div>
        <Button variant="danger" disabled>Delete</Button>
      </Card>
    </div>
  );
}
function Row({ k, v, action }: { k: string; v: string; action?: ReactNode }): JSX.Element {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400">{k}</div>
        <div className="mt-0.5 text-sm text-slate-800">{v}</div>
      </div>
      {action}
    </div>
  );
}

// ── shared bits ──────────────────────────────────────────────────────────────
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
function DashboardSkeleton(): JSX.Element {
  return (
    <div className="space-y-5">
      <Skeleton className="h-48 rounded-3xl" />
      <div className="grid grid-cols-3 gap-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      <Skeleton className="h-64" />
    </div>
  );
}
function statusLabel(status: string): string {
  switch (status) {
    case 'in_progress': return 'In progress';
    case 'capture_complete': return 'Under review';
    case 'generated': case 'reviewed': return 'Approved';
    case 'released': return 'Ready';
    default: return status;
  }
}
