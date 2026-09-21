import { describe, expect, it } from 'vitest';
import { PACKS, pointsFor, positionFromScore, randomTarget, SCALES, scalesForPack, validateClue } from './wavelength';

describe('wavelength rules', () => {
  it('scores by distance', () => {
    expect(pointsFor(50, 50)).toBe(4);
    expect(pointsFor(50, 55)).toBe(4);
    expect(pointsFor(50, 44)).toBe(3);
    expect(pointsFor(50, 68)).toBe(2);
    expect(pointsFor(50, 22)).toBe(1);
    expect(pointsFor(50, 90)).toBe(0);
  });

  it('picks targets away from both ends', () => {
    for (let trial = 0; trial < 200; trial += 1) {
      const target = randomTarget();
      expect(target).toBeGreaterThanOrEqual(8);
      expect(target).toBeLessThanOrEqual(92);
    }
  });

  it('maps a Jev score to a position', () => {
    expect(positionFromScore(0, 5)).toBe(0);
    expect(positionFromScore(2, 5)).toBe(50);
    expect(positionFromScore(4, 5)).toBe(100);
    expect(positionFromScore(7.82, 5)).toBe(100);
    expect(positionFromScore(-1, 5)).toBe(0);
  });

  it('rejects clues that give the number away', () => {
    for (const clue of ['', 'a 7', '7', 'seven', 'seven out of ten', '10/10', '7/10 vibes', '80%', 'about 60 percent', 'x'.repeat(61)]) {
      expect(validateClue(clue), clue).not.toBeNull();
    }
  });

  it('allows titles that contain numbers', () => {
    for (const clue of ['Darth Vader', 'Baby Yoda', 'One Piece', 'One Punch Man', 'Toy Story 3', 'Game Seven', 'Paddington Two', 'Blink 182', 'Steins;Gate 0', 'Apollo 13']) {
      expect(validateClue(clue), clue).toBeNull();
    }
  });

  it('has five levels for every scale and content in every pack', () => {
    for (const scale of SCALES) expect(scale.levels).toHaveLength(5);
    for (const pack of PACKS) expect(scalesForPack(pack.id).length, pack.label).toBeGreaterThanOrEqual(5);
  });

  it('uses each scale id once and gives each scale different end labels', () => {
    expect(new Set(SCALES.map((scale) => scale.id)).size).toBe(SCALES.length);
    for (const scale of SCALES) expect(scale.left).not.toBe(scale.right);
  });
});
