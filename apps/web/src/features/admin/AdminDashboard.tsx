import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { TopBar } from '../../components/TopBar.js';

export function AdminDashboard(): JSX.Element {
  const aItems = useQuery({ queryKey: ['a-items'], queryFn: () => api.content<unknown[]>('a-items') });
  const bTasks = useQuery({ queryKey: ['b-tasks'], queryFn: () => api.content<unknown[]>('b-tasks') });
  const artifacts = useQuery({ queryKey: ['artifacts'], queryFn: () => api.content<unknown[]>('artifacts') });

  const stats = [
    { n: aItems.data?.length ?? '·', l: 'A1 items' },
    { n: bTasks.data?.length ?? '·', l: 'B tasks' },
    { n: artifacts.data?.length ?? '·', l: 'artifacts' },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      <TopBar doc="Admin" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="eyebrow mb-2">Instrument</div>
        <h1 className="mb-1 font-serif text-3xl">Build &amp; tune the instrument</h1>
        <p className="mb-6 text-sm text-mid">Version 1.0 · live</p>
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.l} className="card text-center">
              <div className="font-serif text-3xl text-orange">{s.n}</div>
              <div className="font-mono text-[10px] uppercase tracking-wide text-mid">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 card">
          <div className="font-mono text-[10px] uppercase tracking-wide text-mid">Editable without a developer</div>
          <p className="mt-2 text-sm text-mid">
            A · questions &amp; tags · B · task parameters · the 40-artifact image library · the B6 rubric &amp; scoring
            constants · report engine run controls. The <span className="font-mono text-xs">rerun-scoring</span> endpoint
            re-computes every stored capture at the current constants.
          </p>
        </div>
      </div>
    </div>
  );
}
