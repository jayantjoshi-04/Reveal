import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../../lib/api.js';
import { useAuth } from '../../store/auth.js';

export function Landing(): JSX.Element {
  const nav = useNavigate();
  const { signIn, setInstance } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cohort, setCohort] = useState('7');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function startAsStudent(): Promise<void> {
    setErr(null);
    setBusy(true);
    try {
      const { token } = await api.signInStudent({ name, email, cohort });
      signIn('student', name, token);
      const state = await api.startInstance();
      setInstance(state.instance_id);
      nav('/capture');
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Could not start');
    } finally {
      setBusy(false);
    }
  }

  async function staff(kind: 'facilitator' | 'admin'): Promise<void> {
    setErr(null);
    setBusy(true);
    try {
      const email2 = kind === 'facilitator' ? 'facilitator@reveal.test' : 'admin@reveal.test';
      const { token, staff } = await api.signInStaff(email2);
      signIn(staff.role as 'facilitator' | 'admin', staff.name, token);
      nav(kind === 'facilitator' ? '/facilitator' : '/admin');
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="relative overflow-hidden bg-ink px-6 py-14 md:px-10">
        <div className="absolute left-0 right-0 top-0 h-[3px] bg-orange" />
        <div className="mx-auto max-w-3xl">
          <div className="eyebrow mb-4">Reveal · Ingenium · dventurelabs</div>
          <h1 className="max-w-[18ch] font-serif text-4xl leading-[1.04] text-white md:text-5xl">
            See the designer your <span className="italic text-orange">work already shows.</span>
          </h1>
          <p className="mt-4 max-w-[60ch] text-[#9a9a92]">
            REVEAL builds a picture of how you design — from what you do, not just what you say. Three short sittings,
            then a facilitator releases your Design Signature.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-3xl gap-6 px-6 py-12 md:grid-cols-2 md:px-10">
        <div className="card">
          <div className="eyebrow mb-3">Student</div>
          <h2 className="mb-4 font-serif text-2xl">Begin your reading</h2>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-dim">Name</label>
          <input className="mb-3 w-full rounded-lg border border-rule px-3 py-2 text-sm" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jaanhvi Hiremath" />
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-dim">Email</label>
          <input className="mb-3 w-full rounded-lg border border-rule px-3 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" />
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-dim">Cohort</label>
          <input className="mb-4 w-full rounded-lg border border-rule px-3 py-2 text-sm" value={cohort} onChange={(e) => setCohort(e.target.value)} />
          <button className="btn w-full" disabled={busy || !name || !email} onClick={startAsStudent}>
            Begin
          </button>
        </div>

        <div className="card">
          <div className="eyebrow mb-3">Staff · demo</div>
          <h2 className="mb-4 font-serif text-2xl">Console access</h2>
          <p className="mb-4 text-sm text-mid">
            Sign in with the seeded demo accounts to reach the facilitator review gate or the admin console.
          </p>
          <button className="btn mb-3 w-full" disabled={busy} onClick={() => staff('facilitator')}>
            Enter as Facilitator
          </button>
          <button className="btn-ghost w-full" disabled={busy} onClick={() => staff('admin')}>
            Enter as Admin
          </button>
        </div>
      </div>
      {err ? <div className="mx-auto max-w-3xl px-6 pb-10 text-sm text-mag md:px-10">{err}</div> : null}
    </div>
  );
}
