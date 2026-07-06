/**
 * Golden profile · Jaanhvi Hiremath.
 * ChannelAB_Content_v2 requires validating the instrument against a known
 * profile before trusting a cohort: correct scoring must place her as an
 * empathy-led designer with a *storytelling surprise* (strong in behaviour,
 * never claimed) whose wish sits in the impact quadrant while she believes
 * commercial UI pays best — "holding to pull".
 */
import type { RawCapture } from '@reveal/shared';

export const JAANHVI: RawCapture = {
  channel_a: {
    a1_capacities: {
      items: [],
      // She claims empathy & analysis; she does NOT claim narrative (0.05).
      score: {
        empathy: 0.95,
        analytical: 0.88,
        aesthetic: 0.5,
        systems_sensing: 0.62,
        narrative: 0.05,
        conviction: 0.6,
      },
    },
    a2_roles: { project_tags: {}, direct_pick: ['researcher', 'sensemaker'] },
    a3_values: {
      ranked: [
        'empathy',
        'impact',
        'justice',
        'storytelling',
        'teaching',
        'craft',
        'learning_growth',
        'autonomy',
        'beauty',
        'solving_hard_problems',
        'recognition',
        'money_security',
      ],
      never_compromise: { value: 'empathy', why: 'it is the whole point of the work' },
      let_go: ['money_security', 'recognition'],
    },
    a4_conditions: {
      thrive: ['clear_purpose', 'see_who_it_helps', 'in_the_field', 'start_before_figured_out', 'team_shares_cause'],
      wither: ['purely_commercial', 'perfect_before_begin', 'for_portfolio_not_person', 'alone_no_thinking', 'only_money'],
    },
    a7_aspiration: {
      desired_levels: {
        field_research: 0.9,
        venture: 0.85,
        facilitation: 0.8,
        systems_service: 0.7,
        design_research: 0.6,
        framing: 0.5,
        ideation: 0.4,
        prototyping: 0.3,
        craft_execution: 0.3,
        visual_comm: 0.3,
        material_media: 0.2,
        functional_usability: 0.3,
      },
      desired_skills_ranked: ['field_research', 'venture', 'facilitation', 'systems_service', 'design_research'],
      perceived_market_rank: [
        { field: 'UI/UX', rank: 1 },
        { field: 'product design', rank: 2 },
        { field: 'social-impact', rank: 9 },
      ],
      direction_market_stance: 'opposed',
    },
  },
  channel_b: {
    // Attention leans to PEOPLE (empathy) and TEXT (narrative) — the surprise.
    b4_attention: {
      stimuli: [
        {
          stimulus_id: 's1_market',
          marked: [
            { category: 'PEOPLE', order: 1 },
            { category: 'TEXT', order: 2 },
            { category: 'SYSTEM', order: 3 },
          ],
        },
        {
          stimulus_id: 's2_workshop',
          marked: [
            { category: 'TEXT', order: 1 },
            { category: 'PEOPLE', order: 2 },
            { category: 'SYSTEM', order: 3 },
          ],
        },
      ],
    },
    b3_moves: { ordered_moves: ['talk to the people affected', 'tighten the real problem', 'look at the data'] },
    b2_dilemmas: {
      choices: [
        { scenario_id: '2', chosen_pole: 'impact', disposition: 'impact', ms: 3400 },
        { scenario_id: '5', chosen_pole: 'empathy-first', disposition: 'empathy', ms: 2900 },
      ],
    },
    b1_budget: {
      revealed_rank: [
        { value: 'impact', tier: 'core', fund_rank: 1, fund_ms: 1200 },
        { value: 'empathy', tier: 'core', fund_rank: 2, fund_ms: 1400 },
        { value: 'learning_growth', tier: 'core', fund_rank: 3, fund_ms: 1600 },
        { value: 'justice', tier: 'core', fund_rank: 4, fund_ms: 1800 },
        { value: 'money_security', tier: 'cut', fund_rank: 5, fund_ms: 2200 },
        { value: 'recognition', tier: 'cut', fund_rank: 6, fund_ms: 2600 },
      ],
      cut_order: [
        { value: 'recognition', cut_rank: 1, cut_ms: 900 },
        { value: 'money_security', cut_rank: 2, cut_ms: 1100 },
      ],
      total_ms: 12800,
    },
    // Wish → impact quadrant; pays-best → commercial. Actual sits near wish.
    b5_wishsort: {
      wish: [],
      actual: [],
      pays_best: [],
      centroid_wish: { imp: 0.82, hum: 0.6 },
      centroid_actual: { imp: 0.68, hum: 0.5 },
      centroid_lucrative: { imp: -0.62, hum: -0.15 },
    },
    b6_upload: {
      images: [{ ref: 'img1', why: 'the light, and that it felt old' }],
      detected_thread: ['human-present', 'story-laden', 'historical'],
      confirmed: null,
    },
    b8_disruption: { disruptions: [{ response: 'reframe', recovery_ms: 4200, generated_new: true }] },
  },
  portfolio: {
    projects: [
      {
        project_id: 'p1',
        title: 'ReVIVE',
        domain: 'organ transport · health',
        initiated: 'self',
        group: 'solo',
        roles: ['researcher', 'sensemaker', 'empathiser_advocate'],
        demonstrated_capabilities: ['design_research', 'framing'],
        commercial_impact_self_tag: 0.9,
      },
      {
        project_id: 'p2',
        title: 'Godh',
        domain: 'postpartum care',
        initiated: 'assigned',
        group: 'group',
        roles: ['researcher', 'sensemaker'],
        demonstrated_capabilities: ['design_research'],
        commercial_impact_self_tag: 0.6,
      },
      {
        project_id: 'p3',
        title: 'Fauna Sense',
        domain: 'wildlife',
        initiated: 'assigned',
        group: 'group',
        roles: ['researcher'],
        demonstrated_capabilities: ['framing'],
        commercial_impact_self_tag: 0.5,
      },
      {
        project_id: 'p4',
        title: 'The Ibex',
        domain: 'commercial branding',
        initiated: 'assigned',
        group: 'group',
        roles: ['builder_maker'],
        demonstrated_capabilities: ['visual_comm'],
        commercial_impact_self_tag: -0.6,
      },
    ],
    resume: { uploaded: true, file_ref: 'resume.pdf', parsed_frame: 'commercial' },
  },
};
