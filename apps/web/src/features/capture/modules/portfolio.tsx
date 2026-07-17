import { useState } from 'react';
import { ROLES, CAPABILITIES, CONDITION_TAGS, type Role, type Capability, type ConditionTag } from '@reveal/shared';
import type { ModuleProps } from '../types.js';
import { Prompt, PrimaryBtn, Option } from './ui.js';
import { Input, Field, Segmented, UploadField, type UploadedFile } from '../../../components/ui.js';

const chip = (on: boolean): string =>
  `press rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
    on ? 'border-accent bg-accent-soft text-accent-dark' : 'border-slate-200 text-slate-500 hover:border-slate-300'
  }`;

const CONDITION_LABEL: Record<ConditionTag, string> = {
  tight_structure: 'tight structure', no_structure: 'no structure',
  constant_feedback: 'constant feedback', little_feedback: 'little feedback',
  out_of_depth: 'out of my depth', within_range: 'within my range',
  new_territory: 'new territory', familiar_ground: 'familiar ground',
  had_resources: 'had what I needed', made_do: 'had to make do',
  safe_to_be_wrong: 'safe to be wrong', high_stakes_exposed: 'high-stakes, exposed',
};

/** Consent. */
export function ConsentModule({ onSubmit, busy }: ModuleProps): JSX.Element {
  const [agree, setAgree] = useState(false);
  return (
    <>
      <Prompt>See the designer your work already shows.</Prompt>
      <p className="mb-5 text-sm leading-relaxed text-slate-500">
        REVEAL builds a picture of how you design — from what you do, not just what you say. Three short sittings; stop
        and come back anytime.
      </p>
      <div className="mb-5">
        <Option selected={agree} onClick={() => setAgree(!agree)}>
          I agree to how my data is used &amp; kept
        </Option>
      </div>
      <PrimaryBtn disabled={busy || !agree} onClick={() => onSubmit({ data_use: true, retention_ack: true, granted_at: new Date().toISOString() })}>
        Begin
      </PrimaryBtn>
    </>
  );
}

type Lean = 'commercial' | 'balanced' | 'impact';
const LEAN_VALUE: Record<Lean, number> = { commercial: 0.15, balanced: 0.5, impact: 0.85 };

interface Draft {
  title: string;
  domain: string;
  initiated: 'self' | 'assigned';
  roles: Role[];
  caps: Capability[];
  lean: Lean;
  wentWell: boolean;
  tags: ConditionTag[];
}

const emptyDraft = (): Draft => ({ title: '', domain: '', initiated: 'self', roles: [], caps: [], lean: 'balanced', wentWell: true, tags: [] });

/** Portfolio inventory (facts + interpretive fields, captured together for the pilot). */
export function PortfolioFactsModule({ onSubmit, busy }: ModuleProps): JSX.Element {
  const [projects, setProjects] = useState<Draft[]>([emptyDraft()]);
  const update = (i: number, patch: Partial<Draft>): void => setProjects(projects.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const toggleRole = (i: number, r: Role): void =>
    update(i, { roles: projects[i]!.roles.includes(r) ? projects[i]!.roles.filter((x) => x !== r) : [...projects[i]!.roles, r] });
  const toggleCap = (i: number, c: Capability): void =>
    update(i, { caps: projects[i]!.caps.includes(c) ? projects[i]!.caps.filter((x) => x !== c) : [...projects[i]!.caps, c] });

  return (
    <>
      <Prompt>Add your projects.</Prompt>
      <p className="mb-5 text-sm text-slate-500">The facts, your role, and whether each leaned commercial or impact.</p>
      <div className="mb-4 space-y-5">
        {projects.map((p, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="mb-3 space-y-3">
              <Field label="Project title"><Input value={p.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="ReVIVE" /></Field>
              <Field label="What it was"><Input value={p.domain} onChange={(e) => update(i, { domain: e.target.value })} placeholder="organ transport · health" /></Field>
            </div>
            <div className="mb-3">
              <div className="mb-1.5 text-[13px] font-medium text-slate-700">Your role(s)</div>
              <div className="flex flex-wrap gap-1.5">
                {ROLES.map((r) => (
                  <button key={r} type="button" onClick={() => toggleRole(i, r)} className={chip(p.roles.includes(r))}>{r.replace(/_/g, ' / ')}</button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <div className="mb-1.5 text-[13px] font-medium text-slate-700">Skills it shows</div>
              <div className="flex flex-wrap gap-1.5">
                {CAPABILITIES.slice(0, 6).map((c) => (
                  <button key={c} type="button" onClick={() => toggleCap(i, c)} className={chip(p.caps.includes(c))}>{c.replace(/_/g, ' ')}</button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <div className="mb-1.5 text-[13px] font-medium text-slate-700">Did it lean commercial or impact?</div>
              <Segmented<Lean>
                value={p.lean}
                onChange={(lean) => update(i, { lean })}
                options={[
                  { value: 'commercial', label: 'Commercial' },
                  { value: 'balanced', label: 'Balanced' },
                  { value: 'impact', label: 'Impact' },
                ]}
              />
            </div>
            <div className="mb-3">
              <div className="mb-1.5 text-[13px] font-medium text-slate-700">How did it go?</div>
              <Segmented<'well' | 'rough'>
                value={p.wentWell ? 'well' : 'rough'}
                onChange={(v) => update(i, { wentWell: v === 'well' })}
                options={[{ value: 'well', label: 'Went well' }, { value: 'rough', label: 'Was rough' }]}
              />
            </div>
            <div>
              <div className="mb-1.5 text-[13px] font-medium text-slate-700">What was the setting like? <span className="font-normal text-slate-400">pick any that applied</span></div>
              <div className="flex flex-wrap gap-1.5">
                {CONDITION_TAGS.map((tg) => (
                  <button
                    key={tg}
                    type="button"
                    onClick={() => update(i, { tags: p.tags.includes(tg) ? p.tags.filter((x) => x !== tg) : [...p.tags, tg] })}
                    className={chip(p.tags.includes(tg))}
                  >
                    {CONDITION_LABEL[tg]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="press mb-4 self-start rounded-xl border border-slate-200 px-3.5 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:border-slate-300"
        onClick={() => setProjects([...projects, emptyDraft()])}
      >
        + Add another project
      </button>
      <PrimaryBtn
        disabled={busy || projects.filter((p) => p.title).length === 0}
        onClick={() =>
          onSubmit({
            projects: projects.filter((p) => p.title).map((p, i) => ({
              project_id: `p${i + 1}`,
              title: p.title,
              domain: p.domain,
              initiated: p.initiated,
              group: 'group',
              roles: p.roles,
              demonstrated_capabilities: p.caps,
              commercial_impact_self_tag: LEAN_VALUE[p.lean],
              went_well: p.wentWell,
              condition_tags: p.tags,
            })),
          })
        }
      >
        Continue
      </PrimaryBtn>
    </>
  );
}

/** Portfolio reflection + the struggled-project probe (interpretive, after Channel B). */
export function PortfolioInterpretiveModule({ onSubmit, busy }: ModuleProps): JSX.Element {
  const [text, setText] = useState('');
  const [present, setPresent] = useState<boolean | null>(null);
  const [tags, setTags] = useState<ConditionTag[]>([]);
  const [note, setNote] = useState('');
  const toggle = (tg: ConditionTag): void => setTags(tags.includes(tg) ? tags.filter((x) => x !== tg) : [...tags, tg]);
  return (
    <>
      <Prompt>Looking back — what were you mostly doing across these projects?</Prompt>
      <p className="mb-3 text-sm text-slate-500">Asked now, after the tasks, so it can’t anchor everything else.</p>
      <textarea
        className="mb-6 h-24 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Mostly researching and making sense of the mess…"
      />

      <div className="mb-2 text-[13px] font-medium text-slate-700">Now think of a project you <b>struggled</b> with, or that didn’t go well — it doesn’t have to be in your portfolio.</div>
      <div className="mb-4">
        <Segmented<'yes' | 'no'>
          value={present === null ? 'yes' : present ? 'yes' : 'no'}
          onChange={(v) => setPresent(v === 'yes')}
          options={[{ value: 'yes', label: 'Yes, there was one' }, { value: 'no', label: 'Not really' }]}
        />
      </div>
      {present ? (
        <div className="mb-5 animate-fade-in">
          <div className="mb-1.5 text-[13px] font-medium text-slate-700">What was the setting like? <span className="font-normal text-slate-400">not why it went wrong — just the room</span></div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {CONDITION_TAGS.map((tg) => (
              <button key={tg} type="button" onClick={() => toggle(tg)} className={chip(tags.includes(tg))}>{CONDITION_LABEL[tg]}</button>
            ))}
          </div>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="One line, if you like…" />
        </div>
      ) : null}

      <PrimaryBtn
        disabled={busy || present === null}
        onClick={() =>
          onSubmit({
            reflection: text,
            struggled_project: present ? { present: true, condition_tags: tags, note } : { present: false, condition_tags: [] },
          })
        }
      >
        Next
      </PrimaryBtn>
    </>
  );
}

/** Resume upload (last). Blocks submit until the file has uploaded. */
export function ResumeModule({ onSubmit, busy }: ModuleProps): JSX.Element {
  const [frame, setFrame] = useState<'commercial' | 'impact' | 'mixed' | 'unknown'>('commercial');
  const [resume, setResume] = useState<UploadedFile | null>(null);
  return (
    <>
      <Prompt>Last thing — your resume.</Prompt>
      <p className="mb-4 text-sm text-slate-500">How you package yourself, compared against everything you just showed us.</p>
      <div className="mb-5">
        <UploadField
          label="Upload resume (PDF)"
          hint="Required — tap to choose your PDF"
          accept="application/pdf"
          value={resume}
          onChange={setResume}
        />
      </div>
      <div className="mb-2 text-[13px] font-medium text-slate-700">How does it read?</div>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {(['commercial', 'impact', 'mixed', 'unknown'] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFrame(f)} className={chip(frame === f)}>{f}</button>
        ))}
      </div>
      <PrimaryBtn
        disabled={busy || !resume}
        onClick={() => onSubmit({ resume: { uploaded: true, file_ref: resume!.name, parsed_frame: frame } })}
      >
        {resume ? 'Submit for review' : 'Upload your resume to continue'}
      </PrimaryBtn>
    </>
  );
}
