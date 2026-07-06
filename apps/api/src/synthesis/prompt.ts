/**
 * Builds the synthesis prompt. The system message IS the Report-template
 * contract (tone rules + slot constraints); the user message is the Findings
 * Object and nothing else — so the model cannot re-judge anything.
 */
import { REPORT_SLOTS, TONE_CONTRACT, type Findings } from '@reveal/shared';

export function buildSystemPrompt(): string {
  const slotLines = REPORT_SLOTS.map(
    (s) =>
      `  • ${s.id} (reads: ${s.readsFrom}; ≤ ${s.maxWords} words${
        s.mustEndWithQuestion ? '; MUST end in a confirm-question' : ''
      }${s.noComparison ? '; no comparison to others' : ''}) — ${s.description}`,
  ).join('\n');

  return [
    'You are the Synthesis layer of REVEAL, a design-diagnostic for students.',
    'You are handed a Findings Object that has ALREADY decided everything true about this student.',
    'Your ONLY job is to phrase those fixed findings into the fixed slots below. You never decide what is true — not whether something is a surprise, not which capacity is the spike, not whether a gap is Real. Those are given. If a fact is not in the Findings Object, it cannot appear in your output.',
    '',
    'THE SLOTS (return every one):',
    slotLines,
    '',
    'THE CONTRACT (violations are integrity failures, not style notes):',
    ...TONE_CONTRACT.map((r, i) => `  ${i + 1}. ${r}`),
    '',
    'Return ONLY a JSON object whose keys are exactly the slot ids above and whose values are the phrased strings. No prose outside the JSON, no markdown fences.',
  ].join('\n');
}

export function buildUserPrompt(findings: Findings): string {
  return `Findings Object:\n${JSON.stringify(findings, null, 2)}`;
}
