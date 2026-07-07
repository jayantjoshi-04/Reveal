/**
 * End-to-end integration test. Boots the real Fastify app against a real
 * Postgres and walks the whole flow using the REAL /content endpoints — so
 * serialization bugs (e.g. NUMERIC-as-string breaking B5) can't slip past.
 *
 * Skipped unless E2E_DATABASE_URL points at a migrated + seeded test database:
 *   E2E_DATABASE_URL=postgres://… pnpm --filter @reveal/api test
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';

const E2E = process.env.E2E_DATABASE_URL;
const suite = E2E ? describe : describe.skip;

suite('e2e · full capture → engine → approve → report (real DB)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.DATABASE_URL = E2E!;
    process.env.JWT_SECRET ??= 'e2e-secret';
    process.env.SYNTHESIS_MODE = 'manual';
    process.env.STAFF_PASSCODE ??= 'reveal-staff';
    const { buildApp } = await import('../app.js');
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app?.close();
    const { closeDb } = await import('../config/db.js');
    await closeDb();
  });

  async function api(method: 'GET' | 'POST', url: string, token?: string, payload?: unknown) {
    const res = await app.inject({
      method,
      url: `/api${url}`,
      headers: token ? { authorization: `Bearer ${token}` } : {},
      payload: payload as never,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { status: res.statusCode, body: res.json() as any };
  }

  it('walks the whole flow and releases a report', async () => {
    const VALUES = ['empathy','impact','justice','storytelling','teaching','craft','autonomy','recognition','money_security','learning_growth','beauty','solving_hard_problems'];

    // sign in + start
    const auth = await api('POST', '/auth/student', undefined, { name: 'E2E', email: `e2e+${Date.now()}@test.dev`, cohort: '7' });
    expect(auth.status).toBe(200);
    const token = auth.body.token as string;
    const start = await api('POST', '/instances', token);
    const id = start.body.instance_id as string;

    // real content — the artifacts must arrive as NUMBERS, not "0.9"
    const arts = (await api('GET', '/content/artifacts', token)).body as { seq: number; imp: number; hum: number }[];
    expect(arts.every((a) => typeof a.imp === 'number' && typeof a.hum === 'number')).toBe(true);

    const pick = (f: (a: { imp: number }) => boolean) =>
      arts.filter((a) => f(a)).slice(0, 8).map((a, i) => ({ id: i, imp: Number(a.imp), hum: Number(a.hum), pick_rank: i + 1, ms: 1 }));
    const cen = (p: { imp: number; hum: number }[]) => (p.length ? { imp: p.reduce((s, x) => s + x.imp, 0) / p.length, hum: p.reduce((s, x) => s + x.hum, 0) / p.length } : { imp: 0, hum: 0 });
    const wish = pick((a) => a.imp > 0), actual = pick((a) => a.imp > 0), pays = pick((a) => a.imp < 0);

    const P: Record<string, unknown> = {
      consent: { data_use: true, retention_ack: true, granted_at: new Date().toISOString() },
      portfolio_facts: { projects: [
        { project_id: 'p1', title: 'ReVIVE', domain: 'health', initiated: 'self', group: 'group', roles: ['researcher','sensemaker'], demonstrated_capabilities: ['design_research'], commercial_impact_self_tag: 0.9 },
        { project_id: 'p2', title: 'Ibex', domain: 'branding', initiated: 'assigned', group: 'group', roles: ['builder_maker'], demonstrated_capabilities: ['visual_comm'], commercial_impact_self_tag: -0.6 } ] },
      // real items → server recomputes A-scores (never trusts a client score)
      a1: { items: [
        ...Array.from({ length: 6 }, (_, i) => ({ prompt_id: `e${i}`, chosen_capacity: 'empathy', ms: 1 })),
        { prompt_id: 'an1', chosen_capacity: 'analytical', ms: 1 },
        { prompt_id: 'sy1', chosen_capacity: 'systems_sensing', ms: 1 },
      ] },
      b3: { ordered_moves: ['talk to the people affected', 'tighten the real problem', 'look at the data'] },
      b4: { stimuli: [
        { stimulus_id: 's1', marked: [{ category: 'PEOPLE', order: 1 }, { category: 'TEXT', order: 2 }, { category: 'SYSTEM', order: 3 }] },
        { stimulus_id: 's2', marked: [{ category: 'TEXT', order: 1 }, { category: 'PEOPLE', order: 2 }, { category: 'SYSTEM', order: 3 }] } ] },
      b1: { revealed_rank: [
        { value: 'impact', tier: 'core', fund_rank: 1, fund_ms: 1 }, { value: 'empathy', tier: 'core', fund_rank: 2, fund_ms: 1 },
        { value: 'learning_growth', tier: 'core', fund_rank: 3, fund_ms: 1 }, { value: 'justice', tier: 'core', fund_rank: 4, fund_ms: 1 },
        { value: 'money_security', tier: 'cut', fund_rank: 5, fund_ms: 1 }, { value: 'recognition', tier: 'cut', fund_rank: 6, fund_ms: 1 } ],
        cut_order: [{ value: 'recognition', cut_rank: 1, cut_ms: 1 }, { value: 'money_security', cut_rank: 2, cut_ms: 1 }], total_ms: 100 },
      a3: { ranked: VALUES, never_compromise: { value: 'empathy', why: 'x' }, let_go: ['money_security', 'recognition'] },
      b2: { choices: [{ scenario_id: '2', chosen_pole: 'impact', disposition: 'impact', ms: 1 }, { scenario_id: '5', chosen_pole: 'empathy', disposition: 'empathy', ms: 1 }] },
      a4: { thrive: ['clear_purpose', 'see_who_it_helps', 'in_the_field'], wither: ['purely_commercial', 'only_money'] },
      b8: { disruptions: [{ response: 'reframe', recovery_ms: 1, generated_new: true }] },
      b5: { wish, actual, pays_best: pays, centroid_wish: cen(wish), centroid_actual: cen(actual), centroid_lucrative: cen(pays) },
      a7: { desired_levels: { field_research: 0.9, venture: 0.85, facilitation: 0.8, systems_service: 0.7, design_research: 0.6, framing: 0.5, ideation: 0.4, prototyping: 0.3, craft_execution: 0.3, visual_comm: 0.3, material_media: 0.2, functional_usability: 0.3 }, desired_skills_ranked: ['field_research', 'venture', 'facilitation', 'systems_service', 'design_research'], perceived_market_rank: [{ field: 'UI/UX', rank: 1 }], direction_market_stance: 'opposed' },
      b6: { images: [{ ref: 'i1', why: 'a' }, { ref: 'i2', why: 'b' }, { ref: 'i3', why: 'c' }], detected_thread: ['human-present', 'story-laden', 'historical'], confirmed: null },
      a6: { topics: ['community', 'children'], admired: [] },
      portfolio_interpretive: { reflection: 'mostly researching' },
      resume: { resume: { uploaded: true, file_ref: 'r.pdf', parsed_frame: 'commercial' } },
    };

    // drive via the server-authoritative cursor
    let state = start.body;
    for (let guard = 0; state.status !== 'capture_complete' && guard < 40; guard++) {
      if (state.cursor) {
        const r = await api('POST', `/instances/${id}/modules/${state.cursor}`, token, { payload: P[state.cursor], response_ms: 1 });
        expect(r.status, `submit ${state.cursor}`).toBe(200);
      } else if (state.active_session) {
        const r = await api('POST', `/instances/${id}/sessions/${state.active_session}/seal`, token);
        expect(r.status, `seal ${state.active_session}`).toBe(200);
      }
      state = (await api('GET', `/instances/${id}/state`, token)).body;
    }
    expect(state.status).toBe('capture_complete');

    // facilitator approves → single synthesis, cached once
    const fac = await api('POST', '/auth/staff', undefined, { email: 'facilitator@reveal.test', passcode: process.env.STAFF_PASSCODE });
    expect(fac.status).toBe(200);
    const ftok = fac.body.token as string;
    const approve = await api('POST', `/facilitator/reviews/${id}/approve`, ftok);
    expect(approve.status).toBe(200);
    expect(approve.body.generated).toBe(true);
    // idempotent
    expect((await api('POST', `/facilitator/reviews/${id}/approve`, ftok)).body.generated).toBe(false);

    // student reads the released report
    const report = await api('GET', `/report/${id}`, token);
    expect(report.status).toBe(200);
    expect(report.body.slots.differentiation_statement.length).toBeGreaterThan(0);
    expect(report.body.findings.capacities[0].name).toBe('empathy'); // recomputed server-side
  }, 30_000);

  it('rejects staff sign-in with a wrong passcode', async () => {
    const bad = await api('POST', '/auth/staff', undefined, { email: 'admin@reveal.test', passcode: 'wrong' });
    expect(bad.status).toBe(401);
  });
});
