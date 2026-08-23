import { describe, expect, it } from 'vitest';
import { applyPositionReorder, FANTASY_POSITION_COLORS, FANTASY_POSITION_ORDER, reorderFromTrustedRecords } from './fantasy-order';
import type { FantasyPlayer, FantasyPosition } from '@/types/fantasy';

function player(sleeperId: string, position: FantasyPosition): FantasyPlayer {
  return { sleeperId, name: sleeperId, position, team: 'AAA' };
}

const ids = (list: FantasyPlayer[]) => list.map((p) => p.sleeperId);

describe('applyPositionReorder', () => {
  it('reorders within a position and leaves other positions exactly in place', () => {
    const board = [
      player('qb1', 'QB'),
      player('rb1', 'RB'),
      player('rb2', 'RB'),
      player('wr1', 'WR'),
      player('rb3', 'RB'),
      player('te1', 'TE'),
    ];

    // Move rb3 to the front of the RB group.
    const reorderedRbs = [board[4], board[1], board[2]]; // rb3, rb1, rb2
    const result = applyPositionReorder(board, 'RB', reorderedRbs);

    expect(ids(result)).toEqual(['qb1', 'rb3', 'rb1', 'wr1', 'rb2', 'te1']);
    // Non-RB players keep their exact original slots.
    expect(result[0].sleeperId).toBe('qb1');
    expect(result[3].sleeperId).toBe('wr1');
    expect(result[5].sleeperId).toBe('te1');
  });

  it('is a full permutation regardless of how the position group is reordered', () => {
    const board = Array.from({ length: 30 }, (_, i) => player(`p${i}`, i % 3 === 0 ? 'WR' : i % 3 === 1 ? 'RB' : 'QB'));
    const wrGroup = board.filter((p) => p.position === 'WR');
    const shuffledWrs = [...wrGroup].reverse();

    const result = applyPositionReorder(board, 'WR', shuffledWrs);
    expect(result).toHaveLength(board.length);
    expect(new Set(ids(result)).size).toBe(board.length);
    // every non-WR player is untouched and in its original index
    board.forEach((p, i) => {
      if (p.position !== 'WR') expect(result[i]).toEqual(p);
    });
  });

  it('no-ops safely when the position has zero members', () => {
    const board = [player('qb1', 'QB'), player('rb1', 'RB')];
    const result = applyPositionReorder(board, 'TE', []);
    expect(result).toEqual(board);
  });

  it('no-ops safely when the position has exactly one member', () => {
    const board = [player('qb1', 'QB'), player('te1', 'TE'), player('rb1', 'RB')];
    const result = applyPositionReorder(board, 'TE', [player('te1', 'TE')]);
    expect(result).toEqual(board);
  });
});

describe('reorderFromTrustedRecords', () => {
  const current = [player('a', 'QB'), player('b', 'RB'), player('c', 'WR')];

  it('reorders using only the submitted id sequence', () => {
    const submitted = [{ sleeperId: 'c' }, { sleeperId: 'a' }, { sleeperId: 'b' }];
    const result = reorderFromTrustedRecords(current, submitted);
    expect(ids(result!)).toEqual(['c', 'a', 'b']);
  });

  it('ignores any other fields on the submitted entries and uses the server\'s own records instead (regression: name/position/team tampering)', () => {
    const submitted = [
      { sleeperId: 'a', name: 'HACKED NAME', position: 'DEF', team: 'ZZZ' },
      { sleeperId: 'b' },
      { sleeperId: 'c' },
    ];
    const result = reorderFromTrustedRecords(current, submitted);
    expect(result![0]).toEqual(current[0]); // unchanged real record for "a", not the tampered fields
  });

  it('rejects a payload with the wrong length', () => {
    expect(reorderFromTrustedRecords(current, [{ sleeperId: 'a' }])).toBeNull();
  });

  it('rejects a payload with an id not on the board', () => {
    const submitted = [{ sleeperId: 'a' }, { sleeperId: 'b' }, { sleeperId: 'not-real' }];
    expect(reorderFromTrustedRecords(current, submitted)).toBeNull();
  });

  it('rejects a payload with a duplicated id standing in for a missing one', () => {
    const submitted = [{ sleeperId: 'a' }, { sleeperId: 'a' }, { sleeperId: 'b' }];
    expect(reorderFromTrustedRecords(current, submitted)).toBeNull();
  });

  it('rejects a non-array payload', () => {
    expect(reorderFromTrustedRecords(current, { not: 'an array' })).toBeNull();
    expect(reorderFromTrustedRecords(current, null)).toBeNull();
  });

  it('rejects entries missing a sleeperId', () => {
    const submitted = [{ sleeperId: 'a' }, { sleeperId: 'b' }, {}];
    expect(reorderFromTrustedRecords(current, submitted)).toBeNull();
  });
});

describe('FANTASY_POSITION_COLORS', () => {
  const hexColor = /^#[0-9a-f]{6}$/i;

  it('defines a background and text color for every position in FANTASY_POSITION_ORDER', () => {
    for (const position of FANTASY_POSITION_ORDER) {
      const entry = FANTASY_POSITION_COLORS[position];
      expect(entry, `missing color for ${position}`).toBeDefined();
      expect(entry.background, `${position} background`).toMatch(hexColor);
      expect(entry.text, `${position} text`).toMatch(hexColor);
    }
  });
});
