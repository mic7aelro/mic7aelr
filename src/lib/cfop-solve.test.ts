import { describe, expect, it } from 'vitest';
import { applyAlg, isSolved, randomScramble, SOLVED } from './cube';
import { solveCube, type Answer, type Decider, type DecisionRequest } from './cfop-solve';

/** Small deterministic random number generator, so a failing scramble repeats. */
function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

/** A decider that ranks every choice at random. It models a Jev that is often wrong. */
function chaoticDecider(random: () => number): Decider {
  return async (request: DecisionRequest) => {
    const answers: Record<string, Answer> = {};
    for (const [key, question] of Object.entries(request.questions)) {
      if (question.type === 'choice') {
        const options = Object.keys(question.criteria);
        const weights = options.map(() => random());
        const total = weights.reduce((sum, weight) => sum + weight, 0);
        const probabilities = Object.fromEntries(options.map((option, index) => [option, weights[index] / total]));
        const choice = options[weights.indexOf(Math.max(...weights))];
        answers[key] = { type: 'choice', choice, probabilities, confidence: 0.5 };
      } else {
        answers[key] = { type: 'score', score: random() * 4, confidence: 0.5 };
      }
    }
    return answers;
  };
}

function replay(scramble: string[], moves: string[]) {
  return isSolved(applyAlg(applyAlg(SOLVED, scramble), moves));
}

describe('solveCube without Jev', () => {
  it('solves random scrambles', async () => {
    const random = seeded(7);
    for (let trial = 0; trial < 40; trial += 1) {
      const scramble = randomScramble(25, random);
      const result = await solveCube(scramble);
      expect(replay(scramble, result.moves), scramble.join(' ')).toBe(true);
      expect(result.solved).toBe(true);
    }
  });

  it('counts face turns for each area and leaves out rotations', async () => {
    const random = seeded(21);
    for (let trial = 0; trial < 15; trial += 1) {
      const result = await solveCube(randomScramble(25, random));
      const { areas } = result;
      const sum = areas.cross + areas.f2l + areas.oll + areas.pll + areas.wv + areas.coll + areas.auf;
      expect(sum).toBe(result.turnCount);
      expect(result.turnCount + result.rotationCount).toBe(result.moves.length);
    }
  });

  it('solves a solved cube with no moves', async () => {
    const result = await solveCube([]);
    expect(result.moves).toEqual([]);
    expect(result.solved).toBe(true);
  });

  it('solves single moves and short scrambles', async () => {
    for (const scramble of ['R', "U'", 'F2', "R U R' U'", "F R U R' U' F'", "R U R' U R U2 R'"]) {
      const result = await solveCube(scramble);
      expect(replay(result.scramble, result.moves), scramble).toBe(true);
    }
  });

  it('keeps the cross on the bottom when the caller does not ask for a cross choice', async () => {
    const result = await solveCube("R U F' L2 D B'", undefined, { chooseCross: false });
    expect(result.steps.some((step) => step.stage === 'orient')).toBe(false);
    expect(result.solved).toBe(true);
  });
});

describe('solveCube with a wrong-minded decider', () => {
  it('still solves every scramble', async () => {
    const random = seeded(99);
    for (let trial = 0; trial < 25; trial += 1) {
      const scramble = randomScramble(25, random);
      const result = await solveCube(scramble, chaoticDecider(random));
      expect(replay(scramble, result.moves), scramble.join(' ')).toBe(true);
      expect(result.jevCalls).toBeGreaterThan(0);
    }
  });

  it('survives a decider that throws', async () => {
    const scramble = randomScramble(25, seeded(3));
    const result = await solveCube(scramble, async () => {
      throw new Error('network down');
    });
    expect(result.solved).toBe(true);
    expect(result.jevFailures.length).toBeGreaterThan(0);
    expect(result.decisions.every((decision) => decision.source !== 'jev')).toBe(true);
  });

  it('survives a decider that returns nothing', async () => {
    const result = await solveCube(randomScramble(25, seeded(5)), async () => null);
    expect(result.solved).toBe(true);
  });
});
