/**
 * B tasks, B6 rubric, B4 scenes, and the frozen scoring constants
 * (ChannelAB_Content_v2 + Analysis_Report_Templates_v3).
 */
import { SCORING } from '@reveal/shared';

export interface BTaskSeed {
  task_code: string;
  params: Record<string, unknown>;
  trait_tags: { trait: string; weight: number }[];
}

export const B_TASKS: BTaskSeed[] = [
  {
    task_code: 'b1',
    params: { fund: 6, keep: 4, cut: 2, cards: 12 },
    trait_tags: [
      { trait: 'values', weight: 1.0 },
      { trait: 'conviction', weight: 1.0 },
      { trait: 'conditions', weight: 0.5 },
      { trait: 'aspiration', weight: 0.5 },
    ],
  },
  {
    task_code: 'b2',
    params: { cards: 8, nudge_ms: 12000 },
    trait_tags: [
      { trait: 'empathy', weight: 1.0 },
      { trait: 'roles', weight: 1.0 },
      { trait: 'values', weight: 1.0 },
      { trait: 'conditions', weight: 1.0 },
      { trait: 'analytical', weight: 0.5 },
    ],
  },
  {
    task_code: 'b3',
    params: { palette: 8, pick: 3 },
    trait_tags: [
      { trait: 'capacities', weight: 1.0 },
      { trait: 'roles', weight: 1.0 },
    ],
  },
  {
    task_code: 'b4',
    params: { scenes: 5, seconds: 8, taps: 3 },
    trait_tags: [
      { trait: 'capacities', weight: 1.0 },
      { trait: 'salience', weight: 1.0 },
      { trait: 'storytelling', weight: 0.5 },
    ],
  },
  {
    task_code: 'b5',
    params: { artifacts: 40, passes: 3, pick: 8, pays_best_last: true },
    trait_tags: [
      { trait: 'salience', weight: 1.0 },
      { trait: 'aspiration', weight: 1.0 },
      { trait: 'gap', weight: 1.0 },
      { trait: 'market', weight: 1.0 },
      { trait: 'obsessions', weight: 0.5 },
    ],
  },
  {
    task_code: 'b6',
    params: { min_images: 3, max_images: 5 },
    trait_tags: [
      { trait: 'salience', weight: 1.0 },
      { trait: 'obsessions', weight: 1.0 },
      { trait: 'storytelling', weight: 0.5 },
      { trait: 'craft', weight: 0.5 },
    ],
  },
  {
    task_code: 'b7',
    params: { months: 12 },
    trait_tags: [
      { trait: 'obsessions', weight: 1.0 },
      { trait: 'aspiration', weight: 1.0 },
      { trait: 'values', weight: 0.5 },
      { trait: 'conviction', weight: 0.5 },
    ],
  },
  {
    task_code: 'b8',
    params: { duration_ms: 180000, disrupt_at: 0.6, disruptions: 2 },
    trait_tags: [
      { trait: 'conditions', weight: 1.0 },
      { trait: 'conviction', weight: 0.5 },
      { trait: 'aspiration', weight: 0.5 },
    ],
  },
];

/** B6 coding rubric dimensions (ChannelAB_Content_v2). */
export const RUBRIC_DIMENSIONS = [
  { name: 'subject', poles: 'human-present ↔ object/empty' },
  { name: 'era', poles: 'historical/aged ↔ contemporary' },
  { name: 'complexity', poles: 'ornate/dense ↔ minimal/spare' },
  { name: 'emotion', poles: 'warm/intimate ↔ cool/formal' },
  { name: 'origin', poles: 'natural ↔ built/made' },
  { name: 'narrative', poles: 'story-laden ↔ purely formal' },
  { name: 'craft', poles: 'handmade/imperfect ↔ precise/manufactured' },
];

/** B4 attention scenes. Zones are placeholders — real, area-balanced polygons
 *  are authored per uploaded image in the admin console. */
export const SCENES = [
  { stimulus_id: 's1_market', label: 'Street market' },
  { stimulus_id: 's2_workshop', label: 'Workshop bench' },
  { stimulus_id: 's3_transit', label: 'Transit concourse' },
  { stimulus_id: 's4_hall', label: 'Community hall, mid-event' },
  { stimulus_id: 's5_product', label: 'Product still-life' },
].map((s) => ({
  ...s,
  zones: [
    { category: 'PEOPLE', polygon: [] },
    { category: 'FORM', polygon: [] },
    { category: 'SYSTEM', polygon: [] },
    { category: 'DETAIL', polygon: [] },
    { category: 'TEXT', polygon: [] },
  ],
}));

/** The frozen scoring constants seeded for instrument version 1.0. */
export const SCORING_CONSTANTS: { key: string; value: number }[] = [
  { key: 'weight_primary', value: SCORING.WEIGHT_PRIMARY },
  { key: 'weight_secondary', value: SCORING.WEIGHT_SECONDARY },
  { key: 'a_present', value: SCORING.A_PRESENT },
  { key: 'a_absent', value: SCORING.A_ABSENT },
  { key: 'b_points_toward', value: SCORING.B_POINTS_TOWARD },
  { key: 'contradiction_a', value: SCORING.CONTRADICTION_A },
  { key: 'contradiction_b', value: SCORING.CONTRADICTION_B },
  { key: 'demonstrated_b_weight', value: SCORING.DEMONSTRATED_B_WEIGHT },
  { key: 'demonstrated_a_weight', value: SCORING.DEMONSTRATED_A_WEIGHT },
  { key: 'gap_meaningful', value: SCORING.GAP_MEANINGFUL },
  { key: 'b5_band_small', value: SCORING.B5_BAND_SMALL },
  { key: 'b5_band_large', value: SCORING.B5_BAND_LARGE },
  { key: 'cc3_min_agree', value: SCORING.CC3_MIN_AGREE },
  { key: 'cc2_min_agree', value: SCORING.CC2_MIN_AGREE },
  { key: 'surprise_min_situations', value: SCORING.SURPRISE_MIN_SITUATIONS },
];
