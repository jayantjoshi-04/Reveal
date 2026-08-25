/** The report — the REVEAL 2.0.0 deterministic reading of the student's survey. */
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api.js';
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-noir">
      <TopBar doc="Design Signature" />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
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
