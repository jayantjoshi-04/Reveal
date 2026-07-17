import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthShell } from './AuthShell.js';
import { RingCard, Button, Input, Field } from '../../components/ui.js';
import { api, ApiError } from '../../lib/api.js';
import { useAuth } from '../../store/auth.js';

export function AdminSignIn(): JSX.Element {
  const nav = useNavigate();
  const { signIn } = useAuth();
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(): Promise<void> {
    setErr(null);
    setBusy(true);
    try {
      const { token, admin } = await api.adminSignin(username, password);
      signIn('admin', admin.name, token);
      nav('/admin');
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <RingCard innerClassName="p-7">
        <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-white">⚙ Admin</div>
        <h2 className="mt-3 font-serif text-2xl text-slate-900">Admin sign in</h2>
        <p className="mb-6 mt-1 text-sm text-slate-500">Access the instrument, reports, and student directory.</p>
        <div className="space-y-4">
          <Field label="Username"><Input value={username} onChange={(e) => setU(e.target.value)} placeholder="jahaanvi" autoFocus onKeyDown={(e) => e.key === 'Enter' && submit()} /></Field>
          <Field label="Password"><Input type="password" value={password} onChange={(e) => setP(e.target.value)} placeholder="••••••••" onKeyDown={(e) => e.key === 'Enter' && submit()} /></Field>
          {err ? <p className="text-sm text-rose-600">{err}</p> : null}
          <Button className="w-full" loading={busy} disabled={!username || !password} onClick={submit}>Sign in</Button>
        </div>
        <p className="mt-6 text-center text-[13px] text-slate-400">
          Not an admin? <Link to="/" className="font-medium text-accent hover:underline">Back to start</Link>
        </p>
      </RingCard>
    </AuthShell>
  );
}
