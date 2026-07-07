/**
 * REVEAL · Layer 3 · Synthesis orchestrator (the only LLM step)
 * ---------------------------------------------------------------------------
 * findings → validated ReportSlots. Runs at most once per report_instance,
 * behind the facilitator gate. In `auto` mode it calls Claude at low
 * temperature and validates the output against the slot contract; if the API
 * is unavailable or the output fails validation, it falls back to the
 * deterministic phraser so a report is always producible.
 */
import { reportSlotsSchema, type Findings, type ReportSlots } from '@reveal/shared';
import { env } from '../config/env.js';
import { buildSystemPrompt, buildUserPrompt, buildRepairPrompt } from './prompt.js';
import { validateSlots } from './validate.js';
import { callClaude, extractJson } from './client.js';
import { fallbackSlots } from './fallback.js';

export interface SynthesisResult {
  slots: ReportSlots;
  model: string;
}

/** A model caller: (system, user) → raw text. Injectable so it can be mocked. */
export type Caller = (system: string, user: string) => Promise<string>;

/**
 * Ask the model for contract-valid slots, with ONE repair retry. If the first
 * output fails to parse or violates the contract, the errors are fed back and
 * we try once more before giving up (caller returns null → deterministic fallback).
 * Pure and injectable — no env, no network — so it is unit-testable.
 */
export async function attemptSlots(findings: Findings, call: Caller, modelLabel: string): Promise<SynthesisResult | null> {
  const system = buildSystemPrompt();
  let user = buildUserPrompt(findings);

  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await call(system, user);
    let parsedData: ReportSlots | null = null;
    try {
      const parsed = reportSlotsSchema.safeParse(extractJson(raw));
      if (parsed.success) parsedData = parsed.data;
    } catch {
      /* extractJson threw — treat as a parse failure */
    }

    if (!parsedData) {
      user = buildRepairPrompt(findings, raw, ['Return a JSON object with exactly the slot keys, values as strings.']);
      continue;
    }
    const check = validateSlots(parsedData);
    if (check.ok) return { slots: parsedData, model: modelLabel };
    user = buildRepairPrompt(findings, parsedData, check.errors);
  }
  return null;
}

export async function synthesize(findings: Findings): Promise<SynthesisResult> {
  const cfg = env();
  const deterministic = (): SynthesisResult => ({
    slots: fallbackSlots(findings),
    model: 'fallback:deterministic',
  });

  // Manual pilot mode or no key → deterministic phrasing (still contract-safe).
  if (cfg.SYNTHESIS_MODE === 'manual' || !cfg.ANTHROPIC_API_KEY) {
    return deterministic();
  }

  const call: Caller = (system, user) =>
    callClaude({
      apiKey: cfg.ANTHROPIC_API_KEY!,
      model: cfg.SYNTHESIS_MODEL,
      temperature: cfg.SYNTHESIS_TEMPERATURE,
      system,
      user,
    });

  try {
    const result = await attemptSlots(findings, call, `${cfg.SYNTHESIS_MODEL}@${cfg.SYNTHESIS_TEMPERATURE}`);
    if (result) return result;
    console.warn('[synthesis] model output failed the contract after a repair retry — using deterministic fallback');
    return deterministic();
  } catch (err) {
    console.warn(`[synthesis] API call failed, using deterministic fallback: ${(err as Error).message}`);
    return deterministic();
  }
}

/** For the manual pilot: expose the exact prompt a human would run by hand. */
export function synthesisPrompt(findings: Findings): { system: string; user: string } {
  return { system: buildSystemPrompt(), user: buildUserPrompt(findings) };
}
