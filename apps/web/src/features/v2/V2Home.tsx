/** V2 landing — the deterministic-engine experience entry point. */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v2, type V2Catalog } from '../../lib/v2.js';
import { VersionToggle } from '../../components/VersionToggle.js';
import { LogoLink } from '../../components/Logo.js';

export function V2Home(): JSX.Element {
  const nav = useNavigate();
  const [catalog, setCatalog] = useState<V2Catalog | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    v2.catalog().then(setCatalog).catch((e) => setError(String(e.message ?? e)));
  }, []);

  const runSample = async (): Promise<void> => {
    setBusy('sample');
    setError(null);
    try {
      const { instanceId } = await v2.createInstance({ name: 'Jaanhvi Hiremath', enrolledField: 'Industrial Design', track: 'physical' });
      await v2.loadSample(instanceId);
      await v2.generate(instanceId);
      nav(`/v2/report/${instanceId}`);
    } catch (e) {
      setError(String((e as Error).message ?? e));
      setBusy(null);
    }
  };

  const counts = catalog?.counts;

  return (
    <div className="min-h-screen bg-[#f3f2fb] text-slate-900 dark:bg-noir dark:text-white">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
        <LogoLink markClass="h-6 w-6" wordClass="text-[18px]" />
        <VersionToggle />
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-20">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">REVEAL 2.0.0 · deterministic engine</div>
        <h1 className="mt-2 max-w-2xl font-serif text-4xl leading-tight text-slate-900 dark:text-white">
          A reading of how you design — computed, not guessed.
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
          Version 2 rebuilds REVEAL on a nine-stage deterministic pipeline. Same answers, same reading — every time, for
          every student. No AI sits between what you did and what the report says.
        </p>

        {/* engine status */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ['Constructs', counts?.constructs],
            ['Roles', counts?.roles],
            ['Domains', counts?.domains],
            ['Molecules', counts?.molecules],
            ['Growth', counts?.growth],
          ].map(([label, n]) => (
            <div key={label as string} className="rounded-2xl border border-slate-200 bg-white p-4 text-center dark:border-white/10 dark:bg-white/[0.04]">
              <div className="text-2xl font-semibold text-slate-900 dark:text-white">{n ?? '—'}</div>
              <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        {error ? <p className="mt-6 text-sm text-rose-500">{error}</p> : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={runSample}
            disabled={busy !== null}
            className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-accent-dark disabled:opacity-50"
          >
            {busy === 'sample' ? 'Running the engine…' : 'See the reference reading (Jaanhvi)'}
          </button>
          <button
            onClick={() => nav('/v2/capture')}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 dark:border-white/15 dark:text-slate-200 dark:hover:border-white/30"
          >
            Build a quick reading →
          </button>
        </div>

        <p className="mt-4 text-[12px] text-slate-400">
          The reference reading runs the pinned Jaanhvi capture through the live engine: Conviction leads, Empathy is the
          say↔do surprise, and her enrolled field is shown honestly wherever it ranks.
        </p>

        {/* how it works */}
        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {[
            ['Capture', 'You move through studio activities. Every response is stored verbatim — write-once, never re-judged.'],
            ['The engine', 'Nine deterministic stages turn raw capture into a reading: derivation → aggregation → molecules → proximity → readiness → growth → findings → assembly.'],
            ['The reading', 'A ten-region report bound field-for-field to the engine’s output. Undetermined items become open questions, never headlines.'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">{t}</div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
