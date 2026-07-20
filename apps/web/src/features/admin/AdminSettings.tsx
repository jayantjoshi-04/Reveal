import { useState } from 'react';
import { api, ApiError } from '../../lib/api.js';
import { Card, Button, Input, Field } from '../../components/ui.js';
import { AdminPageHeader } from './AdminLayout.js';

export function AdminSettings(): JSX.Element {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const valid = current && next.length >= 8 && next === confirm;

  async function submit(): Promise<void> {
    setErr(null);
    setDone(false);
    if (next !== confirm) {
      setErr('New passwords don’t match.');
      return;
    }
    setBusy(true);
    try {
      await api.adminChangePassword(current, next);
      setDone(true);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Could not change password');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <AdminPageHeader title="Settings" sub="Your admin account." />
      <Card className="max-w-lg p-6">
        <h3 className="mb-1 font-serif text-lg text-slate-900 dark:text-white">Change password</h3>
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          Set a strong password you don’t use elsewhere. Do this on first login to replace the seeded default.
        </p>

        {done ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            ✓ Password updated. Use it next time you sign in.
          </div>
        ) : null}

        <div className="space-y-3">
          <Field label="Current password"><Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" /></Field>
          <Field label="New password" hint="At least 8 characters"><Input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" /></Field>
          <Field label="Confirm new password"><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" /></Field>
        </div>
        {err ? <p className="mt-3 text-sm text-rose-600">{err}</p> : null}
        <div className="mt-5">
          <Button loading={busy} disabled={!valid} onClick={submit}>Update password</Button>
        </div>
      </Card>
    </div>
  );
}
