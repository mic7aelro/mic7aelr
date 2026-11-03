import { describe, expect, it } from 'vitest';
import { evaluate } from './bulk-metrics';
import { estimateRun, labelTexts, MAX_ROW_CHARS, parseCategories } from './bulk-label';
import type { Answer, Decider } from './cfop-solve';
import { parseCsv, toCsv } from './csv';

describe('parseCategories', () => {
  it('reads names and optional descriptions', () => {
    const { categories, error } = parseCategories('billing: payments and refunds\r\ntechnical\n\n  sales : pricing questions  ');
    expect(error).toBeUndefined();
    expect(categories).toEqual([
      { name: 'billing', description: 'payments and refunds' },
      { name: 'technical', description: '' },
      { name: 'sales', description: 'pricing questions' },
    ]);
  });

  it('rejects too few, duplicate, and oversized categories', () => {
    expect(parseCategories('only one').error).toMatch(/at least 2/);
    expect(parseCategories('a\nA').error).toMatch(/twice/);
    expect(parseCategories(`${'x'.repeat(61)}\nb`).error).toMatch(/under 60/);
    expect(parseCategories(Array.from({ length: 256 }, (_, i) => `c${i}`).join('\n')).error).toMatch(/at most 255/);
  });
});

/** A fake Jev that picks "positive" when the text has the word good. */
const fakeJev: Decider = async (request) => {
  const answers: Record<string, Answer> = {};
  for (const [key, question] of Object.entries(request.questions)) {
    if (question.type !== 'choice') continue;
    const match = /^i(\d+)_/.exec(key);
    const text = match ? (request.state as { items: Record<string, string> }).items[match[1]] : (request.state as string);
    const positive = text.includes('good');
    const names = Object.keys(question.criteria);
    answers[key] = {
      type: 'choice',
      choice: positive ? 'positive' : 'negative',
      probabilities: Object.fromEntries(names.map((name) => [name, name === (positive ? 'positive' : 'negative') ? 0.8 : 0.1])),
      confidence: 0.8,
    };
  }
  return answers;
};

describe('labelTexts', () => {
  const categories = [{ name: 'positive', description: '' }, { name: 'negative', description: '' }, { name: 'mixed', description: '' }];

  it('labels every row in order with a confidence and the top three categories', async () => {
    const { results } = await labelTexts(fakeJev, ['good one', 'bad one', 'good two'], categories, { batchSize: 2 });
    expect(results.map((result) => result.label)).toEqual(['positive', 'negative', 'positive']);
    expect(results[0].confidence).toBe(0.8);
    expect(results[0].top).toHaveLength(3);
    expect(results[0].top[0].name).toBe('positive');
  });

  it('cuts very long text before it goes to Jev', async () => {
    const sent: number[] = [];
    const spy: Decider = async (request) => {
      sent.push(String(request.state).length);
      return fakeJev(request);
    };
    await labelTexts(spy, ['good '.repeat(5_000)], categories, { batchSize: 1 });
    expect(sent[0]).toBe(MAX_ROW_CHARS);
  });

  it('gives a row with no answer a null label instead of a wrong one', async () => {
    const { results } = await labelTexts(async () => null, ['good'], categories, { batchSize: 1 });
    expect(results[0]).toEqual({ label: null, confidence: 0, top: [] });
  });
});

describe('estimateRun', () => {
  it('grows with the number of rows and with the category descriptions', () => {
    const small = [{ name: 'a', description: '' }, { name: 'b', description: '' }];
    const big = [{ name: 'a', description: 'x'.repeat(200) }, { name: 'b', description: 'y'.repeat(200) }];
    const texts = ['some text here', 'more text here'];
    expect(estimateRun(texts, small).rows).toBe(2);
    expect(estimateRun([...texts, ...texts], small).tokens).toBeGreaterThan(estimateRun(texts, small).tokens);
    expect(estimateRun(texts, big).tokens).toBeGreaterThan(estimateRun(texts, small).tokens);
  });
});

describe('evaluate', () => {
  const names = ['cs', 'math'];

  it('computes accuracy and skips rows that cannot be scored', () => {
    const result = evaluate(
      [{ label: 'cs', confidence: 0.9 }, { label: 'cs', confidence: 0.6 }, { label: 'math', confidence: 0.8 }, { label: null, confidence: 0 }, { label: 'cs', confidence: 0.7 }],
      ['cs', 'math', 'math', 'cs', 'physics'],
      names,
    );
    expect(result.evaluated).toBe(3);
    expect(result.correct).toBe(2);
    expect(result.accuracy).toBeCloseTo(2 / 3);
    expect(result.skipped).toBe(2);
    expect(result.confusions).toEqual([{ truth: 'math', predicted: 'cs', count: 1 }]);
  });

  it('matches true labels without regard to case and spaces', () => {
    const result = evaluate([{ label: 'cs', confidence: 1 }], [' CS '], names);
    expect(result.accuracy).toBe(1);
  });

  it('shows how coverage falls and accuracy rises as the threshold rises', () => {
    const predictions = [0.99, 0.95, 0.9, 0.6, 0.55, 0.5].map((confidence) => ({ label: 'cs', confidence }));
    const truths = ['cs', 'cs', 'cs', 'math', 'math', 'cs'];
    const { curve } = evaluate(predictions, truths, names);
    const at = (threshold: number) => curve.find((point) => point.threshold === threshold)!;
    expect(at(0).coverage).toBe(1);
    expect(at(0.9).coverage).toBeCloseTo(0.5);
    expect(at(0.9).accuracy).toBe(1);
    expect(at(0).accuracy).toBeCloseTo(4 / 6);
  });

  it('reports overconfidence and a calibration table', () => {
    const predictions = Array.from({ length: 10 }, () => ({ label: 'cs', confidence: 0.9 }));
    const truths = ['cs', 'cs', 'cs', 'cs', 'cs', 'math', 'math', 'math', 'math', 'math'];
    const result = evaluate(predictions, truths, names);
    expect(result.accuracy).toBe(0.5);
    expect(result.overconfidence).toBeCloseTo(0.4);
    expect(result.calibration).toHaveLength(1);
    expect(result.calibration[0]).toMatchObject({ count: 10, accuracy: 0.5 });
  });

  it('handles an empty run', () => {
    expect(evaluate([], [], names)).toMatchObject({ evaluated: 0, accuracy: 0, curve: expect.any(Array) });
  });
});

describe('csv', () => {
  it('reads quotes, doubled quotes, line breaks in quotes, and a byte order mark', () => {
    const table = parseCsv('﻿id,text\r\n1,"He said ""hi"", then left"\r\n2,"line one\nline two"\r\n');
    expect(table.header).toEqual(['id', 'text']);
    expect(table.rows).toEqual([['1', 'He said "hi", then left'], ['2', 'line one\nline two']]);
  });

  it('detects a tab separator and pads short rows', () => {
    const table = parseCsv('a\tb\tc\n1\t2\n');
    expect(table.delimiter).toBe('\t');
    expect(table.rows).toEqual([['1', '2', '']]);
  });

  it('skips blank lines and reads a file with no final line break', () => {
    expect(parseCsv('a,b\n\n1,2').rows).toEqual([['1', '2']]);
    expect(parseCsv('').header).toEqual([]);
  });

  it('writes fields that need quotes, and reads them back', () => {
    const header = ['name', 'note'];
    const rows = [['a,b', 'say "x"'], ['line\nbreak', 'plain']];
    const back = parseCsv(toCsv(header, rows));
    expect(back.header).toEqual(header);
    expect(back.rows).toEqual(rows);
  });
});
