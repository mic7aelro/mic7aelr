import { describe, expect, it } from 'vitest';
import { applyAlg, dropRotations, frameAlg, frameState, invertAlg, isSolved, parseAlg, randomScramble, SOLVED } from './cube';

describe('cube engine', () => {
  it('returns to solved after each basic move repeated four times', () => {
    for (const move of ['R', 'U', 'F', 'L', 'D', 'B', 'r', 'M', 'E', 'S', 'x', 'y', 'z']) {
      expect(applyAlg(SOLVED, Array(4).fill(move).join(' '))).toBe(SOLVED);
    }
  });

  it('moves stickers the standard way', () => {
    // R sends the front-face right column to the up face.
    const state = applyAlg(SOLVED, 'R');
    expect(state[8]).toBe('F');
    expect(state[5]).toBe('F');
    expect(state[2]).toBe('F');
    // U sends the front row to the left face.
    const up = applyAlg(SOLVED, 'U');
    expect(up.slice(36, 39)).toBe('FFF');
  });

  it('has a known 6-move identity: (R U R\' U\') repeated 6 times', () => {
    expect(applyAlg(SOLVED, Array(6).fill("R U R' U'").join(' '))).toBe(SOLVED);
  });

  it('inverts algorithms', () => {
    const scramble = randomScramble(30);
    expect(applyAlg(applyAlg(SOLVED, scramble), invertAlg(scramble))).toBe(SOLVED);
  });

  it('parses notation variants', () => {
    expect(parseAlg("R2' U3 (F' Rw)")).toEqual(['R2', "U'", "F'", 'r']);
  });

  it('treats a slice sequence as a whole-cube rotation plus faces', () => {
    // M' E' S is not a rotation, but x = R M' L' must hold.
    expect(applyAlg(SOLVED, "R M' L'")).toBe(applyAlg(SOLVED, 'x'));
  });

  it('drops rotations by moving them to the end of the algorithm', () => {
    const alg = parseAlg("y R U R' U' x' F R2 z");
    const dropped = dropRotations(alg);
    const rotations = alg.filter((token) => /^[xyz]/.test(token));
    expect(dropped.some((token) => /^[xyz]/.test(token))).toBe(false);
    for (let trial = 0; trial < 5; trial += 1) {
      const base = applyAlg(SOLVED, randomScramble(20));
      expect(applyAlg(base, [...dropped, ...rotations])).toBe(applyAlg(base, alg));
    }
  });

  it('conjugates an algorithm into another frame', () => {
    const alg = parseAlg("R U R' U'");
    expect(frameAlg(alg, 1)).toEqual(["F", "U", "F'", "U'"]);
    // Whole-state framing and alg framing must agree.
    const base = applyAlg(SOLVED, randomScramble(20));
    const framedState = frameState(applyAlg(base, frameAlg(alg, 1)), 1);
    expect(framedState).toBe(applyAlg(frameState(base, 1), alg));
  });

  it('detects a solved cube up to color naming', () => {
    expect(isSolved(applyAlg(SOLVED, 'x y'))).toBe(true);
    expect(isSolved(applyAlg(SOLVED, 'R'))).toBe(false);
  });
});
