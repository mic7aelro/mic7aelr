import { describe, expect, it } from 'vitest';
import { buildTables } from './cfop-tables';

describe('CFOP tables', () => {
  const tables = buildTables();

  it('accepts every catalog algorithm', () => {
    expect(tables.rejections).toEqual([]);
  });

  it('covers every last-layer case', () => {
    // 3^3 corner twists times 2^3 edge flips, without the solved state.
    expect(tables.oll.size).toBe(215);
    // All permutations of the last layer with the pieces oriented, without the four skips.
    expect(tables.pll.size).toBe(284);
    // 26 non-zero corner twist states times 24 corner permutations, with the edges oriented.
    expect(tables.coll.size).toBe(624);
  });

  it('covers 148 of the 149 unsolved pair placements in the top layer and the slot', () => {
    // The missing placement has a twisted corner and a flipped edge in the slot. The solver lifts the pair first.
    expect(tables.f2l.size).toBe(148);
  });

  it('has Winter Variation entries for the front-right and front-left cases', () => {
    expect(tables.wv.size).toBe(216);
  });
});
