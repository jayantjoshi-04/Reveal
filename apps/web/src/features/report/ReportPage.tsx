import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Findings, ReportSlots, TraitScore } from '@reveal/shared';
import { api, ApiError } from '../../lib/api.js';
import { TopBar } from '../../components/TopBar.js';
import { Gauge, Bar, Bullet, MarketAxis, ProjectScatter, DispositionSlider, capColor } from './charts.js';

function label(code: string): string {
  return code.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

export function ReportPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({ queryKey: ['report', id], queryFn: () => api.report(id!), enabled: !!id });

  if (isLoading) return <Frame><p className="p-12 text-sm text-slate-500">Loading your Design Signature…</p></Frame>;
  if (error)
    return (
      <Frame>
        <div className="p-12 text-sm text-slate-500">
          {error instanceof ApiError && error.status === 403
            ? 'This report is still in review. You’ll get a note when it’s ready.'
            : 'Could not load the report.'}
        </div>
      </Frame>
    );
  if (!data) return <Frame><p className="p-12 text-slate-500">—</p></Frame>;

  const { slots, findings, trait_scores } = data;
  return (
    <Frame>
      <Hero slots={slots} findings={findings} />
      <SectionToday slots={slots} findings={findings} />
      <Surprise slots={slots} findings={findings} />
      <Divider />
      <SectionHeading slots={slots} findings={findings} />
      <EvidenceRoom findings={findings} traits={trait_scores} />
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar doc="Design Signature" />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">{children}</div>
      </div>
    </div>
  );
}

// ── Hero + vitals ────────────────────────────────────────────────────────────
function Hero({ slots, findings }: { slots: ReportSlots; findings: Findings }): JSX.Element {
  const spike = findings.capacities[0];
  const surprise = findings.capacities.find((c) => c.is_surprise);
  return (
    <div className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 px-6 py-10 sm:px-10 sm:py-14">
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Reveal · your design signature</div>
      <h1 className="mt-3 font-serif text-4xl leading-tight text-slate-900 sm:text-5xl">Here’s what your work says.</h1>
      <p className="mt-4 max-w-[42ch] font-serif text-xl italic leading-snug text-slate-500">{slots.differentiation_statement}</p>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-mono text-[11px] text-slate-500">
        <span className="h-2 w-2 rounded-full bg-emerald-500" /> As of today — a snapshot, not a verdict.
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Vital k="Leads with" v={label(spike?.name ?? '')} s="your thickest network" />
        <Vital k="Reaches for" v={label(findings.differentiation.direction)} s="in what you choose" />
        {surprise ? <Vital k="Surprise" v={`${label(surprise.name)} ⚡`} s="strong, never claimed" flag /> : <Vital k="Coherence" v="Consistent" s="stated ≈ revealed" />}
        <Vital k="Right now" v={findings.market.classification === 'holding_to_pull' ? 'Holds the pull' : label(findings.market.classification)} s="direction vs. market" />
      </div>
    </div>
  );
}

function Vital({ k, v, s, flag }: { k: string; v: string; s: string; flag?: boolean }): JSX.Element {
  return (
    <div className={`rounded-2xl border p-4 ${flag ? 'border-accent/30 bg-accent-soft' : 'border-slate-200 bg-white'}`}>
      <div className={`font-mono text-[10px] uppercase tracking-wide ${flag ? 'text-accent' : 'text-slate-400'}`}>{k}</div>
      <div className={`mt-2 font-serif text-xl ${flag ? 'text-accent-dark' : 'text-slate-900'}`}>{v}</div>
      <div className="mt-1 text-[11px] text-slate-500">{s}</div>
    </div>
  );
}

// ── Section 1 · Today ────────────────────────────────────────────────────────
function SectionToday({ slots, findings }: { slots: ReportSlots; findings: Findings }): JSX.Element {
  return (
    <div className="bg-white px-6 py-10 sm:px-10 sm:py-12">
      <SectionHead tab="Today" tabClass="bg-slate-900 text-white" title="The designer you are today" sub="Read from what you’ve actually done and chosen — not from what you’d say about yourself." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card span2>
          <CardTitle>Capacities · where your wiring is thick today</CardTitle>
          <div className="flex flex-wrap justify-between gap-1.5">
            {findings.capacities.map((c) => (
              <Gauge key={c.name} value={c.demonstrated} label={`${label(c.name)}${c.is_surprise ? ' ⚡' : ''}`} color={capColor(c.name)} />
            ))}
          </div>
          <Prose>{slots.capacity_line}</Prose>
        </Card>

        <Card>
          <CardTitle>Recurring roles</CardTitle>
          <div className="flex flex-col gap-2">
            {findings.roles.slice(0, 5).map((r) => (
              <Bar key={r.name} label={label(r.name)} value={r.frequency} note={r.frequency >= 0.85 ? 'often' : r.frequency <= 0.35 ? 'rarely' : ''} />
            ))}
          </div>
          <Prose>{slots.roles_line}</Prose>
        </Card>

        <Card>
          <CardTitle>Values · what survived the cut</CardTitle>
          <div className="flex flex-col gap-1.5">
            {findings.values.slice(0, 6).map((v) => (
              <div key={v.name} className="flex items-center justify-between text-xs text-slate-700">
                <span>{v.rank}. {label(v.name)}</span>
                {v.protected
                  ? <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent-dark">protected</span>
                  : <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">cut early</span>}
              </div>
            ))}
          </div>
          <Prose>{slots.values_line}</Prose>
        </Card>

        <Card span2>
          <CardTitle>Project pattern · what you publish vs. what you do</CardTitle>
          <ProjectScatter leadImpact={findings.project_pattern.lead_impact} outlier={findings.project_pattern.outlier} />
          <Prose>{slots.project_line}</Prose>
        </Card>

        <Card span2>
          <CardTitle>Where you work best</CardTitle>
          <div className="grid gap-3.5 md:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="mb-2 font-mono text-[9.5px] uppercase tracking-wide text-emerald-600">You thrive when</div>
              <ul className="space-y-1 text-[12px] text-slate-700">{findings.conditions.thrive.slice(0, 5).map((c) => <li key={c}>· {c.replace(/_/g, ' ')}</li>)}</ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 font-mono text-[9.5px] uppercase tracking-wide text-slate-500">You lose energy when</div>
              <ul className="space-y-1 text-[12px] text-slate-700">{findings.conditions.wither.slice(0, 5).map((c) => <li key={c}>· {c.replace(/_/g, ' ')}</li>)}</ul>
            </div>
          </div>
          <Prose>{slots.conditions_line}</Prose>
        </Card>
      </div>
    </div>
  );
}

function Surprise({ slots, findings }: { slots: ReportSlots; findings: Findings }): JSX.Element {
  if (findings.surprises.length === 0) return <div className="bg-white" />;
  return (
    <div className="bg-white px-6 pb-10 sm:px-10 sm:pb-12">
      <div className="flex items-center gap-5 rounded-2xl border border-accent/30 bg-accent-soft p-6">
        <div className="font-serif text-5xl text-accent">⚡</div>
        <div>
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-accent">A surprise — to confirm, not a verdict</div>
          <p className="text-sm leading-relaxed text-slate-600">{slots.surprise_phrasing}</p>
        </div>
      </div>
    </div>
  );
}

function Divider(): JSX.Element {
  return (
    <div className="flex flex-col gap-1.5 bg-slate-900 px-6 py-7 sm:px-10">
      <span className="font-mono text-[10px] uppercase tracking-wide text-indigo-300">Switching view</span>
      <h2 className="font-serif text-xl italic text-white sm:text-2xl">From here on — not where you are, but where you’re heading.</h2>
    </div>
  );
}

// ── Section 2 · Heading ──────────────────────────────────────────────────────
function SectionHeading({ slots, findings }: { slots: ReportSlots; findings: Findings }): JSX.Element {
  return (
    <div className="bg-slate-900 px-6 py-10 text-slate-200 sm:px-10 sm:py-12">
      <SectionHead tab="Heading" tabClass="bg-indigo-500 text-white" title="The designer you want to be" sub="What you reach for, how far away it is, and the steps that close it." dark />
      <div className="grid gap-4 md:grid-cols-2">
        <DarkCard span2>
          <CardTitle dark>Your reach &amp; the gap</CardTitle>
          <div className="mt-2">
            {findings.gap.slice(0, 5).map((g) => (
              <Bullet key={g.capability} label={label(g.capability)} now={g.current} target={g.desired} />
            ))}
          </div>
          <Prose dark>{slots.gap_line}</Prose>
        </DarkCard>

        {findings.dispositions && findings.dispositions.length > 0 ? (
          <DarkCard span2>
            <CardTitle dark>How you work · six tensions</CardTitle>
            <div className="mt-1 space-y-2.5">
              {findings.dispositions.map((d) => (
                <DispositionSlider key={d.dimension} low={d.low_pole} high={d.high_pole} position={d.position} faded={d.tier === 'thin'} />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-wide text-slate-500">
              <span className="inline-block h-2 w-2 rounded-full bg-indigo-400" /> well-motivated
              <span className="ml-2 inline-block h-2 w-2 rounded-full bg-slate-500" /> thinner signal
            </div>
            {findings.dispositions_summary ? <Prose dark>{findings.dispositions_summary}</Prose> : null}
          </DarkCard>
        ) : null}

        <DarkCard span2>
          <CardTitle dark>Which way are you leaning?</CardTitle>
          <MarketAxis wish={findings.market.wish_dir} actual={findings.market.actual_dir} pays={findings.market.pays_dir} />
          <Prose dark>{slots.market_line}</Prose>
        </DarkCard>

        <DarkCard span2>
          <CardTitle dark>What kind of gap?</CardTitle>
          <div className="grid gap-3.5 md:grid-cols-2">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="mb-2 font-mono text-[9.5px] uppercase tracking-wide text-emerald-300">Capacities your direction needs</div>
              <ul className="space-y-1 text-xs text-slate-300">
                {findings.direction_check.requires_capacities.map((c) => <li key={c}>✓ {label(c)}</li>)}
              </ul>
            </div>
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
              <div className="mb-2 font-mono text-[9.5px] uppercase tracking-wide text-indigo-300">Gaps — all learnable</div>
              <ul className="space-y-1 text-xs text-slate-300">
                {findings.gap.slice(0, 4).map((g) => <li key={g.capability}>→ {label(g.capability)} · {g.classification}</li>)}
              </ul>
            </div>
          </div>
          <Prose dark>{slots.gap_kind_line}</Prose>
        </DarkCard>

        <DarkCard span2>
          <CardTitle dark>Growth experiments</CardTitle>
          <div className="flex flex-col gap-2">
            {findings.experiments.map((e, i) => (
              <div key={i} className="flex gap-3 text-xs text-slate-300">
                <span className="font-mono text-indigo-400">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <b className="text-white">{label(e.targets)}</b>
                  <span className="ml-2 font-mono text-[8.5px] uppercase text-slate-500">from · {e.reason.replace(/_/g, ' ')}</span>
                </span>
              </div>
            ))}
          </div>
          <Prose dark>{slots.experiment_text}</Prose>
        </DarkCard>

        <DarkCard span2>
          <CardTitle dark>Your next moves</CardTitle>
          <p className="text-[13px] leading-relaxed text-slate-300">{slots.action_menu}</p>
        </DarkCard>
      </div>
    </div>
  );
}

// ── Evidence room ────────────────────────────────────────────────────────────
function EvidenceRoom({ findings: _findings, traits }: { findings: Findings; traits: TraitScore[] }): JSX.Element {
  return (
    <div className="border-t border-slate-200 bg-slate-50 px-6 py-9 sm:px-10">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">Appendix</div>
      <h2 className="mb-1 mt-1 font-serif text-2xl text-slate-900">The Evidence Room</h2>
      <p className="mb-4 text-[13px] text-slate-500">Every finding, traced to where it came from. A = what you said · B = what you did.</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse overflow-hidden rounded-xl border border-slate-200 bg-white text-xs">
          <thead>
            <tr>
              {['Trait', 'A-score', 'B-score', 'Situations', 'Confidence'].map((h) => (
                <th key={h} className="bg-slate-900 px-3 py-2.5 text-left font-mono text-[9px] uppercase tracking-wide text-white">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {traits.map((t) => (
              <tr key={t.trait} className="border-t border-slate-100 even:bg-slate-50/60">
                <td className="px-3 py-2 font-semibold text-slate-800">{label(t.trait)}</td>
                <td className="px-3 py-2 font-mono text-slate-600">{t.a_score.toFixed(2)}</td>
                <td className="px-3 py-2 font-mono text-slate-600">{t.b_score.toFixed(2)}</td>
                <td className="px-3 py-2 font-mono text-slate-600">{t.b_situations_agree}</td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">{t.confidence ?? '—'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12px] italic text-slate-400">Nothing here is a score against other students. It’s a snapshot of you, today — built to be re-run.</p>
    </div>
  );
}

// ── small shared bits ────────────────────────────────────────────────────────
function SectionHead({ tab, tabClass, title, sub, dark }: { tab: string; tabClass: string; title: string; sub: string; dark?: boolean }): JSX.Element {
  return (
    <div className="mb-7 flex items-start gap-4">
      <span className={`mt-1 whitespace-nowrap rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider ${tabClass}`}>{tab}</span>
      <div>
        <h2 className={`font-serif text-3xl leading-tight ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
        <p className={`mt-2 max-w-[60ch] text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{sub}</p>
      </div>
    </div>
  );
}
function Card({ children, span2 }: { children: React.ReactNode; span2?: boolean }): JSX.Element {
  return <div className={`flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card ${span2 ? 'md:col-span-2' : ''}`}>{children}</div>;
}
function DarkCard({ children, span2 }: { children: React.ReactNode; span2?: boolean }): JSX.Element {
  return <div className={`flex flex-col rounded-2xl border border-slate-700 bg-slate-800/60 p-5 ${span2 ? 'md:col-span-2' : ''}`}>{children}</div>;
}
function CardTitle({ children, dark }: { children: React.ReactNode; dark?: boolean }): JSX.Element {
  return <div className={`mb-3 font-mono text-[10px] uppercase tracking-wide ${dark ? 'text-slate-400' : 'text-slate-400'}`}>{children}</div>;
}
function Prose({ children, dark }: { children: React.ReactNode; dark?: boolean }): JSX.Element {
  return <p className={`mt-3 text-[13px] leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{children}</p>;
}
