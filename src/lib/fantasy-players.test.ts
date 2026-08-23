import { describe, expect, it } from 'vitest';
import { applyRedraftOrder, applyTemplateOrder } from './fantasy-players';
import type { FantasyPlayer, FantasyPosition } from '@/types/fantasy';

function player(sleeperId: string, position: FantasyPosition): FantasyPlayer {
  return { sleeperId, name: sleeperId, position, team: 'AAA' };
}

const ids = (list: FantasyPlayer[]) => list.map((p) => p.sleeperId);

describe('applyRedraftOrder', () => {
  it('pushes a top-search-rank QB well below the top skill players (regression: Josh Allen ranked 3rd)', () => {
    // Mimic Sleeper's raw search_rank order, where a star QB can land in the top 5
    // purely on popularity even though single-QB redraft leagues do not draft that way.
    const pool = [
      player('rb-1', 'RB'),
      player('rb-2', 'RB'),
      player('qb-star', 'QB'),
      player('wr-1', 'WR'),
      player('rb-3', 'WR'),
      ...Array.from({ length: 40 }, (_, i) => player(`filler-${i}`, i % 2 === 0 ? 'RB' : 'WR')),
    ];

    const result = applyRedraftOrder(pool);
    const qbIndex = result.findIndex((p) => p.sleeperId === 'qb-star');

    expect(qbIndex).toBeGreaterThan(20);
    // Still a full permutation — nobody lost, nobody duplicated.
    expect(result).toHaveLength(pool.length);
    expect(new Set(ids(result)).size).toBe(pool.length);
  });

  it('is always a full permutation across randomized position mixes', () => {
    const positions: FantasyPosition[] = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
    const pool = Array.from({ length: 220 }, (_, i) => player(`p${i}`, positions[i % positions.length]));

    const result = applyRedraftOrder(pool);
    expect(result).toHaveLength(pool.length);
    expect(new Set(ids(result)).size).toBe(pool.length);
  });
});

describe('applyTemplateOrder', () => {
  const pool = Array.from({ length: 60 }, (_, i) => player(
    `p${i}`,
    (['QB', 'RB', 'WR', 'TE', 'K', 'DEF'] as FantasyPosition[])[i % 6],
  ));

  it('leaves the sleeper template order untouched', () => {
    const result = applyTemplateOrder(pool, 'sleeper');
    expect(result).toBe(pool);
  });

  it('produces a full permutation for the espn template', () => {
    const result = applyTemplateOrder(pool, 'espn');
    expect(result).toHaveLength(pool.length);
    expect(new Set(ids(result)).size).toBe(pool.length);
  });

  it('produces a full permutation for the cbs template', () => {
    const result = applyTemplateOrder(pool, 'cbs');
    expect(result).toHaveLength(pool.length);
    expect(new Set(ids(result)).size).toBe(pool.length);
  });

  it('espn and cbs produce a different order from each other and from sleeper', () => {
    const sleeperOrder = applyTemplateOrder(pool, 'sleeper');
    const espnOrder = applyTemplateOrder(pool, 'espn');
    const cbsOrder = applyTemplateOrder(pool, 'cbs');

    expect(ids(espnOrder)).not.toEqual(ids(sleeperOrder));
    expect(ids(cbsOrder)).not.toEqual(ids(sleeperOrder));
  });
});
