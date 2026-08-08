/**
 * V2 report — renders the REVEAL 2.0.0 payload (the 10 Layer-5 regions).
 * Presentation only: every sentence was authored upstream by the engine.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ReportPayloadV2 } from '@reveal/shared/v2';
import { v2 } from '../../lib/v2.js';
import { FloatingVersionToggle } from '../../components/VersionToggle.js';

const DOT: Record<string, string> = { evidenced: '●', well_motivated: '◐', behavioural_not_neural: '◐', plausible: '○', undetermined: '·' };

function Ring({ value, surprise }: { value: number; surprise?: boolean }): JSX.Element {
  const r = 26;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
      <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-slate-200 dark:stroke-white/10" />
      <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} className={surprise ? 'stroke-signature' : 'stroke-accent'} />
    </svg>
  );
}

function Pin({ value }: { value: number }): JSX.Element {
  const pct = (value + 100) / 2; // −100..100 → 0..100
  return (
    <div className="relative h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10">
      <div className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow" style={{ left: `${pct}%` }} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <section className="mt-10">
      <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">{title}</h2>
      {children}
    </section>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }): JSX.Element {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] ${className}`}>{children}</div>;
}

export function V2Report(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [payload, setPayload] = useState<ReportPayloadV2 | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    v2.report(id).then(setPayload).catch((e) => setError(String(e.message ?? e)));
  }, [id]);

  if (error) return <Shell><p className="text-rose-500">Couldn’t load the report: {error}</p></Shell>;
  if (!payload) return <Shell><p className="text-slate-400">Compiling…</p></Shell>;

  const p = payload;
  const shown = p.section_heading.directions;

  return (
    <Shell>
      {/* meta */}
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">REVEAL · 2.0.0 · deterministic</div>
          <h1 className="mt-1 font-serif text-3xl text-slate-900 dark:text-white">{p.meta.student_name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {p.meta.enrolled_field ? `${p.meta.enrolled_field} · ` : ''}
            {p.meta.tier} tier · {p.hero.timestamp_copy}
          </p>
        </div>
        <button onClick={() => id && v2.generate(id).then(setPayload)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] text-slate-500 hover:text-slate-800 dark:border-white/10 dark:hover:text-white">
          Re-run engine
        </button>
      </div>

      {/* how to read */}
      <Card className="mt-6">
        <p className="text-slate-700 dark:text-slate-200">{p.how_to_read.opener_text}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{p.how_to_read.you_vs_you_note}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-slate-500 dark:text-slate-400">
          {p.how_to_read.confidence_legend.map((l) => (
            <span key={l.tier}>
              <span className="mr-1 text-accent">{l.dot}</span>
              {l.label}
            </span>
          ))}
        </div>
      </Card>

      {/* hero */}
      <Section title="The designer you are today">
        <h2 className="font-serif text-2xl leading-snug text-slate-900 dark:text-white">{p.hero.headline}</h2>
        <div className="mt-5 flex flex-wrap gap-6">
          {p.hero.signature_tiles.map((t) => (
            <div key={t.label} className="flex items-center gap-3">
              <div className="relative">
                <Ring value={t.ring_value} surprise={t.is_surprise} />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-700 dark:text-slate-200">{t.ring_value}</span>
              </div>
              <span className={`text-sm font-medium ${t.is_surprise ? 'text-signature' : 'text-slate-700 dark:text-slate-200'}`}>{t.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* capacities */}
      <Section title="Capacities">
        <div className="grid gap-3 sm:grid-cols-2">
          {p.section_today.capacities.map((c) => (
            <Card key={c.construct_id} className="flex items-center gap-4">
              <div className="relative shrink-0">
                <Ring value={c.ring_value} />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200">{c.ring_value}</span>
              </div>
              <div>
                <div className="font-medium text-slate-800 dark:text-slate-100">
                  {c.name} <span className="text-accent">{DOT[c.tier]}</span>
                </div>
                <div className="text-[12px] text-slate-400">{c.value_state} · {c.tier.replace(/_/g, ' ')}</div>
                {c.evidence_tags.length ? <div className="mt-0.5 text-[11px] text-slate-400">seen in {c.evidence_tags.join(', ')}</div> : null}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* dispositions */}
      {p.section_today.dispositions.length ? (
        <Section title="How you work">
          <Card>
            <div className="space-y-4">
              {p.section_today.dispositions.map((d) => (
                <div key={d.construct_id}>
                  <div className="mb-1 flex justify-between text-[12px] text-slate-500 dark:text-slate-400">
                    <span>{d.edge_low}</span>
                    <span className="text-accent">{DOT[d.tier]}</span>
                    <span>{d.edge_high}</span>
                  </div>
                  <Pin value={d.pin_value} />
                </div>
              ))}
            </div>
          </Card>
          {p.section_today.how_you_work.map((h) => (
            <p key={h.molecule_id} className="mt-3 text-sm text-slate-600 dark:text-slate-300">{h.text}</p>
          ))}
        </Section>
      ) : null}

      {/* values */}
      {p.section_today.values.length ? (
        <Section title="What you protect">
          <div className="space-y-2">
            {p.section_today.values.map((v) => (
              <Card key={v.axis_id} className="text-sm text-slate-700 dark:text-slate-200">{v.render_text}</Card>
            ))}
          </div>
        </Section>
      ) : null}

      {/* conditions */}
      {p.section_today.conditions_card.bands.length ? (
        <Section title="The rooms that open you">
          <Card>
            <p className="mb-3 text-[12px] text-slate-400">{p.section_today.conditions_card.framing_note}</p>
            <div className="space-y-2">
              {p.section_today.conditions_card.bands.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <span className={`inline-block h-2 w-2 rounded-full ${b.state === 'opens' ? 'bg-emerald-500' : b.state === 'closes' ? 'bg-rose-500' : 'bg-slate-300'}`} />
                  <span className="text-slate-500 dark:text-slate-400">{b.room_descriptor}</span>
                </div>
              ))}
            </div>
          </Card>
        </Section>
      ) : null}

      {/* mode switch */}
      <div className="mt-12 rounded-2xl bg-slate-900 px-6 py-5 text-center font-serif text-lg text-white dark:bg-white/[0.06]">{p.mode_switch.text}</div>

      {/* directions */}
      <Section title="Directions — where you’re heading">
        <div className="space-y-3">
          {shown.map((d) => (
            <Card key={`${d.rank}-${d.role}-${d.domain}`} className={d.is_chosen ? 'ring-1 ring-accent' : ''}>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="font-mono text-[11px] text-slate-400">#{d.rank}</span>{' '}
                  <span className="font-medium text-slate-900 dark:text-white">{d.role}</span>
                  <span className="text-slate-400"> × </span>
                  <span className="text-slate-700 dark:text-slate-200">{d.domain}</span>
                  {d.is_chosen ? <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent-dark dark:bg-accent/20 dark:text-accent">chosen</span> : null}
                </div>
                <span className="font-mono text-sm text-accent">{Math.round(d.proximity_score * 100)}%</span>
              </div>
              <div className="mt-0.5 text-[12px] text-slate-400">{d.quadrant}{d.values_conflict_flag ? ' · values tension' : ''}{!d.unlocked ? ' · locked' : ''}</div>
              {d.note ? <div className="mt-1 text-[12px] italic text-signature">{d.note}</div> : null}
              {d.why_aligns?.length ? (
                <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  {d.why_aligns.map((w) => (<li key={w.molecule_id}>+ {w.text}</li>))}
                </ul>
              ) : null}
              {d.whats_hard?.length ? (
                <ul className="mt-2 space-y-1 text-sm text-slate-500 dark:text-slate-400">
                  {d.whats_hard.map((w) => (<li key={w.molecule_id}>△ {w.text}</li>))}
                </ul>
              ) : null}
            </Card>
          ))}
        </div>
      </Section>

      {/* readiness */}
      <Section title="Readiness">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {p.section_heading.readiness.map((r) => (
            <Card key={r.dimension} className="text-center">
              <div className="text-2xl font-semibold text-slate-900 dark:text-white">{r.score ?? ''}</div>
              <div className="text-[11px] capitalize text-slate-500 dark:text-slate-400">{r.dimension.replace(/_/g, ' ')}</div>
              <div className={`mt-1 text-[11px] font-medium ${r.tier === 'strong' ? 'text-emerald-500' : r.tier === 'developing' ? 'text-accent' : 'text-slate-400'}`}>{r.tier}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* capability gaps */}
      {p.section_heading.capability_gaps.length ? (
        <Section title="Capability gaps">
          <Card>
            <div className="space-y-3">
              {p.section_heading.capability_gaps.map((g) => (
                <div key={g.name}>
                  <div className="mb-1 flex justify-between text-[12px] text-slate-500 dark:text-slate-400">
                    <span>{g.name}</span>
                    <span>{g.current} → {g.desired}</span>
                  </div>
                  <div className="relative h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10">
                    <div className="absolute h-1.5 rounded-full bg-accent/30" style={{ left: `${g.current}%`, width: `${Math.max(0, g.desired - g.current)}%` }} />
                    <div className="absolute h-1.5 w-1 rounded bg-accent" style={{ left: `${g.current}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Section>
      ) : null}

      {/* growth */}
      {p.section_heading.growth.length ? (
        <Section title="Growth moves">
          <div className="space-y-3">
            {p.section_heading.growth.map((g) => (
              <Card key={g.vehicle_id}>
                <div className="flex items-baseline justify-between">
                  <span className="font-medium text-slate-900 dark:text-white">{g.title}</span>
                  <span className="font-mono text-[11px] text-slate-400">{g.vehicle_id} · {g.type}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{g.render_text}</p>
              </Card>
            ))}
          </div>
        </Section>
      ) : null}

      {/* surprises */}
      {p.surprises.length ? (
        <Section title="A surprise">
          {p.surprises.map((s, i) => (
            <div key={i} className="rounded-2xl border border-signature/40 bg-signature-soft p-5 dark:bg-signature/10">
              <p className="font-medium text-slate-900 dark:text-white">⚡ {s.text}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{s.confirm_question}</p>
            </div>
          ))}
        </Section>
      ) : null}

      {/* findings */}
      <Section title="Findings">
        <Card>
          <p className="text-sm text-slate-700 dark:text-slate-200"><span className="font-medium capitalize">{p.findings.coherence.band}:</span> {p.findings.coherence.text}</p>
          {p.findings.gate_observation ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{p.findings.gate_observation.text}</p> : null}
          {p.findings.outlier ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{p.findings.outlier.text}</p> : null}
        </Card>
      </Section>

      {/* open questions */}
      {p.open_questions.length ? (
        <Section title="Still open">
          <ul className="space-y-2">
            {p.open_questions.map((q, i) => (
              <li key={i} className="text-sm text-slate-600 dark:text-slate-300">· {q.text} <span className="text-slate-400">({q.why_open})</span></li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* evidence room */}
      {p.evidence_room.length ? (
        <Section title="Evidence room">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="text-[11px] uppercase tracking-wide text-slate-400">
                <tr><th className="py-1 pr-4">Claim</th><th className="py-1 pr-4">Channel</th><th className="py-1 pr-4">Seen in</th><th className="py-1">Conf</th></tr>
              </thead>
              <tbody className="text-slate-600 dark:text-slate-300">
                {p.evidence_room.map((e, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-white/5">
                    <td className="py-1.5 pr-4">{e.claim}</td>
                    <td className="py-1.5 pr-4">{e.channel}</td>
                    <td className="py-1.5 pr-4 font-mono text-[11px]">{e.source_activities.join(', ')}</td>
                    <td className="py-1.5 text-accent">{DOT[e.tier]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}

      <div className="mt-12 flex gap-3">
        <button onClick={() => nav('/v2')} className="text-[13px] text-slate-400 hover:text-slate-700 dark:hover:text-white">← Back to V2 home</button>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="min-h-screen bg-[#f3f2fb] text-slate-900 dark:bg-noir dark:text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">{children}</div>
      <FloatingVersionToggle />
    </div>
  );
}
