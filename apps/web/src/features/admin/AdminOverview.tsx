import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { Card, Skeleton } from '../../components/ui.js';
import { AdminPageHeader } from './AdminLayout.js';

export function AdminOverview(): JSX.Element {
  const { data, isLoading } = useQuery({ queryKey: ['admin-overview'], queryFn: () => api.adminOverview() });

  const tiles = [
    { label: 'Students', value: data?.students, accent: true },
    { label: 'Instances', value: data?.instances },
    { label: 'Reports generated', value: data?.reports_generated, accent: true },
  ];

  return (
    <div className="animate-fade-in">
      <AdminPageHeader title="Overview" sub={`REVEAL engine ${data?.ruleset ?? '2.0.0'} · deterministic`} />
      <div className="grid gap-4 sm:grid-cols-3">
        {tiles.map((t) => (
          <Card key={t.label} className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400">{t.label}</div>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-12" />
            ) : (
              <div className={`mt-1 font-serif text-3xl ${t.accent ? 'text-accent' : 'text-slate-900 dark:text-white'}`}>{t.value ?? 0}</div>
            )}
          </Card>
        ))}
      </div>
      <Card className="mt-6 p-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400">The admin console</div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          The REVEAL 2.0 engine is deterministic and generates each reading automatically when a student completes the
          studio session — no manual approval step. Use <b className="text-slate-700 dark:text-slate-200">Reports</b> to view
          generated readings, and <b className="text-slate-700 dark:text-slate-200">Students</b> to manage accounts.
        </p>
      </Card>
    </div>
  );
}
