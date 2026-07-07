import { describe, it, expect } from 'vitest';
import pg from 'pg';
import '../db.js'; // side effect: registers the NUMERIC type parser

/**
 * Regression guard: Postgres returns NUMERIC as a string by default, which made
 * artifact imp/hum reach the client as "0.9" and broke the B5 submit (400).
 * Importing the db config must register a parser that returns real numbers.
 */
describe('db · NUMERIC type parser', () => {
  const parse = pg.types.getTypeParser(pg.types.builtins.NUMERIC);

  it('parses a numeric string into a JS number', () => {
    const v = parse('0.9');
    expect(typeof v).toBe('number');
    expect(v).toBe(0.9);
  });

  it('handles negatives (imp/hum span -1..1)', () => {
    expect(parse('-0.8')).toBe(-0.8);
  });
});
