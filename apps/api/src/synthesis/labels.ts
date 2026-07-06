/** Human-readable labels for trait codes, shared by the fallback phraser. */
export const LABELS: Record<string, string> = {
  // capacities
  empathy: 'empathy',
  analytical: 'analytical thinking',
  aesthetic: 'aesthetic sense',
  systems_sensing: 'systems-sensing',
  narrative: 'storytelling',
  conviction: 'conviction',
  // capabilities
  design_research: 'design research',
  field_research: 'field research',
  framing: 'problem framing',
  ideation: 'ideation',
  prototyping: 'prototyping',
  craft_execution: 'craft & execution',
  visual_comm: 'visual & communication design',
  material_media: 'material & media mastery',
  functional_usability: 'functional / usability design',
  systems_service: 'systems & service design',
  facilitation: 'facilitation & leadership',
  venture: 'venture-building',
  // roles
  researcher: 'researcher',
  empathiser_advocate: 'empathiser',
  storyteller: 'storyteller',
  sensemaker: 'sensemaker',
  builder_maker: 'builder',
  facilitator_leader: 'facilitator',
  organiser: 'organiser',
  // values
  impact: 'impact',
  justice: 'justice',
  storytelling: 'storytelling',
  teaching: 'teaching',
  craft: 'craft',
  autonomy: 'autonomy',
  recognition: 'recognition',
  money_security: 'money & security',
  learning_growth: 'learning & growth',
  beauty: 'beauty',
  solving_hard_problems: 'solving hard problems',
  // directions
  commercial: 'commercial',
  mixed: 'a mix',
};

export function label(code: string): string {
  return LABELS[code] ?? code.replace(/_/g, ' ');
}
