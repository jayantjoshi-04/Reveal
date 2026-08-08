/**
 * V2 quick studio — a compact capture that feeds the deterministic engine.
 *
 * A slider per construct becomes a behavioural signal; the engine scores it
 * exactly as it would a full 30-activity session. (The full archetype screens
 * are the next build; this proves the pipeline end-to-end and is fully live.)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v2, type V2Response, type V2Signal } from '../../lib/v2.js';
import { VersionToggle } from '../../components/VersionToggle.js';
import { LogoLink } from '../../components/Logo.js';

interface Amount {
  id: string;
  label: string;
  kind: 'amount';
  value: number;
}
interface Bipolar {
  id: string;
  low: string;
  high: string;
  kind: 'bipolar';
  value: number; // −100..100
}
type Field = Amount | Bipolar;

const initialFields: Field[] = [
  { id: 'Empathy', label: 'Empathy', kind: 'amount', value: 72 },
  { id: 'Conviction', label: 'Conviction', kind: 'amount', value: 78 },
  { id: 'Analytical', label: 'Analytical', kind: 'amount', value: 64 },
  { id: 'Systems', label: 'Systems', kind: 'amount', value: 52 },
  { id: 'Aesthetic', label: 'Aesthetic', kind: 'amount', value: 50 },
  { id: 'Narrative', label: 'Narrative', kind: 'amount', value: 55 },
  { id: 'Research', label: 'Research (capability)', kind: 'amount', value: 64 },
  { id: 'Digital/Intx', label: 'Digital / interaction', kind: 'amount', value: 45 },
  { id: 'Making', label: 'Making', kind: 'amount', value: 40 },
  { id: 'Deep↔Broad', low: 'Deep', high: 'Broad', kind: 'bipolar', value: -60 },
  { id: 'Bold↔Careful', low: 'Bold', high: 'Careful', kind: 'bipolar', value: 55 },
  { id: 'Insul↔Feedback', low: 'Insulated', high: 'Feedback', kind: 'bipolar', value: 68 },
  { id: 'Blame↔Safe', low: 'Blame', high: 'Safe', kind: 'bipolar', value: 50 },
  { id: 'Craft↔Velocity', low: 'Craft', high: 'Velocity', kind: 'bipolar', value: -58 },
];

const EDGE: Record<string, { low: string; high: string }> = {
  'Deep↔Broad': { low: 'Deep', high: 'Broad' },
  'Bold↔Careful': { low: 'Bold', high: 'Careful' },
  'Insul↔Feedback': { low: 'Insul', high: 'Feedback' },
  'Blame↔Safe': { low: 'Blame', high: 'Safe' },
  'Craft↔Velocity': { low: 'Craft', high: 'Velocity' },
};

export function V2Capture(): JSX.Element {
  const nav = useNavigate();
  const [name, setName] = useState('A design student');
  const [enrolledField, setEnrolledField] = useState('Industrial Design');
  const [empathyClaim, setEmpathyClaim] = useState(13); // self-report → drives the say↔do surprise
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (id: string, value: number): void => setFields((f) => f.map((x) => (x.id === id ? { ...x, value } : x)));

  const build = (): V2Response[] => {
    const acts = ['A1', 'A3', 'B2']; // spread over distinct activities → evidence count
    const responses: V2Response[] = [];
    for (const f of fields) {
      if (f.kind === 'amount') {
        acts.forEach((a) => responses.push({ activityId: a, channel: 'do', rawPayload: { signals: [{ constructId: f.id, channel: 'do', value: f.value }] } }));
      } else {
        const e = EDGE[f.id]!;
        const edge = f.value >= 0 ? e.high : e.low;
        ['A1', 'F1'].forEach((a) =>
          responses.push({ activityId: a, channel: 'do', rawPayload: { signals: [{ constructId: f.id, channel: 'do', value: f.value, position: f.value, edge } as V2Signal] } }),
        );
      }
    }
    // Empathy self-claim on the say channel → the say↔do surprise
    responses.push({ activityId: 'U1', channel: 'say', rawPayload: { signals: [{ constructId: 'Empathy', channel: 'say', value: empathyClaim }] } });
    return responses;
  };

  const generate = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const { instanceId } = await v2.createInstance({ name, enrolledField, track: 'physical' });
      await v2.submitResponses(instanceId, { responses: build(), factual: { tools: true, deadlines: true } });
      await v2.generate(instanceId);
      nav(`/v2/report/${instanceId}`);
    } catch (e) {
      setError(String((e as Error).message ?? e));
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f2fb] text-slate-900 dark:bg-noir dark:text-white">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
        <LogoLink markClass="h-6 w-6" wordClass="text-[18px]" />
        <VersionToggle />
      </header>
      <main className="mx-auto max-w-2xl px-6 pb-24">
        <h1 className="font-serif text-3xl text-slate-900 dark:text-white">Quick studio</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Dial in a reading and run the live engine. Each slider is a behavioural signal; the deterministic pipeline does the rest.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-slate-500 dark:text-slate-400">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04] dark:text-white" />
          </label>
          <label className="text-sm">
            <span className="text-slate-500 dark:text-slate-400">Enrolled field</span>
            <input value={enrolledField} onChange={(e) => setEnrolledField(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04] dark:text-white" />
          </label>
        </div>

        <div className="mt-8 space-y-5">
          {fields.map((f) => (
            <div key={f.id}>
              <div className="mb-1 flex justify-between text-[13px]">
                {f.kind === 'amount' ? (
                  <>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{f.label}</span>
                    <span className="font-mono text-slate-400">{f.value}</span>
                  </>
                ) : (
                  <>
                    <span className="text-slate-500 dark:text-slate-400">{f.low}</span>
                    <span className="font-mono text-slate-400">{f.value > 0 ? '+' : ''}{f.value}</span>
                    <span className="text-slate-500 dark:text-slate-400">{f.high}</span>
                  </>
                )}
              </div>
              <input
                type="range"
                min={f.kind === 'amount' ? 0 : -100}
                max={100}
                value={f.value}
                onChange={(e) => set(f.id, Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          ))}

          <div className="rounded-xl border border-signature/30 bg-signature-soft/60 p-4 dark:bg-signature/10">
            <div className="mb-1 flex justify-between text-[13px]">
              <span className="font-medium text-slate-700 dark:text-slate-200">Empathy — how much you’d <em>say</em> you rely on it</span>
              <span className="font-mono text-slate-400">{empathyClaim}</span>
            </div>
            <input type="range" min={0} max={100} value={empathyClaim} onChange={(e) => setEmpathyClaim(Number(e.target.value))} className="w-full accent-accent" />
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Set this well below the Empathy slider to see the say↔do surprise fire.</p>
          </div>
        </div>

        {error ? <p className="mt-5 text-sm text-rose-500">{error}</p> : null}

        <div className="mt-8 flex gap-3">
          <button onClick={generate} disabled={busy} className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-accent-dark disabled:opacity-50">
            {busy ? 'Running the engine…' : 'Generate my reading'}
          </button>
          <button onClick={() => nav('/v2')} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 dark:border-white/15 dark:text-slate-300">
            ← Back
          </button>
        </div>
      </main>
    </div>
  );
}
