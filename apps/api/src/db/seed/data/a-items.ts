/**
 * A1 · Capacities · 9 cover-and-normalise items (ChannelAB_Content_v2).
 * Tags use the two-letter codes EM/AN/AE/SY/NA/CV → CAPACITY_BY_TAG.
 * ★ = non-design domain (orthodoxy guard).
 */
export interface AItemSeed {
  module_code: string;
  seq: number;
  prompt: string;
  is_non_design: boolean;
  options: { label: string; tag: string }[];
}

export const A1_ITEMS: AItemSeed[] = [
  {
    module_code: 'a1',
    seq: 1,
    is_non_design: false,
    prompt: "You're handed a project you genuinely care about. Before anything else, you find yourself…",
    options: [
      { label: "talking to the people it's for", tag: 'EM' },
      { label: 'working out the underlying logic', tag: 'AN' },
      { label: 'picturing how it should look & feel', tag: 'AE' },
      { label: 'seeing how the whole thing connects', tag: 'SY' },
      { label: 'getting the story it must tell right', tag: 'NA' },
      { label: 'clarifying what it should stand for', tag: 'CV' },
    ],
  },
  {
    module_code: 'a1',
    seq: 2,
    is_non_design: true,
    prompt: "A neighbour's well-loved old chair has broken; they ask your help. You first…",
    options: [
      { label: 'ask what the chair means to them', tag: 'EM' },
      { label: 'work out exactly how it failed', tag: 'AN' },
      { label: 'notice its form & proportion', tag: 'AE' },
      { label: 'get curious where it came from', tag: 'NA' },
      { label: "decide if it's worth saving", tag: 'CV' },
    ],
  },
  {
    module_code: 'a1',
    seq: 3,
    is_non_design: true,
    prompt: 'A town asks you to improve its weekly market. Your instinct is to…',
    options: [
      { label: 'talk to stallholders & shoppers', tag: 'EM' },
      { label: 'map the flow, find bottlenecks', tag: 'AN' },
      { label: 'see the market as one connected system', tag: 'SY' },
      { label: 'find its character & play it up', tag: 'NA' },
      { label: 'decide what it should mean to the town', tag: 'CV' },
    ],
  },
  {
    module_code: 'a1',
    seq: 4,
    is_non_design: false,
    prompt: "You walk into a museum exhibit that clearly isn't working. You first notice…",
    options: [
      { label: 'visitors look lost, unhelped', tag: 'EM' },
      { label: 'the sequence makes no sense', tag: 'AN' },
      { label: "it's visually clumsy — poor proportion, no beauty", tag: 'AE' },
      { label: "the parts don't add up to a whole journey", tag: 'SY' },
      { label: 'it tells no story', tag: 'NA' },
      { label: 'it believes in nothing', tag: 'CV' },
    ],
  },
  {
    module_code: 'a1',
    seq: 5,
    is_non_design: true,
    prompt: "A friend asks you to help plan a once-in-a-lifetime event. You're most drawn to…",
    options: [
      { label: 'what each guest needs to feel', tag: 'EM' },
      { label: 'the schedule & logistics', tag: 'AN' },
      { label: 'the look & atmosphere of the space', tag: 'AE' },
      { label: 'how every part flows into the next', tag: 'SY' },
      { label: 'the moment it builds toward', tag: 'NA' },
      { label: 'what the day is really about', tag: 'CV' },
    ],
  },
  {
    module_code: 'a1',
    seq: 6,
    is_non_design: false,
    prompt: "You're given an unfamiliar object: “make this better.” You start by…",
    options: [
      { label: 'imagining who it fails', tag: 'EM' },
      { label: "breaking down each part's job", tag: 'AN' },
      { label: 'seeing how it fits the wider system it lives in', tag: 'SY' },
      { label: "rethinking what it's for", tag: 'NA' },
      { label: 'questioning if it should exist', tag: 'CV' },
    ],
  },
  {
    module_code: 'a1',
    seq: 7,
    is_non_design: true,
    prompt: "A community has a problem nobody's solved. You'd begin by…",
    options: [
      { label: 'living alongside them', tag: 'EM' },
      { label: 'studying why past tries failed', tag: 'AN' },
      { label: 'seeing the whole system around it', tag: 'SY' },
      { label: 'finding the story the data misses', tag: 'NA' },
      { label: 'being honest what you can change', tag: 'CV' },
    ],
  },
  {
    module_code: 'a1',
    seq: 8,
    is_non_design: false,
    prompt: "A free weekend to make something just for you. You'd likely…",
    options: [
      { label: 'make something for someone you love', tag: 'EM' },
      { label: 'solve a nagging puzzle', tag: 'AN' },
      { label: 'make something beautiful for its own sake', tag: 'AE' },
      { label: 'write/film/tell something', tag: 'NA' },
      { label: 'make something that says what you believe', tag: 'CV' },
    ],
  },
  {
    module_code: 'a1',
    seq: 9,
    is_non_design: false,
    prompt: "You're composing a space for a photo. Your first instinct is…",
    options: [
      { label: 'read the mood people want', tag: 'EM' },
      { label: 'work out the lighting logic', tag: 'AN' },
      { label: 'chase proportion, colour, beauty', tag: 'AE' },
      { label: 'arrange how every element relates', tag: 'SY' },
      { label: 'build the story the image tells', tag: 'NA' },
      { label: 'decide what feeling it must stand for', tag: 'CV' },
    ],
  },
];
