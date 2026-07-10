import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { Card, Skeleton, Badge } from '../../components/ui.js';
import { AdminPageHeader } from './AdminLayout.js';

export function StudentDirectory(): JSX.Element {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-students'], queryFn: () => api.adminStudents() });
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' }) => api.setStudentStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-students'] }),
  });

  return (
    <div className="animate-fade-in">
      <AdminPageHeader title="Students" sub="Master directory — accounts, metadata, and status." />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left font-mono text-[10px] uppercase tracking-widest text-slate-400">
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Domain</th>
                <th className="px-5 py-3">Progress</th>
                <th className="px-5 py-3">Account</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [0, 1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-slate-50"><td className="px-5 py-4" colSpan={5}><Skeleton className="h-6" /></td></tr>
                ))
              ) : data && data.length ? (
                data.map((s) => (
                  <tr key={s.student_id} className="border-b border-slate-50 transition-colors hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-900">{s.name}</div>
                      <div className="text-xs text-slate-400">{s.email}{s.username ? ` · @${s.username}` : ''}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{s.domain_of_interest ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={s.latest_status === 'released' ? 'green' : s.latest_status === 'capture_complete' ? 'amber' : 'slate'}>
                        {s.latest_status ? s.latest_status.replace(/_/g, ' ') : 'not started'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={s.account_status === 'active' ? 'green' : 'rose'}>{s.account_status}</Badge>
                      {!s.email_verified ? <span className="ml-2 text-xs text-amber-600">unverified</span> : null}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        className="text-xs font-medium text-slate-500 hover:text-slate-900"
                        onClick={() => setStatus.mutate({ id: s.student_id, status: s.account_status === 'active' ? 'suspended' : 'active' })}
                      >
                        {s.account_status === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td className="px-5 py-8 text-center text-slate-400" colSpan={5}>No students yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
