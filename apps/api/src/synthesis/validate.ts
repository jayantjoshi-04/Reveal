/**
 * Slot validator — enforces the machine-checkable parts of the Report contract
 * (word ceilings, surprise-ends-in-question, no comparison to other students).
 * Anything the model returns that violates these is an integrity failure.
 */
import { REPORT_SLOTS, type ReportSlots } from '@reveal/shared';

/** Phrases that would compare the student to others — banned by the contract. */
const COMPARISON_PATTERNS = [
  /\bpercentile\b/i,
  /\babove average\b/i,
  /\bbelow average\b/i,
  /\bthan (other|most|her|his|their) (student|peer|designer)/i,
  /\bin (her|his|their) cohort\b/i,
  /\brare talent\b/i,
  /\bbest in\b/i,
  /\btop \d+%/i,
  /\boutperform\b/i,
];

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function validateSlots(slots: Partial<ReportSlots>): ValidationResult {
  const errors: string[] = [];

  for (const def of REPORT_SLOTS) {
    const value = slots[def.id];
    if (value === undefined || value === null || value.trim() === '') {
      errors.push(`slot "${def.id}" is missing`);
      continue;
    }
    if (wordCount(value) > def.maxWords) {
      errors.push(`slot "${def.id}" exceeds ${def.maxWords} words (${wordCount(value)})`);
    }
    if (def.mustEndWithQuestion && !value.trim().endsWith('?')) {
      errors.push(`slot "${def.id}" must end in a confirm-question`);
    }
    if (def.noComparison) {
      for (const pat of COMPARISON_PATTERNS) {
        if (pat.test(value)) errors.push(`slot "${def.id}" compares to others (matched ${pat})`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
