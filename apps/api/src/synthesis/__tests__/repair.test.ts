import { describe, it, expect } from 'vitest';
import { run } from '../../engine/index.js';
import { JAANHVI } from '../../engine/__tests__/jaanhvi.fixture.js';
import { fallbackSlots } from '../fallback.js';
import { attemptSlots, type Caller } from '../index.js';

const { findings } = run(JAANHVI);
const validJson = JSON.stringify(fallbackSlots(findings));
const overCeiling = JSON.stringify({
  ...fallbackSlots(findings),
  // 40 words — over the 30-word conditions_line ceiling
  conditions_line: Array.from({ length: 40 }, (_, i) => `word${i}`).join(' '),
});

/** A caller that returns a queued list of responses, recording each call. */
function mockCaller(responses: string[]): { call: Caller; calls: { system: string; user: string }[] } {
  const calls: { system: string; user: string }[] = [];
  let i = 0;
  const call: Caller = async (system, user) => {
    calls.push({ system, user });
    return responses[Math.min(i++, responses.length - 1)]!;
  };
  return { call, calls };
}

describe('synthesis · repair retry', () => {
  it('accepts a valid first response without retrying', async () => {
    const { call, calls } = mockCaller([validJson]);
    const result = await attemptSlots(findings, call, 'mock');
    expect(result).not.toBeNull();
    expect(calls).toHaveLength(1);
  });

  it('repairs a contract-violating first response, then succeeds', async () => {
    const { call, calls } = mockCaller([overCeiling, validJson]);
    const result = await attemptSlots(findings, call, 'mock');
    expect(result).not.toBeNull();
    expect(calls).toHaveLength(2);
    // the repair prompt must name the specific violation
    expect(calls[1]!.user).toContain('conditions_line');
    expect(calls[1]!.user).toMatch(/exceeds 30 words/);
  });

  it('recovers from a non-JSON first response', async () => {
    const { call, calls } = mockCaller(['sorry, here is your report!', validJson]);
    const result = await attemptSlots(findings, call, 'mock');
    expect(result).not.toBeNull();
    expect(calls).toHaveLength(2);
  });

  it('gives up (returns null) when the contract keeps failing', async () => {
    const { call, calls } = mockCaller([overCeiling, overCeiling]);
    const result = await attemptSlots(findings, call, 'mock');
    expect(result).toBeNull();
    expect(calls).toHaveLength(2); // exactly one retry, no infinite loop
  });
});
