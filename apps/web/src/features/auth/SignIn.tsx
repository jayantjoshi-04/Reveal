import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthShell } from './AuthShell.js';
import { RingCard, Button, Input, Field } from '../../components/ui.js';
import { api, ApiError } from '../../lib/api.js';
import { useAuth } from '../../store/auth.js';

export function SignIn(): JSX.Element {
  const nav = useNavigate();
  const { signIn } = useAuth();
  const [identifier, setId] = useState('');
  const [password, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(): Promise<void> {
    setErr(null);
    setBusy(true);
    try {
      const { token, student } = await api.signin(identifier, password);
      signIn('student', student.name, token);
      nav('/dashboard');
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <RingCard innerClassName="p-7">
        <h2 className="font-serif text-2xl text-slate-900">Welcome back</h2>
        <p className="mb-6 mt-1 text-sm text-slate-500">Sign in to continue your Design Signature.</p>
        <div className="space-y-4">
          <Field label="Email or username"><Input value={identifier} onChange={(e) => setId(e.target.value)} placeholder="you@school.edu" autoFocus onKeyDown={(e) => e.key === 'Enter' && submit()} /></Field>
          <Field label="Password"><Input type="password" value={password} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" onKeyDown={(e) => e.key === 'Enter' && submit()} /></Field>
          {err ? <p className="text-sm text-rose-600">{err}</p> : null}
          <Button className="w-full" loading={busy} disabled={!identifier || !password} onClick={submit}>Sign in</Button>
        </div>
        <p className="mt-6 text-center text-[13px] text-slate-400">
          New here? <Link to="/signup" className="font-medium text-accent hover:underline">Create an account</Link>
        </p>
      </RingCard>
    </AuthShell>
  );
}
