/** The report — the REVEAL 2.0.0 deterministic reading of the student's survey. */
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, ApiError, type Comparison } from '../../lib/api.js';
import { TopBar } from '../../components/TopBar.js';
import { V2ReportView } from '../v2/V2ReportView.js';

export function ReportPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['report', id],
    queryFn: () => api.surveyReport(id!),
    enabled: !!id,
    retry: (n, e) => !(e instanceof ApiError && e.status === 404) && n < 2,
  });
  const isRerun = !!data && !data.meta.is_first_reading;
  const { data: cmp } = useQuery({
    queryKey: ['comparison', id],
    queryFn: () => api.surveyComparison(id!),
    enabled: !!id && isRerun,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-noir">
      <TopBar doc="Design Signature" />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {isRerun && cmp?.comparison ? <ComparisonCard c={cmp.comparison} /> : null}
        <div className="rounded-[28px] bg-gradient-to-br from-accent/25 via-violet-400/15 to-transparent p-px shadow-lift">
          <div className="overflow-hidden rounded-[27px] border border-slate-200/60 bg-white dark:border-white/10 dark:bg-noir-card">
            {isLoading ? (
              <p className="p-12 text-sm text-slate-500 dark:text-slate-400">Compiling your reading…</p>
            ) : error ? (
              <p className="p-12 text-sm text-slate-500 dark:text-slate-400">
                {error instanceof ApiError && error.status === 404
                  ? 'This reading isn’t ready yet. Finish the survey to generate it.'
                  : 'Could not load the report.'}
              </p>
            ) : data ? (
              <V2ReportView payload={data} />
            ) : (
              <p className="p-12 text-slate-500 dark:text-slate-400">—</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** "Since your last reading" — the honest re-run diff (stage 9). */
function ComparisonCard({ c }: { c: Comparison }): JSX.Element {
  const readinessMoved = Object.entries(c.readinessMovement).filter(([, v]) => Math.abs(v) >= 5);
  return (
    <div className="mb-4 rounded-[24px] border border-accent/30 bg-accent-soft p-6 dark:border-accent/25 dark:bg-accent/10">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Since your last reading</div>
      {c.nullResultFlag ? (
        <p className="mt-2 text-[15px] text-slate-700 dark:text-slate-200">
          Nothing crossed the meaningful-change line — steady, not stalled. Below the threshold is measurement noise, so we don’t narrate it as growth.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {c.movedConstructs.length ? (
            <div className="flex flex-wrap gap-2">
              {c.movedConstructs.slice(0, 8).map((m) => (
                <span key={m.construct} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-medium ${m.direction === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'}`}>
                  {m.direction === 'up' ? '↑' : '↓'} {m.construct} <span className="font-mono opacity-70">{m.delta > 0 ? '+' : ''}{Math.round(m.delta)}</span>
                </span>
              ))}
            </div>
          ) : null}
          {c.moleculesGained.length ? <p className="text-[13.5px] text-slate-600 dark:text-slate-300"><b className="text-slate-800 dark:text-slate-100">New this time:</b> {c.moleculesGained.join(', ')}</p> : null}
          {c.moleculesLost.length ? <p className="text-[13.5px] text-slate-600 dark:text-slate-300"><b className="text-slate-800 dark:text-slate-100">No longer showing:</b> {c.moleculesLost.join(', ')}</p> : null}
          {readinessMoved.length ? (
            <p className="text-[13.5px] text-slate-600 dark:text-slate-300">
              <b className="text-slate-800 dark:text-slate-100">Readiness:</b> {readinessMoved.map(([d, v]) => `${d.replace(/_/g, ' ')} ${v > 0 ? '+' : ''}${Math.round(v)}`).join(' · ')}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
