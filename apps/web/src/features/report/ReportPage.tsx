import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Findings, ReportSlots, TraitScore } from '@reveal/shared';
import { api, ApiError } from '../../lib/api.js';
import { TopBar } from '../../components/TopBar.js';
import { Gauge, Bar, Bullet, MarketAxis, ProjectScatter, capColor } from './charts.js';

function label(code: string): string {
  return code.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

export function ReportPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({ queryKey: ['report', id], queryFn: () => api.report(id!), enabled: !!id });

  if (isLoading) return <Frame><p className="p-10 text-sm text-mid">Loading your Design Signature…</p></Frame>;
  if (error)
    return (
      <Frame>
        <div className="p-10 text-sm text-mid">
          {error instanceof ApiError && error.status === 403
            ? 'This report is still in review. You’ll get a note when it’s ready.'
            : 'Could not load the report.'}
        </div>
      </Frame>
    );
  if (!data) return <Frame><p className="p-10">—</p></Frame>;

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
    <div className="min-h-screen bg-warm">
      <TopBar doc="Design Signature" />
      <div className="mx-auto max-w-5xl bg-cream shadow-xl">{children}</div>
    </div>
  );
}

// ── Hero + vitals ────────────────────────────────────────────────────────────
function Hero({ slots, findings }: { slots: ReportSlots; findings: Findings }): JSX.Element {
  const spike = findings.capacities[0];
  const surprise = findings.capacities.find((c) => c.is_surprise);
  return (
    <div className="border-b border-rule px-8 py-10" style={{ background: 'linear-gradient(170deg,#ffffff,#FAF7F2)' }}>
      <div className="eyebrow mb-3">Reveal · your design signature</div>
      <h1 className="font-serif text-4xl leading-none md:text-5xl">Here’s what your work says.</h1>
      <p className="mt-4 max-w-[34ch] font-serif text-xl italic leading-snug text-[#3a3a34]">{slots.differentiation_statement}</p>
      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-rule bg-white px-3 py-1.5 font-mono text-[11px] text-mid">
        <span className="h-2 w-2 rounded-full bg-green" /> As of today — a snapshot, not a verdict.
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3.5 md:grid-cols-4">
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
    <div className={`relative overflow-hidden rounded-xl border bg-white p-4 ${flag ? 'border-mag' : 'border-rule'}`}>
      <div className={`font-mono text-[9px] uppercase tracking-wide ${flag ? 'text-mag' : 'text-dim'}`}>{k}</div>
      <div className={`mt-2 font-serif text-xl ${flag ? 'text-mag' : ''}`}>{v}</div>
      <div className="mt-1 text-[11px] text-mid">{s}</div>
    </div>
  );
}

// ── Section 1 · Today ────────────────────────────────────────────────────────
function SectionToday({ slots, findings }: { slots: ReportSlots; findings: Findings }): JSX.Element {
  return (
    <div className="bg-cream px-8 py-9">
      <SectionHead tab="Today" tabClass="bg-orange text-white" title="The designer you are today" sub="Read from what you’ve actually done and chosen — not from what you’d say about yourself." />
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
              <div key={v.name} className="flex items-center justify-between text-xs">
                <span>{v.rank}. {label(v.name)}</span>
                {v.protected ? <span className="chip bg-orange-bg text-orange">protected</span> : <span className="chip bg-[#efece6] text-mid">cut early</span>}
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
            <div className="rounded-lg border border-[#3E9D6B]/25 bg-[#3E9D6B]/[.08] p-3">
              <div className="mb-2 font-mono text-[9.5px] uppercase text-green">You thrive when</div>
              <ul className="space-y-1 text-[11.5px] text-[#3a3a34]">{findings.conditions.thrive.slice(0, 5).map((c) => <li key={c}>· {c.replace(/_/g, ' ')}</li>)}</ul>
            </div>
            <div className="rounded-lg border border-steel/25 bg-steel/[.08] p-3">
              <div className="mb-2 font-mono text-[9.5px] uppercase text-steel">You lose energy when</div>
              <ul className="space-y-1 text-[11.5px] text-[#3a3a34]">{findings.conditions.wither.slice(0, 5).map((c) => <li key={c}>· {c.replace(/_/g, ' ')}</li>)}</ul>
            </div>
          </div>
          <Prose>{slots.conditions_line}</Prose>
        </Card>
      </div>
    </div>
  );
}

function Surprise({ slots, findings }: { slots: ReportSlots; findings: Findings }): JSX.Element {
  if (findings.surprises.length === 0) return <div className="bg-cream" />;
  return (
    <div className="bg-cream px-8 pb-9">
      <div className="flex items-center gap-6 rounded-2xl border-[1.5px] border-mag p-6" style={{ background: 'linear-gradient(135deg,#fff,#fdeef6)' }}>
        <div className="font-serif text-5xl text-mag">⚡</div>
        <div>
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-mag">A surprise — to confirm, not a verdict</div>
          <p className="text-sm text-[#5a4450]">{slots.surprise_phrasing}</p>
        </div>
      </div>
    </div>
  );
}

function Divider(): JSX.Element {
  return (
    <div className="flex items-center gap-4 bg-ink px-8 py-6 text-white">
      <span className="font-mono text-[10px] uppercase tracking-wide text-cyan">Switching view</span>
      <h2 className="font-serif text-xl italic md:text-2xl">From here on — not where you are, but where you’re heading.</h2>
    </div>
  );
}

// ── Section 2 · Heading ──────────────────────────────────────────────────────
function SectionHeading({ slots, findings }: { slots: ReportSlots; findings: Findings }): JSX.Element {
  return (
    <div className="bg-navy px-8 py-9 text-[#eef1f8]">
      <SectionHead tab="Heading" tabClass="bg-cyan text-navy-deep" title="The designer you want to be" sub="What you reach for, how far away it is, and the steps that close it." dark />
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

        <DarkCard span2>
          <CardTitle dark>Which way are you leaning?</CardTitle>
          <MarketAxis wish={findings.market.wish_dir} actual={findings.market.actual_dir} pays={findings.market.pays_dir} />
          <Prose dark>{slots.market_line}</Prose>
        </DarkCard>

        <DarkCard span2>
          <CardTitle dark>What kind of gap?</CardTitle>
          <div className="grid gap-3.5 md:grid-cols-2">
            <div className="rounded-lg border border-[#3E9D6B]/32 bg-[#3E9D6B]/10 p-3">
              <div className="mb-2 font-mono text-[9.5px] uppercase text-[#5fc98a]">Capacities your direction needs</div>
              <ul className="space-y-1 text-xs text-[#d4dcf0]">
                {findings.direction_check.requires_capacities.map((c) => <li key={c}>✓ {label(c)}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-cyan/32 bg-cyan/[.08] p-3">
              <div className="mb-2 font-mono text-[9.5px] uppercase text-cyan">Gaps — all learnable</div>
              <ul className="space-y-1 text-xs text-[#d4dcf0]">
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
              <div key={i} className="flex gap-3 text-xs text-[#d4dcf0]">
                <span className="font-mono text-cyan">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <b className="text-white">{label(e.targets)}</b>
                  <span className="ml-2 font-mono text-[8.5px] uppercase text-[#8a96aa]">from · {e.reason.replace(/_/g, ' ')}</span>
                </span>
              </div>
            ))}
          </div>
          <Prose dark>{slots.experiment_text}</Prose>
        </DarkCard>

        <DarkCard span2>
          <CardTitle dark>Your next moves</CardTitle>
          <p className="text-[13px] leading-relaxed text-[#d4dcf0]">{slots.action_menu}</p>
        </DarkCard>
      </div>
    </div>
  );
}

// ── Evidence room ────────────────────────────────────────────────────────────
function EvidenceRoom({ findings, traits }: { findings: Findings; traits: TraitScore[] }): JSX.Element {
  return (
    <div className="border-t-2 border-ink bg-warm px-8 py-8">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-mid">Appendix</div>
      <h2 className="mb-1 mt-1 font-serif text-2xl">The Evidence Room</h2>
      <p className="mb-4 text-[13px] text-mid">Every finding, traced to where it came from. A = what you said · B = what you did.</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse overflow-hidden rounded-lg border border-rule bg-white text-xs">
          <thead>
            <tr>
              {['Trait', 'A-score', 'B-score', 'Situations', 'Confidence'].map((h) => (
                <th key={h} className="bg-ink px-3 py-2 text-left font-mono text-[9px] uppercase tracking-wide text-white">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {traits.map((t) => (
              <tr key={t.trait} className="odd:bg-cream">
                <td className="px-3 py-2 font-semibold">{label(t.trait)}</td>
                <td className="px-3 py-2 font-mono">{t.a_score.toFixed(2)}</td>
                <td className="px-3 py-2 font-mono">{t.b_score.toFixed(2)}</td>
                <td className="px-3 py-2 font-mono">{t.b_situations_agree}</td>
                <td className="px-3 py-2">
                  <span className="chip bg-[#eef1f5] text-steel">{t.confidence ?? '—'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12px] italic text-mid">Nothing here is a score against other students. It’s a snapshot of you, today — built to be re-run.</p>
    </div>
  );
}

// ── small shared bits ────────────────────────────────────────────────────────
function SectionHead({ tab, tabClass, title, sub, dark }: { tab: string; tabClass: string; title: string; sub: string; dark?: boolean }): JSX.Element {
  return (
    <div className="mb-6 flex items-start gap-4">
      <span className={`mt-1 whitespace-nowrap rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider ${tabClass}`}>{tab}</span>
      <div>
        <h2 className={`font-serif text-3xl leading-none ${dark ? 'text-white' : ''}`}>{title}</h2>
        <p className={`mt-1.5 max-w-[60ch] text-[13.5px] ${dark ? 'text-[#b8c4e0]' : 'text-mid'}`}>{sub}</p>
      </div>
    </div>
  );
}
function Card({ children, span2 }: { children: React.ReactNode; span2?: boolean }): JSX.Element {
  return <div className={`flex flex-col rounded-2xl border border-rule bg-white p-5 ${span2 ? 'md:col-span-2' : ''}`}>{children}</div>;
}
function DarkCard({ children, span2 }: { children: React.ReactNode; span2?: boolean }): JSX.Element {
  return <div className={`flex flex-col rounded-2xl border border-[#2c539c] bg-navy-card p-5 ${span2 ? 'md:col-span-2' : ''}`}>{children}</div>;
}
function CardTitle({ children, dark }: { children: React.ReactNode; dark?: boolean }): JSX.Element {
  return <div className={`mb-3 font-mono text-[10px] uppercase tracking-wide ${dark ? 'text-[#9fb0d8]' : 'text-mid'}`}>{children}</div>;
}
function Prose({ children, dark }: { children: React.ReactNode; dark?: boolean }): JSX.Element {
  return <p className={`mt-3 text-[13px] leading-relaxed ${dark ? 'text-[#c8d2ea]' : 'text-[#444]'}`}>{children}</p>;
}
