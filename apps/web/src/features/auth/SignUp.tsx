import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthShell } from './AuthShell.js';
import { Card, Button, Input, Select, Field } from '../../components/ui.js';
import { api, ApiError } from '../../lib/api.js';
import { useAuth } from '../../store/auth.js';

const DOMAINS = ['Product design', 'UX / interaction', 'Visual / graphic', 'Service design', 'Industrial design', 'Branding', 'Motion', 'Undecided'];

export function SignUp(): JSX.Element {
  const nav = useNavigate();
  const { signIn } = useAuth();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | undefined>();
  const [code, setCode] = useState('');
  const [f, setF] = useState({ name: '', gender: '', dob: '', institution: '', domain_of_interest: '', email: '', username: '', password: '' });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const steps = ['Identity', 'Background', 'Account', 'Verify'];

  async function createAccount(): Promise<void> {
    setErr(null);
    setBusy(true);
    try {
      const res = await api.signup(f);
      setDevCode(res.devVerificationCode);
      if (res.devVerificationCode) setCode(res.devVerificationCode);
      setStep(3);
    } catch (e) {
      setErr(e instanceof ApiError ? (e.issues?.join(' · ') ?? e.message) : 'Could not create account');
    } finally {
      setBusy(false);
    }
  }

  async function verifyAndEnter(): Promise<void> {
    setErr(null);
    setBusy(true);
    try {
      await api.verify(f.email, code);
      const { token, student } = await api.signin(f.email, f.password);
      signIn('student', student.name, token);
      nav('/onboarding');
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Verification failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <Card className="p-7">
        {/* progress */}
        <div className="mb-6 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col gap-1.5">
              <div className={`h-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-accent' : 'bg-slate-200'}`} />
              <span className={`text-[10px] font-medium uppercase tracking-wide ${i === step ? 'text-accent' : 'text-slate-400'}`}>{s}</span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="animate-fade-in space-y-4">
            <h2 className="font-serif text-2xl text-slate-900">Let’s start with you</h2>
            <Field label="Full name"><Input value={f.name} onChange={set('name')} placeholder="Jaanhvi Hiremath" autoFocus /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Gender">
                <Select value={f.gender} onChange={set('gender')}>
                  <option value="">Select…</option>
                  <option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option>
                </Select>
              </Field>
              <Field label="Date of birth"><Input type="date" value={f.dob} onChange={set('dob')} /></Field>
            </div>
            <Button className="w-full" disabled={!f.name.trim()} onClick={() => setStep(1)}>Continue</Button>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in space-y-4">
            <h2 className="font-serif text-2xl text-slate-900">Your background</h2>
            <Field label="Institution studied"><Input value={f.institution} onChange={set('institution')} placeholder="National Institute of Design" /></Field>
            <Field label="Domain of interest">
              <Select value={f.domain_of_interest} onChange={set('domain_of_interest')}>
                <option value="">Select…</option>
                {DOMAINS.map((d) => <option key={d}>{d}</option>)}
              </Select>
            </Field>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setStep(0)}>Back</Button>
              <Button className="flex-1" onClick={() => setStep(2)}>Continue</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in space-y-4">
            <h2 className="font-serif text-2xl text-slate-900">Create your login</h2>
            <Field label="Email"><Input type="email" value={f.email} onChange={set('email')} placeholder="you@school.edu" /></Field>
            <Field label="Username" hint="Letters, numbers, _ or . — at least 3 characters"><Input value={f.username} onChange={set('username')} placeholder="jaanhvi" /></Field>
            <Field label="Password" hint="At least 8 characters"><Input type="password" value={f.password} onChange={set('password')} placeholder="••••••••" /></Field>
            {err ? <p className="text-sm text-rose-600">{err}</p> : null}
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1" loading={busy} disabled={!f.email || f.username.length < 3 || f.password.length < 8} onClick={createAccount}>Create account</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in space-y-4">
            <h2 className="font-serif text-2xl text-slate-900">Verify your email</h2>
            <p className="text-sm text-slate-500">We sent a 6-digit code to <b className="text-slate-700">{f.email}</b>. Enter it to continue.</p>
            {devCode ? <p className="rounded-lg bg-accent-soft px-3 py-2 text-xs text-accent-dark">Dev mode — your code is <b>{devCode}</b> (auto-filled).</p> : null}
            <Field label="Verification code"><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" inputMode="numeric" /></Field>
            {err ? <p className="text-sm text-rose-600">{err}</p> : null}
            <Button className="w-full" loading={busy} disabled={code.length < 6} onClick={verifyAndEnter}>Verify & continue</Button>
          </div>
        )}

        <p className="mt-6 text-center text-[13px] text-slate-400">
          Already have an account? <Link to="/signin" className="font-medium text-accent hover:underline">Sign in</Link>
        </p>
      </Card>
    </AuthShell>
  );
}
