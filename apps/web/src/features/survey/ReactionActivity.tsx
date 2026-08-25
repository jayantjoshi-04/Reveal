/**
 * The option-driven backbone — renders any activity authored as reaction-sets,
 * ladders, trade-offs, inclination or room picks (16 of the 30 activities),
 * straight from the seeded activity_options. Submits selected_option_ids.
 *
 * F1/F2 carry six situations back-to-back; the seed dropped the scenario column,
 * so we reconstruct them: a new situation begins whenever a `reaction` step
 * follows a non-reaction step.
 */
import { useState } from 'react';
import type { SurveyOption } from '../../lib/api.js';
import { Chip, NextButton, Prompt, type ArchetypeProps } from './shell.js';

// Friendly situation prompts for the lived / projected batteries (S1–S6).
const F_SCENARIOS = [
  'Think of a real project where the brief or requirements shifted partway through. What did you do?',
  'Recall a time you got hard feedback — a crit that stung, a rejection. What did you do with it?',
  'Think of a project that started wide open — few rules, lots of freedom. How did you get going?',
  'Recall working closely with others on something. How did you tend to show up?',
  'Think of a piece you cared about getting right. Where did your attention go?',
  'Recall a project that mattered to you. What were you really chasing?',
];

interface Group { key: string; step: string; mode: 'multi' | 'single'; label: string; options: SurveyOption[]; }

const STEP_LABEL: Record<string, string> = {
  reaction: 'What was true for you? (pick any)',
  inclination: 'Which of these pull you? (pick any)',
  'ladder.r1': 'Why — what was driving it? (pick any)',
  'ladder.r2': 'And underneath, the biggest reason?',
  tradeoff: 'When they pulled against each other, which won?',
  'room-pick': 'Which room fits best?',
  'env-pick': 'Pick what your ideal studio has',
  'values-pick': 'Which matters more to you?',
};

function buildScenarios(options: SurveyOption[]): Group[][] {
  const scored = options.filter((o) => o.step !== 'tiebreak' && o.step !== 'stimulus');
  const scenarios: SurveyOption[][] = [];
  let cur: SurveyOption[] = [];
  let prevStep = '';
  for (const o of scored) {
    if (o.step === 'reaction' && prevStep && prevStep !== 'reaction') {
      scenarios.push(cur);
      cur = [];
    }
    cur.push(o);
    prevStep = o.step;
  }
  if (cur.length) scenarios.push(cur);

  return scenarios.map((sc) => {
    const byStep = new Map<string, SurveyOption[]>();
    for (const o of sc) (byStep.get(o.step) ?? byStep.set(o.step, []).get(o.step)!).push(o);
    const groups: Group[] = [];
    for (const [step, opts] of byStep) {
      if (step === 'tradeoff' || step === 'env-pick' || step === 'values-pick') {
        // one single-choice group per axis / construct (pick a pole)
        const byKey = new Map<string, SurveyOption[]>();
        for (const o of opts) {
          const k = o.axis ?? o.constructId ?? 'x';
          (byKey.get(k) ?? byKey.set(k, []).get(k)!).push(o);
        }
        for (const [k, aOpts] of byKey) groups.push({ key: step + k, step, mode: 'single', label: STEP_LABEL[step] ?? step, options: aOpts });
      } else {
        const mode: Group['mode'] = step === 'ladder.r2' || step === 'room-pick' || step === 'values-pick' ? 'single' : 'multi';
        groups.push({ key: step, step, mode, label: STEP_LABEL[step] ?? step, options: opts });
      }
    }
    return groups;
  });
}

export function ReactionActivity({ activity, initial, busy, onSubmit }: ArchetypeProps): JSX.Element {
  const scenarios = buildScenarios(activity.options);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set(initial?.selected_option_ids ?? []));
  const isF = activity.code === 'F1' || activity.code === 'F2';

  const toggle = (group: Group, id: string): void => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (group.mode === 'single') group.options.forEach((o) => next.delete(o.id));
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const groups = scenarios[idx] ?? [];
  const last = idx >= scenarios.length - 1;
  const advance = (): void => {
    if (last) onSubmit({ selected_option_ids: [...selected] });
    else setIdx((i) => i + 1);
  };

  return (
    <div>
      <Prompt
        eyebrow={activity.label.replace(/·.*/, '').trim()}
        title={isF && scenarios.length > 1 ? (F_SCENARIOS[idx] ?? 'What did you do?') : activity.label.split('·').slice(1).join('·').trim() || activity.label}
        sub={scenarios.length > 1 ? `Situation ${idx + 1} of ${scenarios.length}` : (activity.note ?? undefined)}
      />
      <div className="space-y-5">
        {groups.map((g) => (
          <div key={g.key}>
            <div className="mb-2 text-[12.5px] font-medium text-slate-500 dark:text-slate-400">{g.label}</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {g.options.map((o) => (
                <Chip key={o.id} on={selected.has(o.id)} onClick={() => toggle(g, o.id)}>{o.label}</Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
      <NextButton busy={busy} onClick={advance} label={last ? 'Save & continue' : 'Next situation'} />
    </div>
  );
}
