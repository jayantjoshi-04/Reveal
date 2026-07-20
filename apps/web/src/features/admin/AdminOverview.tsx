import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { Card, Skeleton } from '../../components/ui.js';
import { AdminPageHeader } from './AdminLayout.js';

export function AdminOverview(): JSX.Element {
  const { data, isLoading } = useQuery({ queryKey: ['admin-overview'], queryFn: () => api.adminOverview() });

  const tiles = [
    { label: 'Students', value: data?.students, accent: true },
    { label: 'Awaiting review', value: data?.to_review, accent: true },
    { label: 'Released', value: data?.released },
    { label: 'A · questions', value: data?.a_items },
    { label: 'B · tasks', value: data?.b_tasks },
    { label: 'Artifacts', value: data?.artifacts },
  ];

  return (
    <div className="animate-fade-in">
      <AdminPageHeader title="Overview" sub="Instrument version 1.0 · live" />
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
          This portal is the GUI over the database. Use <b className="text-slate-700 dark:text-slate-200">Questionnaire</b> to add, edit, or
          remove questions and their tags; <b className="text-slate-700 dark:text-slate-200">Reports</b> to approve or reject student
          submissions (approval triggers the single report-generation pass); and{' '}
          <b className="text-slate-700 dark:text-slate-200">Students</b> to manage accounts and statuses.
        </p>
      </Card>
    </div>
  );
}
