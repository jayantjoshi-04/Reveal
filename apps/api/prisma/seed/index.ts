/**
 * REVEAL v2.0.0 — master-data seed loader.
 *
 * Loads the 12 import-ready seed JSONs (packages authored in the handover) into
 * the Layer-2 tables, respecting FK order. Idempotent: every table is cleared
 * and re-inserted, so `pnpm --filter @reveal/api v2:seed` can be re-run freely.
 *
 * Pricing tables (product, price_rule) are intentionally excluded.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, 'data');
const prisma = new PrismaClient();

function load<T = Record<string, unknown>>(file: string): T[] {
  return JSON.parse(readFileSync(join(DATA, file), 'utf8')) as T[];
}

/** JSON uses Python-ish null sentinels in a few string fields; normalise. */
function nn(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v);
  return s === 'None' || s === '' ? null : s;
}

async function main(): Promise<void> {
  console.log('· clearing v2 master-data tables');
  // Order: children before parents (though seed rows have no cross-FK deletes,
  // clearing in reverse load order keeps it safe).
  await prisma.growthVehicle.deleteMany();
  await prisma.requiredProfile.deleteMany();
  await prisma.moleculeRule.deleteMany();
  await prisma.derivationRule.deleteMany();
  await prisma.activityOption.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.domain.deleteMany();
  await prisma.role.deleteMany();
  await prisma.intentDriver.deleteMany();
  await prisma.construct.deleteMany();
  // RulesetVersion is referenced by instances; only clear when no instance uses it.
  await prisma.rulesetVersion.deleteMany().catch(() => {
    console.log('  (ruleset_version in use by an instance — upserting instead)');
  });

  // 1 · constructs
  const constructs = load('constructs.json');
  await prisma.construct.createMany({
    data: constructs.map((c) => ({
      id: String(c.id),
      family: String(c.family),
      name: String(c.name),
      type: String(c.type),
      scale: String(c.scale),
      edgeLow: nn(c.edge_low),
      edgeHigh: nn(c.edge_high),
      driverTier: c.driver_tier == null ? null : Number(c.driver_tier),
      hardnessToClose: c.hardness_to_close == null ? null : Number(c.hardness_to_close),
      active: c.active !== false,
    })),
  });
  console.log(`✓ constructs        ${constructs.length}`);

  // 2 · intent drivers
  const drivers = load('intent_drivers.json');
  await prisma.intentDriver.createMany({
    data: drivers.map((d) => ({
      id: String(d.id),
      name: String(d.name),
      tier: Number(d.tier),
      defaultValence: String(d.default_valence),
    })),
  });
  console.log(`✓ intent_drivers    ${drivers.length}`);

  // 3 · ruleset_version (the determinism anchor)
  const rulesets = load('ruleset_version.json');
  for (const r of rulesets) {
    await prisma.rulesetVersion.upsert({
      where: { id: String(r.id) },
      update: {},
      create: {
        id: String(r.id),
        version: String(r.version),
        notes: nn(r.notes),
        isActive: r.is_active !== false,
        scoringConstants: r.scoring_constants as object,
        proximityWeights: r.proximity_weights as object,
        readinessThresholds: r.readiness_thresholds as object,
        curationWeights: r.curation_weights as object,
        evidenceThreshold: Number(r.evidence_threshold),
        changeThresholds: r.change_thresholds as object,
      },
    });
  }
  console.log(`✓ ruleset_version   ${rulesets.length}`);

  // 4 · roles
  const roles = load('roles.json');
  await prisma.role.createMany({
    data: roles.map((r) => ({
      id: String(r.id),
      track: String(r.track),
      name: String(r.name),
      primaryIntent: nn(r.primary_intent),
      note: nn(r.note),
    })),
  });
  console.log(`✓ roles             ${roles.length}`);

  // 5 · domains
  // The seed lists 23 display rows but only 21 distinct ids: two domains
  // (Social Impact, Rural/Agri) appear in both the physical and digital track
  // sharing one id and one required_profile. Proximity scores on the profile,
  // so the 21 distinct ids are the scorable set — skipDuplicates keeps the
  // first (physical) occurrence, which is lossless for fit.
  const domains = load('domains.json');
  const created = await prisma.domain.createMany({
    data: domains.map((d) => ({
      id: String(d.id),
      track: String(d.track),
      name: String(d.name),
      emphasis: nn(d.emphasis),
      primaryIntent: nn(d.primary_intent),
      note: nn(d.note),
      criticalSkills: (d.critical_skills ?? []) as object,
    })),
    skipDuplicates: true,
  });
  console.log(`✓ domains           ${created.count} distinct (of ${domains.length} rows)`);

  // 6 · activities
  const activities = load('activities.json');
  await prisma.activity.createMany({
    data: activities.map((a) => ({
      id: String(a.id),
      code: String(a.code),
      label: String(a.label),
      channel: String(a.channel),
      format: String(a.format),
      phase: Number(a.phase),
      parallelFormGroup: nn(a.parallel_form_group),
      captureSchemaNote: nn(a.capture_schema_note),
      ordering: Number(a.ordering),
    })),
  });
  console.log(`✓ activities        ${activities.length}`);

  // 7 · activity_options
  const options = load('activity_options.json');
  await prisma.activityOption.createMany({
    data: options.map((o) => ({
      id: String(o.id),
      activityId: String(o.activity_id),
      rungOrStep: String(o.rung_or_step),
      label: String(o.label),
      mapsToConstructId: nn(o.maps_to_construct_id),
      channel: nn(o.channel),
      edge: nn(o.edge),
      driver: nn(o.driver),
      valence: nn(o.valence),
      axis: nn(o.axis),
      magnitude: nn(o.magnitude),
      isEscape: o.is_escape === true,
    })),
  });
  console.log(`✓ activity_options  ${options.length}`);

  // 8 · derivation_rules
  const derivations = load('derivation_rules.json');
  await prisma.derivationRule.createMany({
    data: derivations.map((d) => ({
      id: String(d.id),
      activityId: String(d.activity_id),
      source: String(d.source),
      observable: String(d.observable),
      mapsToConstructId: nn(d.maps_to_construct_id),
      channel: nn(d.channel),
      edgeOrSignal: nn(d.edge_or_signal),
      note: nn(d.note),
    })),
  });
  console.log(`✓ derivation_rules  ${derivations.length}`);

  // 9 · molecule_rules
  const molecules = load('molecule_rules.json');
  await prisma.moleculeRule.createMany({
    data: molecules.map((m) => ({
      id: String(m.id),
      type: String(m.type),
      name: String(m.name),
      legs: String(m.legs),
      mechanism: String(m.mechanism),
      triggerExpr: String(m.trigger_expr),
      siblingOrNull: nn(m.sibling_or_null),
      confidenceRule: String(m.confidence_rule),
      renderTemplate: String(m.render_template),
      reportSlot: String(m.report_slot),
      priority: m.priority == null ? null : Number(m.priority),
    })),
  });
  console.log(`✓ molecule_rules    ${molecules.length}`);

  // 10 · required_profiles
  const profiles = load('required_profiles.json');
  await prisma.requiredProfile.createMany({
    data: profiles.map((p) => ({
      id: String(p.id),
      targetType: String(p.target_type),
      targetId: String(p.target_id),
      constructId: String(p.construct_id),
      requiredLevel: Number(p.required_level),
      isCritical: p.is_critical === true,
      valuesAxisProfile: (p.values_axis_profile ?? null) as object | null,
    })),
  });
  console.log(`✓ required_profiles ${profiles.length}`);

  // 11 · growth_vehicles
  const vehicles = load('growth_vehicles.json');
  await prisma.growthVehicle.createMany({
    data: vehicles.map((g) => ({
      id: String(g.id),
      type: String(g.type),
      title: String(g.title),
      closesGapType: String(g.closes_gap_type),
      targetConstructs: (g.target_constructs ?? []) as object,
      selectionPredicate: String(g.selection_predicate),
      relevanceBasis: nn(g.relevance_basis),
      gapMetric: nn(g.gap_metric),
      closeability: nn(g.closeability),
      evidence: nn(g.evidence),
      effort: nn(g.effort),
      renderTemplate: String(g.render_template),
    })),
  });
  console.log(`✓ growth_vehicles   ${vehicles.length}`);

  console.log('\n✅ v2 seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
