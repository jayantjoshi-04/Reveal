/**
 * B5 · the 40-artifact wish-sort set (ChannelAB_Content_v2).
 * imp = commercial(-1) ↔ impact(+1) · hum = object(-1) ↔ human(+1)
 * st  = craft | systems | concept · pair = 10 look-alike pairs (P1..P10).
 */
export interface ArtifactSeed {
  seq: number;
  title: string;
  domain: string;
  imp: number;
  hum: number;
  st: 'craft' | 'systems' | 'concept';
  pair: string | null;
}

export const ARTIFACTS: ArtifactSeed[] = [
  { seq: 1, title: 'Luxury water bottle', domain: 'product · branding', imp: -0.8, hum: -0.5, st: 'craft', pair: 'P1' },
  { seq: 2, title: 'Low-cost water filter', domain: 'product · community', imp: 0.9, hum: 0.6, st: 'systems', pair: 'P1' },
  { seq: 3, title: 'Crypto trading onboarding', domain: 'UX · commercial', imp: -0.8, hum: -0.1, st: 'systems', pair: 'P2' },
  { seq: 4, title: 'Govt benefits-access app', domain: 'UX · public service', imp: 0.8, hum: 0.6, st: 'systems', pair: 'P2' },
  { seq: 5, title: 'Perfume launch campaign', domain: 'brand · luxury', imp: -0.9, hum: -0.2, st: 'concept', pair: 'P3' },
  { seq: 6, title: 'Mental-health campaign', domain: 'brand · social', imp: 0.7, hum: 0.8, st: 'concept', pair: 'P3' },
  { seq: 7, title: 'Sneaker hype collab', domain: 'product · hype', imp: -0.7, hum: -0.3, st: 'craft', pair: 'P4' },
  { seq: 8, title: 'Prosthetic limb redesign', domain: 'product · health', imp: 0.9, hum: 0.6, st: 'craft', pair: 'P4' },
  { seq: 9, title: 'Luxury fashion-house ad', domain: 'brand · luxury', imp: -0.9, hum: -0.1, st: 'concept', pair: 'P5' },
  { seq: 10, title: 'Migrant-worker helpline', domain: 'service · social', imp: 0.9, hum: 0.8, st: 'systems', pair: 'P5' },
  { seq: 11, title: 'Smartwatch face pack', domain: 'product · consumer', imp: -0.6, hum: -0.3, st: 'craft', pair: 'P6' },
  { seq: 12, title: 'Sign-language learning app', domain: 'UX · access', imp: 0.8, hum: 0.7, st: 'systems', pair: 'P6' },
  { seq: 13, title: 'Concept-car interior', domain: 'mobility · form', imp: -0.5, hum: -0.4, st: 'craft', pair: 'P7' },
  { seq: 14, title: 'Everyday wheelchair redesign', domain: 'product · access', imp: 0.8, hum: 0.6, st: 'craft', pair: 'P7' },
  { seq: 15, title: 'High-end typeface specimen', domain: 'type · commercial', imp: -0.4, hum: -0.5, st: 'craft', pair: 'P8' },
  { seq: 16, title: 'Dyslexia-friendly typeface', domain: 'type · access', imp: 0.7, hum: 0.5, st: 'craft', pair: 'P8' },
  { seq: 17, title: 'Boutique hotel identity', domain: 'brand · hospitality', imp: -0.6, hum: 0.0, st: 'concept', pair: 'P9' },
  { seq: 18, title: 'Night-shelter wayfinding', domain: 'spatial · social', imp: 0.7, hum: 0.5, st: 'systems', pair: 'P9' },
  { seq: 19, title: 'NFT art drop', domain: 'digital · speculative', imp: -0.8, hum: -0.4, st: 'concept', pair: 'P10' },
  { seq: 20, title: 'Community oral-history archive', domain: 'digital · culture', imp: 0.5, hum: 0.7, st: 'concept', pair: 'P10' },
  { seq: 21, title: 'Museum wayfinding system', domain: 'spatial · culture', imp: 0.2, hum: 0.3, st: 'systems', pair: null },
  { seq: 22, title: 'Music-festival identity', domain: 'brand · events', imp: -0.2, hum: 0.2, st: 'concept', pair: null },
  { seq: 23, title: 'Sculptural lounge chair', domain: 'furniture · form', imp: -0.4, hum: -0.6, st: 'craft', pair: null },
  { seq: 24, title: 'Community garden system', domain: 'service · local', imp: 0.7, hum: 0.6, st: 'systems', pair: null },
  { seq: 25, title: 'Disaster-relief logistics', domain: 'service · crisis', imp: 0.9, hum: 0.3, st: 'systems', pair: null },
  { seq: 26, title: 'School-meal program kit', domain: 'service · children', imp: 0.9, hum: 0.7, st: 'systems', pair: null },
  { seq: 27, title: 'Refugee-skills marketplace', domain: 'service · social', imp: 0.9, hum: 0.6, st: 'systems', pair: null },
  { seq: 28, title: 'Car configurator UX', domain: 'UX · automotive', imp: -0.5, hum: -0.4, st: 'systems', pair: null },
  { seq: 29, title: 'Premium banking dashboard', domain: 'UX · finance', imp: -0.6, hum: -0.2, st: 'systems', pair: null },
  { seq: 30, title: 'Streetwear lookbook', domain: 'brand · fashion', imp: -0.7, hum: -0.1, st: 'concept', pair: null },
  { seq: 31, title: 'Artisan ceramics line', domain: 'product · craft', imp: -0.3, hum: -0.3, st: 'craft', pair: null },
  { seq: 32, title: 'Public-park redesign', domain: 'spatial · civic', imp: 0.7, hum: 0.6, st: 'systems', pair: null },
  { seq: 33, title: 'Voting-machine interface', domain: 'civic · systems', imp: 0.8, hum: 0.4, st: 'systems', pair: null },
  { seq: 34, title: 'Period-product access kit', domain: 'product · health', imp: 0.8, hum: 0.7, st: 'craft', pair: null },
  { seq: 35, title: 'Smart thermostat', domain: 'product · consumer', imp: -0.4, hum: -0.2, st: 'craft', pair: null },
  { seq: 36, title: 'Elder-care companion device', domain: 'product · care', imp: 0.7, hum: 0.8, st: 'craft', pair: null },
  { seq: 37, title: 'Festival main-stage design', domain: 'spatial · events', imp: -0.3, hum: 0.0, st: 'craft', pair: null },
  { seq: 38, title: 'Local-language literacy game', domain: 'UX · education', imp: 0.8, hum: 0.7, st: 'systems', pair: null },
  { seq: 39, title: 'Luxury-watch film', domain: 'brand · luxury', imp: -0.9, hum: -0.3, st: 'concept', pair: null },
  { seq: 40, title: 'Farmer market-price SMS tool', domain: 'service · rural', imp: 0.9, hum: 0.4, st: 'systems', pair: null },
];
