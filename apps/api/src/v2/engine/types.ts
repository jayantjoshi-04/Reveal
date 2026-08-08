/**
 * REVEAL v2 engine — internal types.
 *
 * The engine is a pure function of (master data + raw capture + ruleset). It
 * never reads the DB directly, so every stage is unit-testable. Persistence is
 * a separate concern handled by the route/service layer.
 */
import type {
  Channel,
  CoherenceBand,
  ConfidenceTier,
  Family,
  MoleculeConfidence,
  ReadinessDimension,
  ReadinessTier,
  Resolvedness,
  SayDoGapClass,
  Tier,
  Valence,
} from '@reveal/shared/v2';

// ── Master data (Layer 2, from the seed) ────────────────────────────────────
export interface ConstructRow {
  id: string;
  family: Family;
  name: string;
  type: string; // amount | gap | bipolar | valenced_driver | tradeoff_axis
  scale: string;
  edgeLow: string | null;
  edgeHigh: string | null;
  hardnessToClose: number | null;
}
export interface OptionRow {
  id: string;
  activityId: string;
  rungOrStep: string;
  label: string;
  mapsToConstructId: string | null;
  channel: string | null;
  edge: string | null;
  driver: string | null;
  valence: string | null;
  axis: string | null;
  magnitude: string | null;
  isEscape: boolean;
}
export interface DerivationRow {
  id: string;
  activityId: string;
  source: string;
  observable: string;
  mapsToConstructId: string | null;
  channel: string | null;
  edgeOrSignal: string | null;
  note: string | null;
}
export interface MoleculeRow {
  id: string;
  type: string;
  name: string;
  legs: string;
  renderTemplate: string;
  reportSlot: string;
  priority: number | null;
}
export interface RoleRow {
  id: string;
  track: string;
  name: string;
  primaryIntent: string | null;
}
export interface DomainRow {
  id: string;
  track: string;
  name: string;
  criticalSkills: { skill: string; required_level: number }[];
}
export interface ProfileRow {
  id: string;
  targetType: string; // role | domain
  targetId: string;
  constructId: string;
  requiredLevel: number;
  isCritical: boolean;
}
export interface GrowthRow {
  id: string;
  type: string;
  title: string;
  closesGapType: string;
  targetConstructs: string[];
  selectionPredicate: string;
  closeability: string | null;
  renderTemplate: string;
}

export interface MasterData {
  constructs: ConstructRow[];
  options: OptionRow[];
  derivations: DerivationRow[];
  molecules: MoleculeRow[];
  roles: RoleRow[];
  domains: DomainRow[];
  profiles: ProfileRow[];
  growth: GrowthRow[];
}

// ── Raw capture (Layer 3) ───────────────────────────────────────────────────
/**
 * A direct construct read supplied by the capture instrument (a behavioural DO
 * measurement, or a parsed résumé SAY claim). Value is in the construct's
 * native scale: 0..100 for amount, −100..+100 for bipolar/axis.
 */
export interface Signal {
  constructId: string;
  channel: Channel;
  value: number;
  edge?: string | null;
  position?: number | null;
  driver?: string | null;
  valence?: Valence | null;
}
export interface RawPayload {
  /** Ticked activity_option ids (reaction / ladder / trade-off / picks). */
  selected_option_ids?: string[];
  /** Direct behavioural/claim reads keyed to constructs. */
  signals?: Signal[];
}
export interface RawResponse {
  activityId: string;
  channel: Channel;
  rawPayload: RawPayload;
}
export interface PortfolioArtifactIn {
  source: string;
  evidenceMap: Record<string, number>; // constructId → 0..1 evidence strength
}
export interface ExperienceEntryIn {
  descriptor: string;
  reps: number;
  contextVariety: number;
  realVsSimulated: 'real' | 'simulated';
}
export interface RawCapture {
  responses: RawResponse[];
  portfolio?: PortfolioArtifactIn[];
  experience?: ExperienceEntryIn[];
  factual?: Record<string, unknown>;
  /** The student's chosen direction (role×domain), if picked at phase 4. */
  chosenDirection?: { roleId: string; domainId: string };
  enrolledField?: string | null;
}

// ── Derived (Layer 4) ───────────────────────────────────────────────────────
export interface AtomT {
  constructId: string;
  channel: Channel;
  value: number;
  position: number | null;
  resolvedness: Resolvedness | null;
  sourceActivityId: string;
}
export interface ScoreT {
  constructId: string;
  family: Family;
  type: string;
  name: string;
  sayValue: number | null;
  doValue: number | null;
  blendedValue: number;
  /** For capacities (DO-by-design), the demonstrated read used for firing/fit;
   *  equals doValue when present. The ring still shows blendedValue. */
  demonstratedValue: number;
  positionEdge: string | null;
  resolvedness: Resolvedness | null;
  confidenceTier: ConfidenceTier;
  evidenceCount: number;
  gateFlag: boolean;
  sayDoGapClass: SayDoGapClass | null;
  sourceActivities: string[];
}
export interface MoleculeFiredT {
  moleculeRuleId: string;
  type: string;
  fired: boolean;
  curatedIn: boolean;
  confidenceTier: MoleculeConfidence;
  reportSlot: string;
  renderedText: string;
  priority: number;
  signal: number;
  directionId?: string | null;
}
export interface DirectionT {
  roleId: string;
  domainId: string;
  roleName: string;
  domainName: string;
  roleFit: number;
  domainFit: number;
  proximityScore: number;
  rank: number;
  aptitudeLevel: 'high' | 'low';
  interestLevel: 'high' | 'low';
  quadrant: string;
  valuesConflictFlag: boolean;
  isChosen: boolean;
  unlocked: boolean;
}
export interface ReadinessT {
  dimension: ReadinessDimension;
  score: number;
  tier: ReadinessTier;
}
export interface GrowthSelectionT {
  growthVehicleId: string;
  title: string;
  type: string;
  gapTag: string;
  rank: number;
  renderedText: string;
  directionRef: string | null;
}
export interface FindingT {
  kind: 'coherence' | 'surprise' | 'outlier' | 'gate_observation';
  text: string;
  confidenceTier: ConfidenceTier;
  meta?: Record<string, unknown>;
}

export interface EngineResult {
  atoms: AtomT[];
  scores: ScoreT[];
  molecules: MoleculeFiredT[];
  directions: DirectionT[];
  readiness: ReadinessT[];
  growth: GrowthSelectionT[];
  findings: FindingT[];
  coherenceBand: CoherenceBand;
}

export interface EngineContext {
  master: MasterData;
  tier: Tier;
  rulesetVersion: string;
}
