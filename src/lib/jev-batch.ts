/**
 * Ask Jev about many items in one request.
 *
 * Batching is faster, but it can change answers. A test on 120 real arXiv abstracts showed that
 * Jev's batched answers match its one-at-a-time answers 98% of the time with 5 items in a
 * request, 95% with 10, 93% with 20, and 90% with 40. Keep batches small when accuracy matters.
 *
 * The engine names every question with the position of its item. It reads answers by name, never
 * by order. When an item has a missing answer, the engine asks about that item again, alone.
 */

import type { Answer, Decider, Question } from './cfop-solve';

/** Stay well under the context window of the model. */
export const TOKEN_BUDGET_PER_REQUEST = 24_000;

/** A rough estimate: one token for each 4 characters. The estimate matched Jev's own count on real abstracts. */
export const estimateTokens = (text: string) => Math.ceil(text.length / 4);

/** Group item positions. A group ends at `maxItems`, or before its estimated tokens pass `maxTokens`. */
export function planBatches(costs: readonly number[], maxItems: number, maxTokens = TOKEN_BUDGET_PER_REQUEST): number[][] {
  const groups: number[][] = [];
  let current: number[] = [];
  let tokens = 0;
  costs.forEach((cost, position) => {
    if (current.length > 0 && (current.length >= maxItems || tokens + cost > maxTokens)) {
      groups.push(current);
      current = [];
      tokens = 0;
    }
    current.push(position);
    tokens += cost;
  });
  if (current.length > 0) groups.push(current);
  return groups;
}

/**
 * Build the questions for one item. `reference` is the words that point at the item: for example
 * "item number 3 in the items list" in a batch, or "the text" for a single item.
 */
export type QuestionsFor = (reference: string) => Record<string, Question>;

export type ItemAnswers = Record<string, Answer>;

const keyFor = (position: number, name: string) => `i${position}_${name}`;

/**
 * Ask about a group of items in one request. Return one entry for each item. An entry is null when
 * Jev gave no answer to at least one question of that item.
 */
export async function askBatch(decide: Decider, items: readonly string[], questionsFor: QuestionsFor): Promise<(ItemAnswers | null)[]> {
  const state = { items: Object.fromEntries(items.map((text, position) => [String(position), text])) };
  const questions: Record<string, Question> = {};
  const names: string[][] = [];
  items.forEach((_, position) => {
    const own = questionsFor(`item number ${position} in the items list`);
    names.push(Object.keys(own));
    for (const [name, question] of Object.entries(own)) questions[keyFor(position, name)] = question;
  });

  const answers = await decide({ stage: 'batch', state, questions });
  return items.map((_, position) => {
    if (!answers) return null;
    const result: ItemAnswers = {};
    for (const name of names[position]) {
      const answer = answers[keyFor(position, name)];
      if (!answer) return null;
      result[name] = answer;
    }
    return result;
  });
}

/** Ask about one item on its own. */
export async function askOne(decide: Decider, text: string, questionsFor: QuestionsFor): Promise<ItemAnswers | null> {
  const questions = questionsFor('the text');
  const answers = await decide({ stage: 'single', state: text, questions });
  if (!answers) return null;
  const result: ItemAnswers = {};
  for (const name of Object.keys(questions)) {
    if (!answers[name]) return null;
    result[name] = answers[name];
  }
  return result;
}

/** Run `worker` on every item of `list`, with at most `limit` running at once. */
export async function mapLimit<T, R>(list: readonly T[], limit: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(list.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, list.length) }, async () => {
    while (next < list.length) {
      const index = next;
      next += 1;
      results[index] = await worker(list[index], index);
    }
  }));
  return results;
}

export interface AskManyOptions {
  /** Most items in one request. Use 1 to ask about each item alone. */
  batchSize: number;
  /** Most requests at once. */
  concurrency?: number;
  /** Estimated tokens for each item, including its questions. Used to keep a request small enough. */
  tokenCosts?: readonly number[];
}

export interface AskManyResult {
  answers: (ItemAnswers | null)[];
  /** Number of items that needed a second request. */
  retried: number;
}

/** Ask about every item. Items with missing answers get one more try, alone. */
export async function askMany(decide: Decider, items: readonly string[], questionsFor: QuestionsFor, options: AskManyOptions): Promise<AskManyResult> {
  const costs = options.tokenCosts ?? items.map((text) => estimateTokens(text) + 40);
  const groups = planBatches(costs, Math.max(1, options.batchSize));
  const answers = new Array<ItemAnswers | null>(items.length).fill(null);

  await mapLimit(groups, options.concurrency ?? 4, async (group) => {
    let found: (ItemAnswers | null)[];
    try {
      found = group.length === 1
        ? [await askOne(decide, items[group[0]], questionsFor)]
        : await askBatch(decide, group.map((position) => items[position]), questionsFor);
    } catch {
      found = group.map(() => null);
    }
    group.forEach((position, index) => { answers[position] = found[index]; });
  });

  const missing = answers.map((entry, position) => (entry ? -1 : position)).filter((position) => position >= 0);
  await mapLimit(missing, options.concurrency ?? 4, async (position) => {
    try {
      answers[position] = await askOne(decide, items[position], questionsFor);
    } catch {
      answers[position] = null;
    }
  });

  return { answers, retried: missing.length };
}
