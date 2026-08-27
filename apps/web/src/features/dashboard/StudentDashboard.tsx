import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type Dashboard, type V2Status } from '../../lib/api.js';
import { useAuth } from '../../store/auth.js';
import { Button, Card, Skeleton, Badge, Field, Input } from '../../components/ui.js';
import { LogoLink } from '../../components/Logo.js';

type View = 'home' | 'reports' | 'profile' | 'billing' | 'settings';

export function StudentDashboard(): JSX.Element {
  const { role, name, signOut } = useAuth();
  const nav = useNavigate();
  const [view, setView] = useState<View>('home');
  const { data, isLoading } = useQuery({ queryKey: ['me-dashboard'], queryFn: () => api.meDashboard() });
  const { data: statusData } = useQuery({ queryKey: ['survey-status'], queryFn: () => api.surveyStatus(), refetchInterval: 6000 });
  const inst = statusData?.instance ?? null;

  if (role !== 'student') return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-mesh">
      <DashboardNav name={name} view={view} setView={setView} onSignOut={() => { signOut(); nav('/'); }} />
      <div className="mx-auto max-w-4xl px-6 py-10">
        {isLoading || !data ? (
          <DashboardSkeleton />
        ) : view === 'home' ? (
          <Home profile={data.profile} inst={inst} nav={nav} setView={setView} />
        ) : view === 'reports' ? (
          <Reports inst={inst} nav={nav} />
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
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-noir-2/70">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
        <LogoLink markClass="h-5 w-5" wordClass="text-[16px]" />
        <div className="flex items-center gap-1">
          <NavTab active={view === 'home'} onClick={() => setView('home')}>Home</NavTab>
          <NavTab active={view === 'reports'} onClick={() => setView('reports')}>Reports</NavTab>
          <div className="relative ml-1" ref={ref}>
            <button onClick={() => setOpen((o) => !o)} className="press flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-noir-card py-1 pl-1 pr-3 text-[13px] font-medium text-slate-700 dark:text-slate-200 transition-colors hover:border-slate-300">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">{initials}</span>
              <span className="hidden sm:inline">{name ?? 'You'}</span>
              <span className="text-slate-400">▾</span>
            </button>
            {open ? (
              <div className="animate-fade-in absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-noir-card shadow-lift">
                <MenuItem onClick={() => { setView('profile'); setOpen(false); }} icon="👤" title="Edit profile" sub="Name & information" />
                <MenuItem onClick={() => { setView('billing'); setOpen(false); }} icon="💳" title="Payment & billing" sub="Plan & invoices" />
                <MenuItem onClick={() => { setView('settings'); setOpen(false); }} icon="⚙️" title="Account settings" sub="Email & security" />
                <div className="border-t border-slate-100 dark:border-white/10" />
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
  return <button onClick={onClick} className={`rounded-xl px-3 py-1.5 text-[13px] font-medium transition-colors ${active ? 'bg-slate-900 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-800'}`}>{children}</button>;
}
function MenuItem({ onClick, icon, title, sub, danger }: { onClick: () => void; icon: string; title: string; sub: string; danger?: boolean }): JSX.Element {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/10 text-sm">{icon}</span>
      <span>
        <span className={`block text-[13px] font-semibold ${danger ? 'text-rose-600' : 'text-slate-800 dark:text-slate-100'}`}>{title}</span>
        <span className="block text-[11px] text-slate-400">{sub}</span>
      </span>
    </button>
  );
}

// ── Home ─────────────────────────────────────────────────────────────────────
function Home({ profile, inst, nav, setView }: { profile: Dashboard['profile']; inst: V2Status | null; nav: (p: string) => void; setView: (v: View) => void }): JSX.Element {
  const firstName = profile.name?.split(' ')[0] ?? 'there';
  const started = !!inst && inst.answered > 0;

  if (inst?.reportReady) {
    return (
      <div className="animate-slide-up space-y-5">
        <Card className="overflow-hidden">
          <div className="relative overflow-hidden bg-gradient-to-br from-accent to-accent-dark p-8 text-white">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative mb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-white/70">Ready · REVEAL 2.0</div>
            <h1 className="relative font-serif text-3xl">Your reading is ready.</h1>
            <p className="relative mt-2 max-w-md text-sm text-white/80">The deterministic engine read your studio session — capacities, directions, and one thing you may not have expected.</p>
            <div className="relative mt-6 flex flex-wrap gap-3">
              <Button variant="ghost" className="border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={() => nav(`/report/${inst.id}`)}>Open my report →</Button>
              {inst.canRerun ? (
                <Button variant="ghost" className="border-white/20 text-white/80 hover:bg-white/10" onClick={async () => { await api.surveyRerun(); nav('/survey'); }}>Re-run it →</Button>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-card sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 animate-blob rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-44 w-44 animate-blob rounded-full bg-violet-500/20 blur-3xl [animation-delay:5s]" />
        <div className="relative">
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-indigo-300">Welcome back, {firstName}</div>
          <h1 className="mt-3 max-w-lg font-serif text-3xl leading-tight sm:text-4xl">{started ? 'Pick up where you left off.' : 'Ready to see how you design?'}</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">
            {started
              ? `You’re ${inst!.answered} of ${inst!.total} activities in — saved to the exact step you stopped on.`
              : 'A studio session reads how you actually work and returns a deterministic reading you can revisit and re-run.'}
          </p>
          <button onClick={() => nav(started ? '/survey' : '/onboarding')} className="press mt-6 rounded-2xl bg-accent px-6 py-3 text-[15px] font-semibold text-white shadow-lift transition-colors hover:bg-accent-dark">
            {started ? 'Resume the studio session →' : 'Start the studio session →'}
          </button>
        </div>
      </div>

      {started ? (
        <Card className="p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Progress</span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{inst!.answered} / {inst!.total}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.round((inst!.answered / inst!.total) * 100)}%` }} />
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { i: '🧭', t: 'Two channels', d: 'What you say vs. what you do.' },
            { i: '⏱', t: '~30 minutes', d: 'Five short blocks you control.' },
            { i: '✦', t: 'Deterministic', d: 'Same answers, same reading — no AI.' },
          ].map((c) => (
            <Card key={c.t} className="p-5">
              <div className="mb-2 text-xl">{c.i}</div>
              <div className="text-[15px] font-semibold text-slate-900 dark:text-white">{c.t}</div>
              <div className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">{c.d}</div>
            </Card>
          ))}
        </div>
      )}
      <button onClick={() => setView('reports')} className="text-[13px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">View my reports →</button>
    </div>
  );
}

// ── Reports ──────────────────────────────────────────────────────────────────
function Reports({ inst, nav }: { inst: V2Status | null; nav: (p: string) => void }): JSX.Element {
  return (
    <div className="animate-slide-up space-y-5">
      <div>
        <h1 className="font-serif text-3xl text-slate-900 dark:text-white">Reports</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your studio session and its reading.</p>
      </div>
      {!inst ? (
        <Card className="p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-xl">🗂</div>
          <div className="font-serif text-xl text-slate-900 dark:text-white">No reports yet</div>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">Take the studio session and your reading will appear here.</p>
          <Button className="mx-auto mt-5" onClick={() => nav('/onboarding')}>Start the session →</Button>
        </Card>
      ) : (
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-soft to-violet-100 font-serif text-lg text-accent-dark">✦</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold text-slate-900 dark:text-white">Your Reading</span>
                <Badge tone={inst.reportReady ? 'green' : 'slate'}>{inst.reportReady ? 'Ready' : 'In progress'}</Badge>
              </div>
              <div className="mt-1 font-mono text-[11px] text-slate-400">{inst.answered} / {inst.total} activities{inst.generatedAt ? ` · generated ${new Date(inst.generatedAt).toLocaleDateString()}` : ''}</div>
            </div>
          </div>
          {inst.reportReady ? <Button onClick={() => nav(`/report/${inst.id}`)}>Open →</Button> : <Button variant="ghost" onClick={() => nav('/survey')}>Resume →</Button>}
        </Card>
      )}
    </div>
  );
}

// ── Profile edit ─────────────────────────────────────────────────────────────
function Profile({ data }: { data: Dashboard }): JSX.Element {
  const qc = useQueryClient();
  const { name, signIn } = useAuth();
  const [form, setForm] = useState({ name: data.profile.name ?? '', institution: data.profile.institution ?? '', domain_of_interest: data.profile.domain_of_interest ?? '' });
  const [saved, setSaved] = useState(false);
  const mut = useMutation({
    mutationFn: () => api.updateProfile(form),
    onSuccess: () => {
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
        <h1 className="font-serif text-3xl text-slate-900 dark:text-white">Edit profile</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update your name and information. Your email is your login and can’t be changed here.</p>
      </div>
      <Card className="space-y-4 p-6">
        <Field label="Full name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></Field>
        <Field label="Institution"><Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="e.g. NID" /></Field>
        <Field label="Domain of interest"><Input value={form.domain_of_interest} onChange={(e) => setForm({ ...form, domain_of_interest: e.target.value })} placeholder="e.g. Product design" /></Field>
        <Field label="Email (read-only)"><Input value={data.profile.email} disabled className="cursor-not-allowed bg-slate-50 dark:bg-white/5 text-slate-400" /></Field>
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

// ── Billing (placeholder) ────────────────────────────────────────────────────
function Billing(): JSX.Element {
  return (
    <div className="animate-slide-up max-w-2xl space-y-5">
      <div>
        <h1 className="font-serif text-3xl text-slate-900 dark:text-white">Payment &amp; billing</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your plan and invoice history.</p>
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
          <div className="text-sm text-slate-500 dark:text-slate-400">Payments aren’t enabled yet — this is a preview of billing.</div>
          <Button variant="ghost" disabled>Manage plan</Button>
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
        <h1 className="font-serif text-3xl text-slate-900 dark:text-white">Account settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your login and session.</p>
      </div>
      <Card className="divide-y divide-slate-100">
        <Row k="Email" v={data.profile.email} />
        <Row k="Username" v={data.profile.username ?? '—'} />
        <Row k="Password" v="••••••••" action={<button className="text-[13px] font-medium text-accent hover:text-accent-dark" disabled>Change</button>} />
      </Card>
      <Card className="flex items-center justify-between p-5">
        <div>
          <div className="text-[15px] font-semibold text-slate-900 dark:text-white">Sign out</div>
          <div className="text-[13px] text-slate-500 dark:text-slate-400">End your session on this device.</div>
        </div>
        <Button variant="ghost" onClick={onSignOut}>Sign out</Button>
      </Card>
    </div>
  );
}
function Row({ k, v, action }: { k: string; v: string; action?: ReactNode }): JSX.Element {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400">{k}</div>
        <div className="mt-0.5 text-sm text-slate-800 dark:text-slate-100">{v}</div>
      </div>
      {action}
    </div>
  );
}
function DashboardSkeleton(): JSX.Element {
  return (
    <div className="space-y-5">
      <Skeleton className="h-48 rounded-3xl" />
      <div className="grid grid-cols-3 gap-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20" />)}</div>
    </div>
  );
}
