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
import { buildSystemPrompt, buildUserPrompt } from './prompt.js';
import { validateSlots } from './validate.js';
import { callClaude, extractJson } from './client.js';
import { fallbackSlots } from './fallback.js';

export interface SynthesisResult {
  slots: ReportSlots;
  model: string;
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

  try {
    const raw = await callClaude({
      apiKey: cfg.ANTHROPIC_API_KEY,
      model: cfg.SYNTHESIS_MODEL,
      temperature: cfg.SYNTHESIS_TEMPERATURE,
      system: buildSystemPrompt(),
      user: buildUserPrompt(findings),
    });

    const parsed = reportSlotsSchema.safeParse(extractJson(raw));
    if (!parsed.success) {
      console.warn('[synthesis] model output failed shape check — using deterministic fallback');
      return deterministic();
    }

    const check = validateSlots(parsed.data);
    if (!check.ok) {
      // Contract violation is an integrity failure — do not ship it.
      console.warn(`[synthesis] contract violations, using deterministic fallback: ${check.errors.join('; ')}`);
      return deterministic();
    }

    return { slots: parsed.data, model: `${cfg.SYNTHESIS_MODEL}@${cfg.SYNTHESIS_TEMPERATURE}` };
  } catch (err) {
    console.warn(`[synthesis] API call failed, using deterministic fallback: ${(err as Error).message}`);
    return deterministic();
  }
}

/** For the manual pilot: expose the exact prompt a human would run by hand. */
export function synthesisPrompt(findings: Findings): { system: string; user: string } {
  return { system: buildSystemPrompt(), user: buildUserPrompt(findings) };
}
