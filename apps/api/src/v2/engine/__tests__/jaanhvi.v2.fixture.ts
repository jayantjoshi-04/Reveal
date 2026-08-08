/**
 * Jaanhvi — the reference student, as a v2 raw-capture fixture.
 *
 * Her documented reads (Engine Spec + Molecule Library worked run) expressed as
 * direct construct signals across enough distinct activities to reach the
 * evidence thresholds. Conviction leads; Empathy is the say↔do surprise
 * (say 13 / do 72 → blended ≈ 51); Research is trained; Deep, Careful, and a
 * feedback-rich room define how she works.
 */
import type { RawCapture, Signal } from '../types.js';

const sig = (constructId: string, channel: 'say' | 'do', value: number, extra: Partial<Signal> = {}): Signal => ({
  constructId,
  channel,
  value,
  ...extra,
});

/** One response per (activity, channel) carrying a bundle of signals. */
function resp(activityId: string, channel: 'say' | 'do', signals: Signal[]): RawCapture['responses'][number] {
  return { activityId, channel, rawPayload: { signals } };
}

export const jaanhviCapture: RawCapture = {
  enrolledField: 'Industrial Design',
  chosenDirection: undefined,
  responses: [
    // ── Empathy: DO high across 3 situations, SAY low (résumé) ──
    resp('A3', 'do', [sig('Empathy', 'do', 72)]),
    resp('O2', 'do', [sig('Empathy', 'do', 71)]),
    resp('B2', 'do', [sig('Empathy', 'do', 73)]),
    resp('U1', 'say', [sig('Empathy', 'say', 13)]),
    // ── Conviction: say ≈ do ≈ 78 across situations ──
    resp('A1', 'do', [sig('Conviction', 'do', 78), sig('Analytical', 'do', 64), sig('Craft↔Velocity', 'do', -60, { edge: 'Craft' })]),
    resp('A7', 'do', [sig('Conviction', 'do', 79), sig('Analytical', 'do', 66)]),
    resp('B5', 'do', [sig('Conviction', 'do', 77)]),
    resp('U1', 'say', [sig('Conviction', 'say', 78), sig('Research', 'say', 62)]),
    // ── Analytical say + a 3rd situation ──
    resp('A4', 'do', [sig('Analytical', 'do', 65), sig('Systems', 'do', 52)]),
    resp('F2', 'say', [sig('Analytical', 'say', 60)]),
    // ── Systems / Aesthetic medium ──
    resp('B4', 'do', [sig('Systems', 'do', 50)]),
    resp('A2', 'do', [sig('Aesthetic', 'do', 52)]),
    resp('C1', 'do', [sig('Aesthetic', 'do', 50)]),
    // ── Research (capability) trained: do + say ──
    resp('B1', 'do', [sig('Research', 'do', 66), sig('Digital/Intx', 'do', 45)]),
    resp('U3', 'do', [sig('Research', 'do', 64)]),
    // ── Dispositions: Deep, Careful, With-others (medium) ──
    resp('F1', 'do', [
      sig('Deep↔Broad', 'do', -62, { position: -62, edge: 'Deep' }),
      sig('Bold↔Careful', 'do', 55, { position: 55, edge: 'Careful' }),
    ]),
    resp('F2', 'say', [
      sig('Deep↔Broad', 'say', -58, { position: -58, edge: 'Deep' }),
      sig('Bold↔Careful', 'say', 48, { position: 48, edge: 'Careful' }),
    ]),
    resp('B3', 'do', [sig('With↔Alone', 'do', -35, { position: -35, edge: 'With' })]),
    // ── Environment: feedback-rich, safe room (do room-tags + say) ──
    resp('B3', 'do', [
      sig('Insul↔Feedback', 'do', 70, { position: 70, edge: 'Feedback' }),
      sig('Blame↔Safe', 'do', 52, { position: 52, edge: 'Safe' }),
      sig('Silo↔CrossD', 'do', 40, { position: 40, edge: 'CrossD' }),
    ]),
    resp('F4', 'say', [
      sig('Insul↔Feedback', 'say', 66, { position: 66, edge: 'Feedback' }),
      sig('Blame↔Safe', 'say', 48, { position: 48, edge: 'Safe' }),
    ]),
    // ── Values: Craft lean (2nd source) + Impact ──
    resp('F1', 'do', [sig('Craft↔Velocity', 'do', -58, { edge: 'Craft' }), sig('Impact↔Income', 'do', -40, { edge: 'Impact' })]),
    // ── Intent: Understanding, over-determined (approach), + Security avoidance trace ──
    resp('F1', 'do', [
      sig('Intent', 'do', 1, { driver: 'Understanding', valence: 'approach' }),
      sig('Intent', 'do', 1, { driver: 'Understanding', valence: 'approach' }),
      sig('Intent', 'do', 1, { driver: 'Mastery', valence: 'approach' }),
    ]),
  ],
  portfolio: [{ source: 'portfolio.pdf', evidenceMap: { Research: 0.6, 'Digital/Intx': 0.4, Making: 0.3 } }],
  experience: [{ descriptor: 'Field studies', reps: 3, contextVariety: 2, realVsSimulated: 'real' }],
  factual: { tools: true, deadlines: true, collaboration: true },
};
