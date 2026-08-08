/**
 * v2 generation service — the bridge between the DB and the pure engine.
 *
 * Loads master data + an instance's raw capture, runs the deterministic engine,
 * and persists the derived (L4) + payload (L5) layers. The engine is the ONLY
 * writer of those layers (determinism firewall).
 */
import type { ReportPayloadV2 } from '@reveal/shared/v2';
import { prisma } from './prisma.js';
import { loadMasterFromDb } from './master.js';
import { runEngine } from './engine/index.js';
import { assemblePayload } from './engine/assembly.js';
import type { RawCapture, RawPayload } from './engine/types.js';

const ACTIVE_RULESET = '2.0.0';

async function loadRawCapture(instanceId: string, enrolledField: string | null): Promise<RawCapture> {
  const db = prisma();
  const [responses, portfolio, experience, factual] = await Promise.all([
    db.activityResponse.findMany({ where: { reportInstanceId: instanceId } }),
    db.portfolioArtifact.findMany({ where: { reportInstanceId: instanceId } }),
    db.experienceEntry.findMany({ where: { reportInstanceId: instanceId } }),
    db.factualInventory.findMany({ where: { reportInstanceId: instanceId } }),
  ]);
  return {
    enrolledField,
    responses: responses.map((r) => ({
      activityId: r.activityId,
      channel: r.channel as 'say' | 'do',
      rawPayload: (r.rawPayload as RawPayload) ?? {},
    })),
    portfolio: portfolio.map((p) => ({ source: p.source, evidenceMap: (p.evidenceMap as Record<string, number>) ?? {} })),
    experience: experience.map((e) => ({
      descriptor: e.descriptor,
      reps: e.reps,
      contextVariety: e.contextVariety,
      realVsSimulated: e.realVsSimulated as 'real' | 'simulated',
    })),
    factual: (factual[0]?.facts as Record<string, unknown>) ?? {},
  };
}

/** Run the engine for an instance, persist L4 + L5, return the compiled payload. */
export async function generateReport(instanceId: string): Promise<ReportPayloadV2> {
  const db = prisma();
  const instance = await db.reportInstance.findUnique({ where: { id: instanceId }, include: { student: true, ruleset: true } });
  if (!instance) throw Object.assign(new Error('instance not found'), { statusCode: 404 });

  const master = await loadMasterFromDb(db);
  const raw = await loadRawCapture(instanceId, instance.student.enrolledField);
  const tier = instance.tier as 'free' | 'paid';
  const result = runEngine({ master, tier, rulesetVersion: ACTIVE_RULESET }, raw);

  const payload = assemblePayload(result, master, raw, {
    reportInstanceId: instanceId,
    studentName: instance.student.name,
    enrolledField: instance.student.enrolledField,
    tier,
    instanceType: instance.instanceType as 'baseline' | 're_run',
    rulesetVersion: instance.ruleset.version,
    asOfDate: new Date().toISOString().slice(0, 10),
    priorInstanceId: instance.priorInstanceId,
  });

  const rvId = instance.rulesetVersionId;
  await db.$transaction(async (tx) => {
    // clear any prior derived + payload for a clean re-generate
    await Promise.all([
      tx.atom.deleteMany({ where: { reportInstanceId: instanceId } }),
      tx.constructScore.deleteMany({ where: { reportInstanceId: instanceId } }),
      tx.moleculeFired.deleteMany({ where: { reportInstanceId: instanceId } }),
      tx.direction.deleteMany({ where: { reportInstanceId: instanceId } }),
      tx.readiness.deleteMany({ where: { reportInstanceId: instanceId } }),
      tx.growthSelection.deleteMany({ where: { reportInstanceId: instanceId } }),
      tx.finding.deleteMany({ where: { reportInstanceId: instanceId } }),
      tx.reportPayload.deleteMany({ where: { reportInstanceId: instanceId } }),
    ]);

    await tx.constructScore.createMany({
      data: result.scores.map((s) => ({
        reportInstanceId: instanceId,
        constructId: s.constructId,
        sayValue: s.sayValue,
        doValue: s.doValue,
        blendedValue: s.blendedValue,
        positionEdge: s.positionEdge,
        resolvedness: s.resolvedness,
        confidenceTier: s.confidenceTier,
        evidenceCount: s.evidenceCount,
        gateFlag: s.gateFlag,
        sayDoGapClass: s.sayDoGapClass,
        rulesetVersionId: rvId,
      })),
    });
    if (result.atoms.length)
      await tx.atom.createMany({
        data: result.atoms.map((a) => ({
          reportInstanceId: instanceId,
          constructId: a.constructId,
          channel: a.channel,
          value: a.value,
          position: a.position,
          resolvedness: a.resolvedness,
          sourceActivityId: a.sourceActivityId,
          rulesetVersionId: rvId,
        })),
      });
    await tx.moleculeFired.createMany({
      data: result.molecules.map((m) => ({
        reportInstanceId: instanceId,
        moleculeRuleId: m.moleculeRuleId,
        fired: m.fired,
        curatedIn: m.curatedIn,
        confidenceTier: m.confidenceTier,
        reportSlot: m.reportSlot,
        renderedText: m.renderedText,
        rulesetVersionId: rvId,
      })),
    });
    await tx.direction.createMany({
      data: result.directions.slice(0, 30).map((d) => ({
        reportInstanceId: instanceId,
        roleId: d.roleId,
        domainId: d.domainId,
        roleFit: d.roleFit,
        domainFit: d.domainFit,
        proximityScore: d.proximityScore,
        rank: d.rank,
        aptitudeLevel: d.aptitudeLevel,
        interestLevel: d.interestLevel,
        quadrant: d.quadrant,
        valuesConflictFlag: d.valuesConflictFlag,
        isChosen: d.isChosen,
        unlocked: d.unlocked,
        rulesetVersionId: rvId,
      })),
    });
    await tx.readiness.createMany({
      data: result.readiness.map((r) => ({ reportInstanceId: instanceId, dimension: r.dimension, score: r.score, tier: r.tier, rulesetVersionId: rvId })),
    });
    if (result.growth.length)
      await tx.growthSelection.createMany({
        data: result.growth.map((g) => ({
          reportInstanceId: instanceId,
          growthVehicleId: g.growthVehicleId,
          gapTag: g.gapTag,
          rank: g.rank,
          renderedText: g.renderedText,
          rulesetVersionId: rvId,
        })),
      });
    await tx.finding.createMany({
      data: result.findings.map((f) => ({ reportInstanceId: instanceId, kind: f.kind, text: f.text, confidenceTier: f.confidenceTier, meta: (f.meta ?? {}) as object, rulesetVersionId: rvId })),
    });
    await tx.reportPayload.create({ data: { reportInstanceId: instanceId, payload: payload as unknown as object, rulesetVersionId: rvId } });
    await tx.reportInstance.update({ where: { id: instanceId }, data: { status: 'generated', generatedAt: new Date() } });
  });

  return payload;
}

/** The active ruleset row id, seeding it lazily if absent. */
export async function activeRulesetId(): Promise<string> {
  const db = prisma();
  const rv = await db.rulesetVersion.findFirst({ where: { isActive: true } });
  if (!rv) throw Object.assign(new Error('no active ruleset — run v2:seed'), { statusCode: 500 });
  return rv.id;
}
