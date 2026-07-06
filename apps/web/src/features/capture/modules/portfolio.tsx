import { useState } from 'react';
import { ROLES, CAPABILITIES, type Role, type Capability } from '@reveal/shared';
import type { ModuleProps } from '../types.js';
import { Prompt, PrimaryBtn, Option } from './ui.js';

/** Consent. */
export function ConsentModule({ onSubmit, busy }: ModuleProps): JSX.Element {
  const [agree, setAgree] = useState(false);
  return (
    <>
      <div className="mb-1.5 font-serif text-lg">See the designer your work already shows.</div>
      <p className="mb-3 text-[11px] leading-relaxed text-mid">
        REVEAL builds a picture of how you design — from what you do, not just what you say. Three short sittings; stop
        and come back anytime.
      </p>
      <Option selected={agree} onClick={() => setAgree(!agree)}>
        I agree to how my data is used &amp; kept
      </Option>
      <PrimaryBtn
        disabled={busy || !agree}
        onClick={() => onSubmit({ data_use: true, retention_ack: true, granted_at: new Date().toISOString() })}
      >
        Begin
      </PrimaryBtn>
    </>
  );
}

interface Draft {
  title: string;
  domain: string;
  initiated: 'self' | 'assigned';
  roles: Role[];
  caps: Capability[];
  impact: number; // -1..1
}

/** Portfolio inventory (facts + interpretive fields, captured together for the pilot). */
export function PortfolioFactsModule({ onSubmit, busy }: ModuleProps): JSX.Element {
  const [projects, setProjects] = useState<Draft[]>([
    { title: '', domain: '', initiated: 'self', roles: [], caps: [], impact: 0.5 },
  ]);
  const update = (i: number, patch: Partial<Draft>): void =>
    setProjects(projects.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const toggleRole = (i: number, r: Role): void =>
    update(i, { roles: projects[i]!.roles.includes(r) ? projects[i]!.roles.filter((x) => x !== r) : [...projects[i]!.roles, r] });
  const toggleCap = (i: number, c: Capability): void =>
    update(i, { caps: projects[i]!.caps.includes(c) ? projects[i]!.caps.filter((x) => x !== c) : [...projects[i]!.caps, c] });

  return (
    <>
      <Prompt>Add your projects.</Prompt>
      <p className="mb-3 text-[11px] text-mid">Title, what it was, your role, and whether it leaned commercial or impact.</p>
      <div className="mb-3 max-h-64 space-y-3 overflow-auto pr-1">
        {projects.map((p, i) => (
          <div key={i} className="rounded-lg border border-rule p-2">
            <input className="mb-1 w-full rounded border border-rule px-2 py-1 text-[11px]" placeholder="Project title" value={p.title} onChange={(e) => update(i, { title: e.target.value })} />
            <input className="mb-1 w-full rounded border border-rule px-2 py-1 text-[11px]" placeholder="Domain (e.g. health · community)" value={p.domain} onChange={(e) => update(i, { domain: e.target.value })} />
            <div className="mb-1 flex flex-wrap gap-1">
              {ROLES.map((r) => (
                <button key={r} onClick={() => toggleRole(i, r)} className={`rounded-full border px-1.5 py-0.5 text-[8.5px] ${p.roles.includes(r) ? 'border-orange bg-orange-bg text-orange' : 'border-rule text-mid'}`}>
                  {r.replace(/_/g, '/')}
                </button>
              ))}
            </div>
            <div className="mb-1 flex flex-wrap gap-1">
              {CAPABILITIES.slice(0, 6).map((c) => (
                <button key={c} onClick={() => toggleCap(i, c)} className={`rounded-full border px-1.5 py-0.5 text-[8.5px] ${p.caps.includes(c) ? 'border-blue bg-blue-bg text-blue' : 'border-rule text-mid'}`}>
                  {c.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[9px] text-mid">
              <span>commercial</span>
              <input type="range" min={-100} max={100} value={p.impact * 100} onChange={(e) => update(i, { impact: Number(e.target.value) / 100 })} className="flex-1 accent-orange" />
              <span>impact</span>
            </div>
          </div>
        ))}
      </div>
      <button className="btn-ghost mb-2 text-[11px]" onClick={() => setProjects([...projects, { title: '', domain: '', initiated: 'self', roles: [], caps: [], impact: 0.5 }])}>
        + Add project
      </button>
      <PrimaryBtn
        disabled={busy || projects.filter((p) => p.title).length === 0}
        onClick={() =>
          onSubmit({
            projects: projects
              .filter((p) => p.title)
              .map((p, i) => ({
                project_id: `p${i + 1}`,
                title: p.title,
                domain: p.domain,
                initiated: p.initiated,
                group: 'group',
                roles: p.roles,
                demonstrated_capabilities: p.caps,
                commercial_impact_self_tag: p.impact,
              })),
          })
        }
      >
        Continue
      </PrimaryBtn>
    </>
  );
}

/** Portfolio reflection (interpretive, after Channel B). */
export function PortfolioInterpretiveModule({ onSubmit, busy }: ModuleProps): JSX.Element {
  const [text, setText] = useState('');
  return (
    <>
      <Prompt>Looking back — what were you mostly doing across these projects?</Prompt>
      <p className="mb-3 text-[11px] text-mid">Asked now, after the tasks, so it can't anchor everything else.</p>
      <textarea className="mb-4 h-24 w-full rounded-lg border border-rule px-3 py-2 text-xs" value={text} onChange={(e) => setText(e.target.value)} placeholder="Mostly researching and making sense of the mess…" />
      <PrimaryBtn disabled={busy} onClick={() => onSubmit({ reflection: text })}>
        Next
      </PrimaryBtn>
    </>
  );
}

/** Resume upload (last). */
export function ResumeModule({ onSubmit, busy }: ModuleProps): JSX.Element {
  const [frame, setFrame] = useState<'commercial' | 'impact' | 'mixed' | 'unknown'>('commercial');
  return (
    <>
      <Prompt>Last thing — your resume.</Prompt>
      <p className="mb-3 text-[11px] text-mid">How you package yourself, compared against everything you just showed us.</p>
      <div className="mb-3 rounded-lg border border-dashed border-orange bg-orange-bg p-4 text-center text-[11px] text-[#7a3a28]">
        ⬆ Upload resume (PDF) — registered as a storage ref
      </div>
      <div className="mb-1 font-mono text-[10px] uppercase text-dim">How does it read?</div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(['commercial', 'impact', 'mixed', 'unknown'] as const).map((f) => (
          <button key={f} onClick={() => setFrame(f)} className={`rounded-full border px-2.5 py-1 text-[10px] ${frame === f ? 'border-orange bg-orange-bg text-orange' : 'border-rule text-mid'}`}>
            {f}
          </button>
        ))}
      </div>
      <PrimaryBtn disabled={busy} onClick={() => onSubmit({ resume: { uploaded: true, file_ref: 'resume.pdf', parsed_frame: frame } })}>
        Submit for review
      </PrimaryBtn>
    </>
  );
}
