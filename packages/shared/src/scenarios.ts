/**
 * REVEAL · B9 · The scenario suite (S1–S8)
 * ---------------------------------------------------------------------------
 * One situation, two questions: Q1 reads what you DO (disposition), Q2 reads
 * which version brings out your best (nutrient dosage). Content + tag mappings
 * live here so the engine scores from the choices deterministically (it never
 * trusts a client-computed score). Source: ChannelAB_Content_v4 · Part Three.
 */
import type { Nutrient, NutrientLevel } from './enums.js';

export interface Q1Option {
  text: string;
  /** Disposition pole tags (pole label → resolved by POLE_TO_DIM) with weight (● 1.0 / ○ 0.5). */
  tags: { pole: string; w: number }[];
}
export interface Q2Variant {
  text: string;
  bundle: { nutrient: Nutrient; level: NutrientLevel }[];
}
export interface Scenario {
  id: string;
  icon: string;
  title: string;
  context: string;
  q1_prompt: string;
  q1: Q1Option[];
  q2_prompt: string;
  q2: Q2Variant[];
}

// compact builders
const t = (pole: string, w = 1): { pole: string; w: number } => ({ pole, w });
const n = (nutrient: Nutrient, level: NutrientLevel): { nutrient: Nutrient; level: NutrientLevel } => ({ nutrient, level });

export const SCENARIOS: Scenario[] = [
  {
    id: 's1', icon: '🚲', title: 'The broken bicycle',
    context: 'Your neighbour’s bike has broken. They’ve asked if you can help. You’ve got an hour before you need to be somewhere.',
    q1_prompt: 'What would you most naturally do first?',
    q1: [
      { text: 'Take it apart to see how it works', tags: [t('Experiment'), t('Act')] },
      { text: 'Find the manual and read it through', tags: [t('Study'), t('Reflect', 0.5)] },
      { text: 'Ask them what happened, and when', tags: [t('Bring-in'), t('Reflect')] },
      { text: 'Sketch how the thing could be better', tags: [t('Reinvent'), t('Act', 0.5)] },
      { text: 'Call someone who knows bikes', tags: [t('Bring-in'), t('Study', 0.5)] },
    ],
    q2_prompt: 'Same hour, four versions. Which gets your best work out of you?',
    q2: [
      { text: 'The manual, the right tools, a clear hour', bundle: [n('structure', 'high'), n('resources', 'high')] },
      { text: 'No manual, no tools — but a mechanic on the phone', bundle: [n('resources', 'moderate'), n('structure', 'low')] },
      { text: 'Just you and the bike. Nothing else.', bundle: [n('structure', 'low'), n('resources', 'low'), n('challenge', 'high')] },
      { text: 'You and a friend, full toolbox, no deadline', bundle: [n('safety', 'high'), n('structure', 'low'), n('resources', 'high')] },
    ],
  },
  {
    id: 's2', icon: '🏛', title: 'The museum',
    context: 'A free afternoon and a pass to all of it — science hall, art gallery, history exhibit, maker lab, nature trail. Three hours.',
    q1_prompt: 'What do you actually end up doing?',
    q1: [
      { text: 'Pick one wing and stay in it', tags: [t('Go-deep')] },
      { text: 'Walk the whole place once, then go back to what pulled you', tags: [t('Range-wide'), t('Reflect', 0.5)] },
      { text: 'Keep moving. Don’t double back.', tags: [t('Range-wide'), t('Act', 0.5)] },
      { text: 'Find the one thing you’d read about and stay with it', tags: [t('Go-deep'), t('Study')] },
      { text: 'Follow whoever looks like they know what they’re looking at', tags: [t('Bring-in'), t('Study', 0.5)] },
    ],
    q2_prompt: 'Which version leaves you most fired up to go make something?',
    q2: [
      { text: 'A guided tour with an expert, fixed route', bundle: [n('structure', 'high'), n('resources', 'high')] },
      { text: 'A map and nothing else. Wander.', bundle: [n('structure', 'low'), n('novelty', 'high')] },
      { text: 'One wing, hands-on — you can take things apart', bundle: [n('challenge', 'high'), n('resources', 'high')] },
      { text: 'Everything in there is new to you. Nothing familiar.', bundle: [n('novelty', 'high'), n('challenge', 'moderate')] },
    ],
  },
  {
    id: 's3', icon: '📐', title: '“This isn’t good enough.”',
    context: 'You’ve put three weeks into this. Your tutor looks at it and says: “This isn’t good enough.” Nothing else.',
    q1_prompt: 'What do you most naturally do first?',
    q1: [
      { text: 'Ask them to be specific', tags: [t('Bring-in'), t('Reflect', 0.5)] },
      { text: 'Go back and start again', tags: [t('Adapt'), t('Act')] },
      { text: 'Defend the thinking behind it', tags: [t('Persist'), t('Act', 0.5)] },
      { text: 'Sit with it for a day before touching it', tags: [t('Reflect'), t('Persist', 0.5)] },
      { text: 'Show it to someone else for a second read', tags: [t('Bring-in'), t('Reflect', 0.5)] },
    ],
    q2_prompt: 'Which version of that tutor gets your best work out of you?',
    q2: [
      { text: '“This isn’t good enough.” Nothing more. You work it out.', bundle: [n('feedback', 'low'), n('challenge', 'high'), n('safety', 'low')] },
      { text: 'A detailed critique — everything that’s wrong, specifically', bundle: [n('feedback', 'high'), n('structure', 'high')] },
      { text: '“Not there yet. What do you think is missing?”', bundle: [n('feedback', 'moderate'), n('safety', 'high'), n('structure', 'low')] },
      { text: 'They pull up a chair and work on it alongside you', bundle: [n('feedback', 'high'), n('safety', 'high'), n('resources', 'high')] },
    ],
  },
  {
    id: 's4', icon: '👥', title: 'The stalled team',
    context: 'You’ve been put in a group of five to organise something for the weekend. Nobody knows each other. Five minutes in, nobody’s said anything real.',
    q1_prompt: 'What naturally happens?',
    q1: [
      { text: 'You start putting structure on it — who’s doing what', tags: [t('Act'), t('Solo', 0.5)] },
      { text: 'You wait and see who else moves', tags: [t('Reflect')] },
      { text: 'You ask everyone what they actually want out of this', tags: [t('Bring-in'), t('Reflect', 0.5)] },
      { text: 'You throw out a first idea just to get things moving', tags: [t('Act'), t('Experiment')] },
      { text: 'You quietly work out the real goal, then speak', tags: [t('Reflect'), t('Study', 0.5)] },
    ],
    q2_prompt: 'Which version of this group gets your best out of you?',
    q2: [
      { text: 'Someone’s clearly in charge, roles assigned', bundle: [n('structure', 'high'), n('safety', 'moderate')] },
      { text: 'No leader. Everyone figures it out.', bundle: [n('structure', 'low'), n('challenge', 'high')] },
      { text: 'People you already know and trust', bundle: [n('safety', 'high'), n('novelty', 'low')] },
      { text: 'Strangers, and all of them better at this than you', bundle: [n('challenge', 'high'), n('safety', 'low'), n('novelty', 'high')] },
    ],
  },
  {
    id: 's5', icon: '⏱', title: 'The hour before it’s due',
    context: 'Presentation in an hour. The thing keeps failing.',
    q1_prompt: 'What’s your response?',
    q1: [
      { text: 'Keep working the problem right up to the wire', tags: [t('Persist'), t('Act', 0.5)] },
      { text: 'Strip it back to the part that does work', tags: [t('Adapt'), t('Discipline', 0.5)] },
      { text: 'Scrap it. Show the thinking instead.', tags: [t('Adapt'), t('Reinvent')] },
      { text: 'Grab someone — another pair of hands', tags: [t('Bring-in')] },
      { text: 'Present it failing, and talk about why', tags: [t('Reinvent'), t('Reflect', 0.5)] },
    ],
    q2_prompt: 'Which version gets your best work out of you?',
    q2: [
      { text: 'Long runway, no deadline, get it right', bundle: [n('challenge', 'low'), n('structure', 'low')] },
      { text: 'Tight deadline, clear spec', bundle: [n('challenge', 'moderate'), n('structure', 'high')] },
      { text: 'Tight deadline, you decide what “done” means', bundle: [n('challenge', 'high'), n('structure', 'low')] },
      { text: 'Deadline, plus someone senior on call', bundle: [n('resources', 'high'), n('safety', 'high'), n('challenge', 'moderate')] },
    ],
  },
  {
    id: 's6', icon: '🔨', title: 'It failed in front of everyone',
    context: 'It failed during the jury. Everyone saw.',
    q1_prompt: 'What happens next?',
    q1: [
      { text: 'Start redesigning it that night', tags: [t('Act'), t('Persist')] },
      { text: 'Work out exactly why it failed before touching it', tags: [t('Study'), t('Reflect')] },
      { text: 'Step away from it for a day', tags: [t('Reflect')] },
      { text: 'Go find the users and ask them', tags: [t('Bring-in'), t('Study', 0.5)] },
      { text: 'Build a different version immediately', tags: [t('Act'), t('Experiment'), t('Reinvent', 0.5)] },
    ],
    q2_prompt: 'Which version of that jury would actually help you get better?',
    q2: [
      { text: 'They tell you exactly what went wrong, in detail', bundle: [n('feedback', 'high'), n('structure', 'high')] },
      { text: 'They ask you what you think happened', bundle: [n('feedback', 'moderate'), n('safety', 'high')] },
      { text: 'Nobody says anything. You work it out.', bundle: [n('feedback', 'low'), n('safety', 'low'), n('challenge', 'high')] },
      { text: 'It’s understood that failing here is normal', bundle: [n('safety', 'high'), n('feedback', 'moderate')] },
    ],
  },
  {
    id: 's7', icon: '🤖', title: 'The AI hands you the answer',
    context: 'You describe the brief to an AI. Thirty seconds later it hands you a finished concept. It’s… fine.',
    q1_prompt: 'What do you do?',
    q1: [
      { text: 'Take it apart to see what it’s assuming', tags: [t('Study'), t('Experiment')] },
      { text: 'Use it as a base and push it somewhere else', tags: [t('Adapt'), t('Act', 0.5)] },
      { text: 'Throw it out. Start your own.', tags: [t('Reinvent'), t('Persist', 0.5)] },
      { text: 'Test it with actual people before judging it', tags: [t('Bring-in'), t('Study', 0.5)] },
      { text: 'Generate ten more and pick', tags: [t('Experiment'), t('Range-wide', 0.5)] },
    ],
    q2_prompt: 'Which kind of brief gets your best work out of you?',
    q2: [
      { text: 'One nobody’s solved before', bundle: [n('novelty', 'high'), n('challenge', 'high')] },
      { text: 'A well-trodden one you can just do better', bundle: [n('novelty', 'low'), n('challenge', 'moderate')] },
      { text: 'One where the tools are new to you too', bundle: [n('novelty', 'high'), n('resources', 'low'), n('challenge', 'high')] },
      { text: 'One with strong references and precedent', bundle: [n('resources', 'high'), n('structure', 'high'), n('novelty', 'low')] },
    ],
  },
  {
    id: 's8', icon: '🧭', title: 'Where would you be happiest?',
    context: 'One week inside any setting you like — hospital, workshop, research lab, fieldwork, corporate, startup, studio — doing real work.',
    q1_prompt: 'What do you do with the week?',
    q1: [
      { text: 'Stay in one. Learn how it really works.', tags: [t('Go-deep'), t('Study')] },
      { text: 'Try to see three or four of them', tags: [t('Range-wide')] },
      { text: 'Pick one and try to make something in it', tags: [t('Act'), t('Experiment')] },
      { text: 'Pick one and shadow whoever runs it', tags: [t('Bring-in'), t('Study')] },
      { text: 'Pick the one you know least about', tags: [t('Range-wide'), t('Experiment', 0.5)] },
    ],
    q2_prompt: 'Where do you imagine yourself doing work you’d be proud of?',
    q2: [
      { text: 'A hospital or clinic', bundle: [n('structure', 'high'), n('challenge', 'high'), n('safety', 'low')] },
      { text: 'A workshop / fab lab', bundle: [n('resources', 'high'), n('structure', 'low')] },
      { text: 'A startup / coworking room', bundle: [n('structure', 'low'), n('challenge', 'high'), n('feedback', 'high')] },
      { text: 'A research lab', bundle: [n('structure', 'high'), n('novelty', 'high'), n('feedback', 'low')] },
    ],
  },
];
