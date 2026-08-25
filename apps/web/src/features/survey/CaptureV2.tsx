/**
 * The native REVEAL 2.0.0 survey — walks the 30-activity battery in its five
 * blocks, saving each answer and resuming exactly where the student left off.
 * On completion it runs the deterministic engine and opens the report.
 */
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, ApiError, type SurveyActivity } from '../../lib/api.js';
import { LogoLink } from '../../components/Logo.js';
import { SurveyFrame, type RawPayload } from './shell.js';
import { ReactionActivity } from './ReactionActivity.js';
import { TapScene, Allocation, Duel, Arrange, PickMenu, Fork, ColdOpen, Compose, Upload } from './behavioural.js';

const REGISTRY: Record<string, (p: import('./shell.js').ArchetypeProps) => JSX.Element> = {
  reaction: ReactionActivity, picks: ReactionActivity,
  tapscene: TapScene, allocation: Allocation, duel: Duel, arrange: Arrange,
  pickmenu: PickMenu, fork: Fork, coldopen: ColdOpen, compose: Compose, upload: Upload,
};

export function CaptureV2(): JSX.Element {
  const nav = useNavigate();
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    api.surveyStart().then((r) => setInstanceId(r.instanceId)).catch((e) => setError(String((e as Error).message ?? e)));
  }, []);

  const { data: state, refetch, isLoading } = useQuery({
    queryKey: ['survey', instanceId],
    queryFn: () => api.surveyState(instanceId!),
    enabled: !!instanceId,
  });

  async function submit(activityId: string, payload: RawPayload): Promise<void> {
    if (!instanceId) return;
    setBusy(true); setError(null);
    try {
      await api.surveySubmit(instanceId, activityId, payload);
      await refetch();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't save your answer. Please try again.");
    } finally { setBusy(false); }
  }

  async function complete(): Promise<void> {
    if (!instanceId) return;
    setCompleting(true); setError(null);
    try {
      await api.surveyComplete(instanceId);
      nav(`/report/${instanceId}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not generate your report.');
      setCompleting(false);
    }
  }

  const current: SurveyActivity | undefined = state?.activities.find((a) => a.id === state.cursor);
  const blockTitle = state ? (state.blocks.find((b) => b.activities.includes(state.cursor ?? ''))?.title ?? 'Almost done') : '';
  const answered = state ? Object.keys(state.answered).length : 0;
  const total = state?.activities.length ?? 30;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-noir">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-noir-2/70">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3.5">
          <LogoLink markClass="h-5 w-5" wordClass="text-[16px]" />
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">REVEAL 2.0 · studio</span>
            <button className="text-[13px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" onClick={() => nav('/dashboard')}>Save & exit</button>
          </div>
        </div>
      </header>

      <div className="flex flex-col items-center px-4 py-8 sm:py-12">
        {error ? (
          <div className="mb-4 w-full max-w-xl rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300"><b>Couldn’t save.</b> {error}</div>
        ) : null}

        {isLoading || !state ? (
          <div className="w-full max-w-xl">
            <div className="mb-5 h-1.5 w-full animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
            <div className="h-96 animate-pulse rounded-3xl bg-slate-200/70 dark:bg-white/5" />
          </div>
        ) : state.status !== 'in_progress' ? (
          <Navigate to={`/report/${instanceId}`} replace />
        ) : current ? (
          <SurveyFrame blockTitle={blockTitle} step={answered + 1} total={total}>
            {(() => {
              const Comp = REGISTRY[current.archetype] ?? ReactionActivity;
              return <Comp activity={current} initial={state.answered[current.id] as RawPayload | undefined} busy={busy} onSubmit={(p) => submit(current.id, p)} />;
            })()}
          </SurveyFrame>
        ) : (
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-card dark:border-white/10 dark:bg-noir-card">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-2xl dark:bg-accent/15">✦</div>
            <h2 className="font-serif text-2xl text-slate-900 dark:text-white">That’s the whole studio session.</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">The engine will read your {answered} answers and compile your reading — deterministically, no AI in the loop.</p>
            <button onClick={complete} disabled={completing} className="press mt-6 w-full rounded-2xl bg-accent py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark disabled:opacity-40">
              {completing ? 'Running the engine…' : 'See my reading →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
