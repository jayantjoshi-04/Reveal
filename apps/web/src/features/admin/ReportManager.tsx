/** Admin · generated V2 readings (read-only). The engine auto-generates on
 *  survey completion — there's no approval step. */
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { Card, Skeleton, Badge, Button } from '../../components/ui.js';
import { AdminPageHeader } from './AdminLayout.js';

export function ReportManager(): JSX.Element {
  const nav = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ['admin-reports'], queryFn: () => api.adminReports() });

  return (
    <div className="animate-fade-in">
      <AdminPageHeader title="Reports" sub="Every reading the engine has generated. Deterministic — no approval step." />
      {isLoading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
      ) : !data?.length ? (
        <Card className="p-10 text-center">
          <div className="font-serif text-xl text-slate-900 dark:text-white">No readings yet</div>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">Readings appear here as students finish the studio session.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.map((r) => {
            const ready = r.status === 'generated' || r.status === 'archived';
            return (
              <Card key={r.instance_id} className="flex items-center justify-between gap-4 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-slate-900 dark:text-white">{r.student_name}</span>
                    <Badge tone={ready ? 'green' : 'slate'}>{ready ? 'Generated' : 'In progress'}</Badge>
                    <Badge tone="slate">{r.tier}</Badge>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-slate-400">{r.generated_at ? `generated ${new Date(r.generated_at).toLocaleString()}` : 'not yet generated'}</div>
                </div>
                {ready ? <Button variant="ghost" onClick={() => nav(`/report/${r.instance_id}`)}>Open →</Button> : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
