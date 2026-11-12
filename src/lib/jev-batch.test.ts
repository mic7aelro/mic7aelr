import { describe, expect, it } from 'vitest';
import type { Answer, Decider, DecisionRequest, Question } from './cfop-solve';
import { askBatch, askMany, estimateTokens, mapLimit, planBatches } from './jev-batch';

const yesNo = (reference: string): Record<string, Question> => ({ long: { type: 'noul', instructions: `${reference} is long.` } });

/** A fake Jev. It says an item is long when the text has more than 5 characters. */
function fakeJev(options: { drop?: (key: string) => boolean; failBatchesOver?: number; log?: DecisionRequest[] } = {}): Decider {
  return async (request) => {
    options.log?.push(request);
    const asked = Object.keys(request.questions);
    if (options.failBatchesOver !== undefined && asked.length > options.failBatchesOver) throw new Error('too big');
    const answers: Record<string, Answer> = {};
    for (const key of asked) {
      if (options.drop?.(key)) continue;
      const match = /^i(\d+)_/.exec(key);
      const text = match
        ? (request.state as { items: Record<string, string> }).items[match[1]]
        : (request.state as string);
      answers[key] = { type: 'noul', noul: text.length > 5 ? 0.9 : 0.1 };
    }
    return answers;
  };
}

describe('planBatches', () => {
  it('splits by item count', () => {
    expect(planBatches([1, 1, 1, 1, 1], 2)).toEqual([[0, 1], [2, 3], [4]]);
  });

  it('splits by token budget and gives a huge item its own group', () => {
    expect(planBatches([10, 10, 10, 100, 10], 50, 30)).toEqual([[0, 1, 2], [3], [4]]);
  });

  it('returns nothing for no items', () => {
    expect(planBatches([], 5)).toEqual([]);
  });
});

describe('estimateTokens', () => {
  it('counts about one token for each 4 characters', () => {
    expect(estimateTokens('a'.repeat(400))).toBe(100);
    expect(estimateTokens('')).toBe(0);
  });
});

describe('askBatch', () => {
  it('reads each answer by its own name, so no answer shifts to another item', async () => {
    const items = ['tiny', 'a much longer text', 'ok', 'another long text'];
    // Return the answers in reverse order. A parser that reads by order would fail.
    const decide: Decider = async (request) => {
      const keys = Object.keys(request.questions).reverse();
      return Object.fromEntries(keys.map((key) => {
        const position = Number(/^i(\d+)_/.exec(key)![1]);
        return [key, { type: 'noul' as const, noul: items[position].length > 5 ? 0.9 : 0.1 }];
      }));
    };
    const result = await askBatch(decide, items, yesNo);
    expect(result.map((entry) => (entry!.long as { noul: number }).noul > 0.5)).toEqual([false, true, false, true]);
  });

  it('returns null for an item that has a missing answer, and keeps its neighbors', async () => {
    const result = await askBatch(fakeJev({ drop: (key) => key === 'i1_long' }), ['aaaaaaa', 'bbbbbbb', 'ccccccc'], yesNo);
    expect(result[0]).not.toBeNull();
    expect(result[1]).toBeNull();
    expect(result[2]).not.toBeNull();
  });

  it('returns null for every item when Jev returns nothing', async () => {
    const result = await askBatch(async () => null, ['a', 'b'], yesNo);
    expect(result).toEqual([null, null]);
  });
});

describe('askMany', () => {
  it('sends fewer requests when the batch is larger and returns one answer for each item in order', async () => {
    const items = Array.from({ length: 25 }, (_, i) => (i % 2 === 0 ? 'short' : 'long enough text'));
    const log: DecisionRequest[] = [];
    const { answers, retried } = await askMany(fakeJev({ log }), items, yesNo, { batchSize: 10 });
    expect(log).toHaveLength(3);
    expect(retried).toBe(0);
    answers.forEach((entry, i) => expect((entry!.long as { noul: number }).noul > 0.5).toBe(i % 2 === 1));
  });

  it('uses single-item requests when the batch size is 1', async () => {
    const log: DecisionRequest[] = [];
    await askMany(fakeJev({ log }), ['one text', 'two text'], yesNo, { batchSize: 1 });
    expect(log).toHaveLength(2);
    expect(typeof log[0].state).toBe('string');
  });

  it('asks again, alone, about an item that had no answer in the batch', async () => {
    const log: DecisionRequest[] = [];
    const items = ['aaaaaaa', 'b', 'ccccccc'];
    const { answers, retried } = await askMany(fakeJev({ log, drop: (key) => key === 'i1_long' }), items, yesNo, { batchSize: 3 });
    expect(retried).toBe(1);
    expect(answers.every(Boolean)).toBe(true);
    expect(log).toHaveLength(2);
    expect(log[1].state).toBe('b');
  });

  it('falls back to single requests when a whole batch fails', async () => {
    const items = ['aaaaaaa', 'b', 'ccccccc', 'd'];
    const { answers, retried } = await askMany(fakeJev({ failBatchesOver: 1 }), items, yesNo, { batchSize: 4 });
    expect(retried).toBe(4);
    expect(answers.every(Boolean)).toBe(true);
  });

  it('leaves an item null when even the single request fails', async () => {
    const { answers } = await askMany(async () => { throw new Error('down'); }, ['a', 'b'], yesNo, { batchSize: 2 });
    expect(answers).toEqual([null, null]);
  });
});

describe('mapLimit', () => {
  it('never runs more than the limit at once and keeps the order of results', async () => {
    let running = 0;
    let peak = 0;
    const results = await mapLimit([1, 2, 3, 4, 5, 6, 7], 3, async (value) => {
      running += 1;
      peak = Math.max(peak, running);
      await new Promise((resolve) => setTimeout(resolve, 5));
      running -= 1;
      return value * 2;
    });
    expect(results).toEqual([2, 4, 6, 8, 10, 12, 14]);
    expect(peak).toBeLessThanOrEqual(3);
  });
});
