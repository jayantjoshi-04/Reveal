/**
 * B4 · attention-capture scenes. Each scene shows one busy image; the student
 * taps the things they notice first. Every item secretly belongs to one of the
 * five attention layers (PEOPLE / FORM / SYSTEM / DETAIL / TEXT) — the layer a
 * tap lands in is what feeds capacity scoring, and each layer's `communicates`
 * line is what surfaces back in the report.
 *
 * Categories are intentionally hidden from the student: the point is to read
 * where their eye goes unprompted, so items are shuffled before display.
 */
import type { B4Category } from './enums.js';

export interface B4SceneItem {
  /** What the student sees on the chip. */
  label: string;
  /** The attention layer it belongs to (hidden from the student). */
  category: B4Category;
}

export interface B4Scene {
  stimulus_id: string;
  title: string;
  /** Public path to the scene image (served from web /public). */
  image: string;
  /** Selectable things drawn from the scene, one per observable detail. */
  items: B4SceneItem[];
  /** Per-layer "what noticing this communicates", used in the report. */
  communicates: Record<B4Category, string>;
}

export const B4_SCENES: B4Scene[] = [
  {
    stimulus_id: 's1_market',
    title: 'A street market',
    image: '/scenes/market.jpg',
    items: [
      { label: 'A vendor handing produce to a customer', category: 'PEOPLE' },
      { label: 'Shoppers browsing jewellery', category: 'PEOPLE' },
      { label: 'A crowd moving down the aisle', category: 'PEOPLE' },
      { label: 'Warm hanging lights', category: 'FORM' },
      { label: 'Colourful stacked vegetables', category: 'FORM' },
      { label: 'Deep perspective down the lane', category: 'FORM' },
      { label: 'Stalls lined on both sides', category: 'SYSTEM' },
      { label: 'The central pedestrian aisle', category: 'SYSTEM' },
      { label: 'Produce displayed by category', category: 'SYSTEM' },
      { label: 'A hanging birdcage', category: 'DETAIL' },
      { label: 'A handwritten sale banner', category: 'DETAIL' },
      { label: 'Woven baskets', category: 'DETAIL' },
      { label: '“Shri Lakshmi Fresh Vegetables”', category: 'TEXT' },
      { label: '“Sale 100 Fixed”', category: 'TEXT' },
      { label: 'Price boards — “Tomato 40 · Potato 30”', category: 'TEXT' },
    ],
    communicates: {
      PEOPLE: 'Buying and selling, negotiation, social interaction and trust — everyday community life.',
      FORM: 'A vibrant, informal, sensory-rich marketplace with strong visual rhythm and depth.',
      SYSTEM: 'Efficient retail flow and marketplace organisation — an informal commerce system.',
      DETAIL: 'Authenticity, local identity and handcrafted culture — the texture of everyday market life.',
      TEXT: 'Store identity, pricing and navigation — multilingual commercial information.',
    },
  },
  {
    stimulus_id: 's2_workshop',
    title: 'A design workshop',
    image: '/scenes/workshop.jpg',
    items: [
      { label: 'A designer shaping foam', category: 'PEOPLE' },
      { label: 'Someone machining a part', category: 'PEOPLE' },
      { label: 'A prototype frame being assembled', category: 'PEOPLE' },
      { label: 'High ceilings and tall windows', category: 'FORM' },
      { label: 'Warm daylight on the benches', category: 'FORM' },
      { label: 'The visible prototype frame', category: 'FORM' },
      { label: 'Separate task workstations', category: 'SYSTEM' },
      { label: 'A wall of tools', category: 'SYSTEM' },
      { label: '“Design → Build → Test → Improve”', category: 'SYSTEM' },
      { label: 'Foam blocks and offcuts', category: 'DETAIL' },
      { label: 'Scattered sketches', category: 'DETAIL' },
      { label: 'A “Rev 3” revision note', category: 'DETAIL' },
      { label: '“Measure Twice, Cut Once”', category: 'TEXT' },
      { label: '“Project: Rural Mobility”', category: 'TEXT' },
      { label: '“Remember Why You Started”', category: 'TEXT' },
    ],
    communicates: {
      PEOPLE: 'Hands-on making, craftsmanship, experimentation and focus — collaboration through parallel work.',
      FORM: 'A creative industrial environment — practical over polished, an authentic maker culture built for fabrication.',
      SYSTEM: 'An iterative design process and efficient workflow — manufacturing logic, from idea to prototype.',
      DETAIL: 'Evidence of ongoing work, iteration and problem-solving — a lived-in workspace, authenticity over perfection.',
      TEXT: 'A design philosophy and workflow guidance — documentation culture and shared workshop values.',
    },
  },
  {
    stimulus_id: 's3_transit',
    title: 'A transit concourse',
    image: '/scenes/transit.jpg',
    items: [
      { label: 'Travellers walking with luggage', category: 'PEOPLE' },
      { label: 'People waiting in queues', category: 'PEOPLE' },
      { label: 'A passenger checking their phone', category: 'PEOPLE' },
      { label: 'A mother and child reading the map', category: 'PEOPLE' },
      { label: 'A steel-and-glass roof', category: 'FORM' },
      { label: 'The expansive open concourse', category: 'FORM' },
      { label: 'Daylight flooding the space', category: 'FORM' },
      { label: 'Queue barriers and check-in lines', category: 'SYSTEM' },
      { label: 'Departure boards', category: 'SYSTEM' },
      { label: 'Directional signage', category: 'SYSTEM' },
      { label: 'A dropped boarding pass', category: 'DETAIL' },
      { label: 'An unattended duffel bag', category: 'DETAIL' },
      { label: 'A rolling suitcase', category: 'DETAIL' },
      { label: '“Departures” · “Check-in” · “Gates”', category: 'TEXT' },
      { label: 'The digital departure board', category: 'TEXT' },
    ],
    communicates: {
      PEOPLE: 'Travel behaviour, urgency, waiting and navigation — diverse passenger journeys.',
      FORM: 'Spaciousness, efficiency and openness — modern, civic-scale, movement-oriented infrastructure.',
      SYSTEM: 'Passenger flow, wayfinding and crowd management — organised movement through space.',
      DETAIL: 'Human stories and temporary pauses — individual journeys within a large system.',
      TEXT: 'Navigation and operational information — passenger guidance and multilingual accessibility.',
    },
  },
  {
    stimulus_id: 's4_hall',
    title: 'A community hall, mid-event',
    image: '/scenes/hall.jpg',
    items: [
      { label: 'Registration at the desk', category: 'PEOPLE' },
      { label: 'People in discussion circles', category: 'PEOPLE' },
      { label: 'A facilitator talking to a group', category: 'PEOPLE' },
      { label: 'A child drawing', category: 'PEOPLE' },
      { label: 'A high-ceiling hall with a stage', category: 'FORM' },
      { label: 'Warm sunlight and string lights', category: 'FORM' },
      { label: 'Plastic chairs and fabric banners', category: 'FORM' },
      { label: 'The registration area', category: 'SYSTEM' },
      { label: 'A circular seating arrangement', category: 'SYSTEM' },
      { label: 'An agenda board', category: 'SYSTEM' },
      { label: 'A tea kettle and paper cups', category: 'DETAIL' },
      { label: 'A chalkboard tea sign', category: 'DETAIL' },
      { label: 'Participants holding worksheets', category: 'DETAIL' },
      { label: '“Together We Grow”', category: 'TEXT' },
      { label: '“Small Actions, Big Change”', category: 'TEXT' },
      { label: '“Chai & Chat”', category: 'TEXT' },
    ],
    communicates: {
      PEOPLE: 'Community participation, collaboration, learning and inclusivity — active engagement over passive attendance.',
      FORM: 'A warm, welcoming, informal, community-driven environment that feels lived-in and approachable.',
      SYSTEM: 'A clear event structure and logical movement — collaborative workflow, organised yet flexible participation.',
      DETAIL: 'Human warmth and authenticity — everyday community culture and lived experience.',
      TEXT: 'Event identity, purpose and schedule — community values and participant identification.',
    },
  },
  {
    stimulus_id: 's5_product',
    title: 'A personal desk',
    image: '/scenes/product.jpg',
    items: [
      { label: 'A half-finished cup of tea', category: 'PEOPLE' },
      { label: 'An open pencil pouch', category: 'PEOPLE' },
      { label: 'Jewellery taken off', category: 'PEOPLE' },
      { label: 'A lit candle', category: 'PEOPLE' },
      { label: 'Warm window light', category: 'FORM' },
      { label: 'A wooden table', category: 'FORM' },
      { label: 'Objects layered at different heights', category: 'FORM' },
      { label: 'Self-care items grouped together', category: 'SYSTEM' },
      { label: 'A reading stack of books', category: 'SYSTEM' },
      { label: 'The tea setup kept together', category: 'SYSTEM' },
      { label: 'A dinosaur toy', category: 'DETAIL' },
      { label: 'A folded denim jacket', category: 'DETAIL' },
      { label: 'Scattered polaroids', category: 'DETAIL' },
      { label: 'A sticky note — “you got this”', category: 'TEXT' },
      { label: 'A handwritten “Note to Self”', category: 'TEXT' },
      { label: 'Book titles on the stack', category: 'TEXT' },
    ],
    communicates: {
      PEOPLE: 'Human presence without a person in frame — routines, habits and personality made visible through traces.',
      FORM: 'An emotional tone of warmth, comfort and creativity — materiality that feels lived-in instead of staged.',
      SYSTEM: 'Organisation logic — the mental categories and rituals that reveal how someone uses a space, not just what they own.',
      DETAIL: 'Small anomalies that make the scene memorable — conversation starters and cues about personality.',
      TEXT: 'Explicit information that visuals alone can’t give — names of products, values, goals and routines.',
    },
  },
];

/** Look up a scene by its stimulus id. */
export function b4Scene(stimulusId: string): B4Scene | undefined {
  return B4_SCENES.find((s) => s.stimulus_id === stimulusId);
}
