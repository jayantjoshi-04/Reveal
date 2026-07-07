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

/** Validate one slot value against its contract. Returns the errors found. */
function validateOne(id: string, value: string): string[] {
  const def = REPORT_SLOTS.find((s) => s.id === id);
  if (!def) return [`unknown slot "${id}"`];
  const errors: string[] = [];
  if (wordCount(value) > def.maxWords) {
    errors.push(`slot "${id}" exceeds ${def.maxWords} words (${wordCount(value)})`);
  }
  if (def.mustEndWithQuestion && !value.trim().endsWith('?')) {
    errors.push(`slot "${id}" must end in a confirm-question`);
  }
  if (def.noComparison) {
    for (const pat of COMPARISON_PATTERNS) {
      if (pat.test(value)) errors.push(`slot "${id}" compares to others (matched ${pat})`);
    }
  }
  return errors;
}

/** Full report validation: every slot must be present and contract-compliant. */
export function validateSlots(slots: Partial<ReportSlots>): ValidationResult {
  const errors: string[] = [];
  for (const def of REPORT_SLOTS) {
    const value = slots[def.id];
    if (value === undefined || value === null || value.trim() === '') {
      errors.push(`slot "${def.id}" is missing`);
      continue;
    }
    errors.push(...validateOne(def.id, value));
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Partial validation for facilitator edits: only the provided slots are checked,
 * against the same ceilings/rules — so a human edit can't violate the contract
 * either. Missing slots are allowed (they keep the generated wording).
 */
export function validatePartialSlots(slots: Partial<ReportSlots>): ValidationResult {
  const errors: string[] = [];
  for (const [id, value] of Object.entries(slots)) {
    if (typeof value !== 'string' || value.trim() === '') {
      errors.push(`slot "${id}" cannot be empty`);
      continue;
    }
    errors.push(...validateOne(id, value));
  }
  return { ok: errors.length === 0, errors };
}
