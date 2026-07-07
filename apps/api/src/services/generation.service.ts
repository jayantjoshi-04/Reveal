/**
 * Generation: runs the deterministic engine at capture_complete, and — only on
 * facilitator approval — the single synthesis call, cached exactly once.
 */
import type { Findings, HighStakesSummary } from '@reveal/shared';
import { run as runEngine } from '../engine/index.js';
import { synthesize } from '../synthesis/index.js';
import * as captureRepo from '../repositories/capture.repo.js';
import * as derivedRepo from '../repositories/derived.repo.js';
import * as reviewRepo from '../repositories/review.repo.js';
import * as instanceRepo from '../repositories/instance.repo.js';
import { getLiveVersionId, getScoringConstants, getA1Appearances } from '../repositories/instrument.repo.js';
import { HttpError } from './errors.js';

/** Layer 2 · compute derived findings + open a facilitator review row. No LLM. */
export async function runEngineFor(instanceId: string): Promise<void> {
  const raw = await captureRepo.getRawCapture(instanceId);
  if (!raw) throw new Error(`no raw_capture for instance ${instanceId}`);

  const versionId = await getLiveVersionId();
  const constants = versionId ? await getScoringConstants(versionId) : undefined;
  // A-scores are recomputed from raw items using these — never trusted from the client.
  const appearances = versionId ? await getA1Appearances(versionId) : undefined;

  const out = runEngine(raw, constants, appearances);
  await derivedRepo.upsertDerived(instanceId, {
    engine_version: out.engine_version,
    findings: out.findings,
    trait_scores: out.trait_scores,
  });
  await reviewRepo.ensureReview(instanceId, buildHighStakes(out.findings));
}

export interface GenerateResult {
  generated: boolean; // true if this call produced the report, false if it was already cached
  model: string;
}

/**
 * Layer 3 · the ONLY LLM trigger. Idempotent: if a report already exists it is
 * a no-op. The unique PK on report_payload makes a second synthesis impossible.
 */
const GENERATABLE = new Set(['capture_complete', 'generated', 'reviewed', 'released']);

export async function generateReport(instanceId: string, reviewerId?: string): Promise<GenerateResult> {
  // Never synthesise from half-finished capture.
  const instance = await instanceRepo.getInstance(instanceId);
  if (!instance) throw new Error(`instance ${instanceId} not found`);
  if (!GENERATABLE.has(instance.status)) {
    throw new HttpError(409, 'capture is not complete — cannot generate a report yet');
  }

  const existing = await derivedRepo.getReportPayload(instanceId);
  if (existing) return { generated: false, model: existing.model };

  // Ensure derived exists (engine is cheap + deterministic; safe to (re)run).
  let derived = await derivedRepo.getDerived(instanceId);
  if (!derived) {
    await runEngineFor(instanceId);
    derived = await derivedRepo.getDerived(instanceId);
  }
  if (!derived) throw new Error(`could not compute derived findings for ${instanceId}`);

  const { slots, model } = await synthesize(derived.findings);
  const inserted = await derivedRepo.insertReportPayloadOnce(instanceId, slots, model);

  if (inserted) {
    await instanceRepo.setInstanceStatus(instanceId, 'released', { generated: true });
    await reviewRepo.updateReview(instanceId, { decision: 'approved', reviewer_id: reviewerId });
  }
  return { generated: inserted, model };
}

/** Distil the computed findings into the high-stakes panel the facilitator reviews. */
export function buildHighStakes(findings: Findings): HighStakesSummary {
  return {
    surprises: findings.surprises.map((s) => ({ trait: s.trait, situations: s.situations })),
    coherence: findings.project_pattern.outlier
      ? {
          contradiction: true,
          work_frame: findings.differentiation.direction,
          adjudicated: 'work',
        }
      : { contradiction: false },
    gaps: findings.gap
      .filter((g) => g.classification === 'real')
      .map((g) => ({ capability: g.capability, classification: g.classification })),
    market:
      findings.market.classification !== 'aligned'
        ? { classification: findings.market.classification, market_gap: findings.market.market_gap }
        : null,
  };
}
