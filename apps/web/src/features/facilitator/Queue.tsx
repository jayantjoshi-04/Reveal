import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { TopBar } from '../../components/TopBar.js';

export function Queue(): JSX.Element {
  const [tab, setTab] = useState<'to_review' | 'approved'>('to_review');
  const nav = useNavigate();
  const { data: items, isLoading } = useQuery({ queryKey: ['queue', tab], queryFn: () => api.queue(tab) });

  return (
    <div className="min-h-screen bg-canvas">
      <TopBar doc="Facilitator" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex gap-2">
          {(['to_review', 'approved'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${tab === t ? 'bg-ink text-white' : 'border border-rule text-mid'}`}
            >
              {t === 'to_review' ? 'To review' : 'Approved'}
            </button>
          ))}
        </div>

        <h1 className="mb-1 font-serif text-2xl">{tab === 'to_review' ? 'To review' : 'Approved'}</h1>
        <p className="mb-5 text-sm text-mid">
          {tab === 'to_review'
            ? 'Capture complete — awaiting a quality check before the report is generated.'
            : 'Reports generated and released to students.'}
        </p>

        {isLoading ? (
          <p className="text-sm text-mid">Loading…</p>
        ) : !items || items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-rule p-8 text-center text-sm text-mid">
            Nothing here yet.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((it) => (
              <button
                key={it.instance_id}
                onClick={() => nav(`/facilitator/${it.instance_id}`)}
                className="flex w-full items-center justify-between rounded-xl border border-rule bg-white px-4 py-3 text-left transition hover:border-orange"
              >
                <span className="text-sm font-medium">{it.student_name}</span>
                <span className="flex gap-2">
                  {it.surprise_count > 0 ? (
                    <span className="chip bg-[#fbe6f1] text-mag">{it.surprise_count} surprise{it.surprise_count > 1 ? 's' : ''}</span>
                  ) : null}
                  {it.coherence_flag ? <span className="chip bg-orange-bg text-orange">coherence flag</span> : null}
                  {it.clean ? <span className="chip bg-[#efece6] text-mid">clean</span> : null}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
