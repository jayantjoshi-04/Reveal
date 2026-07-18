import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api.js';
import { Card, Skeleton, Badge, Button, Input, Field } from '../../components/ui.js';
import { AdminPageHeader } from './AdminLayout.js';

const genPassword = (): string => {
  const words = ['delta', 'ember', 'cobalt', 'lumen', 'harbor', 'quartz', 'zephyr', 'atlas', 'onyx', 'vellum'];
  const w = words[Math.floor(Math.random() * words.length)]!;
  return `${w}-${Math.floor(1000 + Math.random() * 9000)}`;
};

const emptyForm = () => ({ name: '', email: '', username: '', password: genPassword(), domain_of_interest: '' });

export function StudentDirectory(): JSX.Element {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-students'], queryFn: () => api.adminStudents() });
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' }) => api.setStudentStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-students'] }),
  });

  const [open, setOpen] = useState(false);
  const [f, setF] = useState(emptyForm());
  const [err, setErr] = useState<string | null>(null);
  const [created, setCreated] = useState<{ username: string; password: string } | null>(null);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const create = useMutation({
    mutationFn: () => api.adminCreateStudent(f),
    onSuccess: () => {
      setCreated({ username: f.username, password: f.password });
      setErr(null);
      setF(emptyForm());
      qc.invalidateQueries({ queryKey: ['admin-students'] });
    },
    onError: (e) => setErr(e instanceof ApiError ? (e.issues?.join(' · ') ?? e.message) : 'Could not create student'),
  });

  const valid = f.name && /.+@.+\..+/.test(f.email) && f.username.length >= 3 && f.password.length >= 8;

  return (
    <div className="animate-fade-in">
      <AdminPageHeader
        title="Students"
        sub="Master directory — accounts, metadata, and status."
        action={
          <Button
            variant="ghost"
            onClick={() => {
              setOpen((v) => !v);
              setCreated(null);
              setErr(null);
            }}
          >
            {open ? 'Close' : '＋ Add student'}
          </Button>
        }
      />

      {open ? (
        <Card className="mb-5 p-5">
          <h3 className="mb-1 font-serif text-lg text-slate-900">Create a student account</h3>
          <p className="mb-4 text-sm text-slate-500">
            Pre-verified — the student signs in straight away with the username &amp; password below. No email needed.
          </p>

          {created ? (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="mb-2 text-sm font-semibold text-emerald-800">✓ Account created — share these credentials</div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-white px-3 py-2 text-sm">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">Username</div>
                  <div className="font-mono font-semibold text-slate-900">{created.username}</div>
                </div>
                <div className="rounded-lg bg-white px-3 py-2 text-sm">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">Password</div>
                  <div className="font-mono font-semibold text-slate-900">{created.password}</div>
                </div>
              </div>
              <button
                className="mt-3 text-xs font-medium text-emerald-700 hover:underline"
                onClick={() => navigator.clipboard?.writeText(`Username: ${created.username}\nPassword: ${created.password}`)}
              >
                Copy credentials
              </button>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name"><Input value={f.name} onChange={set('name')} placeholder="Aria Mehta" /></Field>
            <Field label="Email"><Input type="email" value={f.email} onChange={set('email')} placeholder="aria@school.edu" /></Field>
            <Field label="Username"><Input value={f.username} onChange={set('username')} placeholder="aria.mehta" /></Field>
            <Field label="Password">
              <div className="flex gap-2">
                <Input value={f.password} onChange={set('password')} />
                <button
                  type="button"
                  className="press shrink-0 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:border-slate-300"
                  onClick={() => setF({ ...f, password: genPassword() })}
                >
                  Regenerate
                </button>
              </div>
            </Field>
          </div>
          {err ? <p className="mt-3 text-sm text-rose-600">{err}</p> : null}
          <div className="mt-4 flex gap-2">
            <Button loading={create.isPending} disabled={!valid} onClick={() => create.mutate()}>Create student</Button>
          </div>
        </Card>
      ) : null}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left font-mono text-[10px] uppercase tracking-widest text-slate-400">
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Domain</th>
                <th className="px-5 py-3">Progress</th>
                <th className="px-5 py-3">Account</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [0, 1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-slate-50"><td className="px-5 py-4" colSpan={5}><Skeleton className="h-6" /></td></tr>
                ))
              ) : data && data.length ? (
                data.map((s) => (
                  <tr key={s.student_id} className="border-b border-slate-50 transition-colors hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-900">{s.name}</div>
                      <div className="text-xs text-slate-400">{s.email}{s.username ? ` · @${s.username}` : ''}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{s.domain_of_interest ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={s.latest_status === 'released' ? 'green' : s.latest_status === 'capture_complete' ? 'amber' : 'slate'}>
                        {s.latest_status ? s.latest_status.replace(/_/g, ' ') : 'not started'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={s.account_status === 'active' ? 'green' : 'rose'}>{s.account_status}</Badge>
                      {!s.email_verified ? <span className="ml-2 text-xs text-amber-600">unverified</span> : null}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        className="text-xs font-medium text-slate-500 hover:text-slate-900"
                        onClick={() => setStatus.mutate({ id: s.student_id, status: s.account_status === 'active' ? 'suspended' : 'active' })}
                      >
                        {s.account_status === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td className="px-5 py-8 text-center text-slate-400" colSpan={5}>No students yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
