/**
 * Label many rows of text with categories that you choose. Jev picks one category for each row
 * and reports a probability for every category.
 */

import type { ChoiceQuestion } from './cfop-solve';
import { askMany, estimateTokens, type ItemAnswers } from './jev-batch';
import type { Decider } from './cfop-solve';

export interface Category {
  name: string;
  description: string;
}

export const MIN_CATEGORIES = 2;
export const MAX_CATEGORIES = 255;
export const MAX_NAME_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 200;
/** Longer text is cut. Jev reads a limited amount of text in each request. */
export const MAX_ROW_CHARS = 4_000;
export const MAX_CONTEXT_LENGTH = 200;
/** The list price of Jev input tokens, in dollars for each million. This is a published figure, not a bill. */
export const LIST_PRICE_PER_MILLION_TOKENS = 0.042;

/** Batch sizes for the speed setting. The agreement figures come from a test on 120 real abstracts. */
export const FIDELITY = [
  { id: 'best', label: 'Best', batchSize: 5, note: 'Matches one-at-a-time answers 98% of the time. The slowest option.' },
  { id: 'balanced', label: 'Balanced', batchSize: 10, note: 'Matches one-at-a-time answers 95% of the time.' },
  { id: 'fast', label: 'Fast', batchSize: 30, note: 'Matches one-at-a-time answers about 91% of the time. The fastest option.' },
] as const;

export type FidelityId = (typeof FIDELITY)[number]['id'];

/** Read categories from lines of text. A line is "name" or "name: description". */
export function parseCategories(text: string): { categories: Category[]; error?: string } {
  const categories: Category[] = [];
  const seen = new Set<string>();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const split = line.indexOf(':');
    const name = (split === -1 ? line : line.slice(0, split)).trim();
    const description = split === -1 ? '' : line.slice(split + 1).trim();
    if (!name) return { categories, error: `A category needs a name: "${line}".` };
    if (name.length > MAX_NAME_LENGTH) return { categories, error: `Keep a category name under ${MAX_NAME_LENGTH} characters: "${name.slice(0, 20)}…".` };
    if (description.length > MAX_DESCRIPTION_LENGTH) return { categories, error: `Keep a description under ${MAX_DESCRIPTION_LENGTH} characters: "${name}".` };
    if (seen.has(name.toLowerCase())) return { categories, error: `The category "${name}" appears twice.` };
    seen.add(name.toLowerCase());
    categories.push({ name, description });
  }
  if (categories.length < MIN_CATEGORIES) return { categories, error: `Add at least ${MIN_CATEGORIES} categories, one on each line.` };
  if (categories.length > MAX_CATEGORIES) return { categories, error: `Use at most ${MAX_CATEGORIES} categories.` };
  return { categories };
}

export interface LabelResult {
  label: string | null;
  /** Jev confidence in the label, from 0 to 1. */
  confidence: number;
  /** The three most likely categories. */
  top: { name: string; p: number }[];
}

const NO_LABEL: LabelResult = { label: null, confidence: 0, top: [] };

function questionFor(categories: readonly Category[], context: string) {
  const criteria = Object.fromEntries(categories.map((category) => [category.name, category.description || category.name]));
  return (reference: string): Record<string, ChoiceQuestion> => ({
    label: {
      type: 'choice',
      instructions: `Which category best fits ${reference}?${context ? ` ${context}` : ''}`,
      criteria,
    },
  });
}

/** Estimated tokens for the question text that repeats for every row. */
export function questionTokens(categories: readonly Category[], context = ''): number {
  return categories.reduce((sum, category) => sum + estimateTokens(category.name) + estimateTokens(category.description) + 4, 0) + estimateTokens(context) + 30;
}

export interface RunEstimate {
  rows: number;
  /** Estimated input tokens for the whole run. */
  tokens: number;
}

export function estimateRun(texts: readonly string[], categories: readonly Category[], context = ''): RunEstimate {
  const perQuestion = questionTokens(categories, context);
  // Every row sends its own question, in a batch or alone, so the estimate does not depend on the batch size.
  const tokens = texts.reduce((sum, text) => sum + estimateTokens(text.slice(0, MAX_ROW_CHARS)) + perQuestion, 0);
  return { rows: texts.length, tokens };
}

function toResult(answers: ItemAnswers | null): LabelResult {
  const answer = answers?.label;
  if (!answer || answer.type !== 'choice') return NO_LABEL;
  const top = Object.entries(answer.probabilities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, p]) => ({ name, p }));
  return { label: answer.choice, confidence: answer.confidence, top };
}

export async function labelTexts(
  decide: Decider,
  texts: readonly string[],
  categories: readonly Category[],
  options: { batchSize: number; context?: string; concurrency?: number },
): Promise<{ results: LabelResult[]; retried: number }> {
  const context = (options.context ?? '').trim().slice(0, MAX_CONTEXT_LENGTH);
  const clipped = texts.map((text) => text.slice(0, MAX_ROW_CHARS));
  const perQuestion = questionTokens(categories, context);
  const { answers, retried } = await askMany(decide, clipped, questionFor(categories, context), {
    batchSize: options.batchSize,
    concurrency: options.concurrency,
    tokenCosts: clipped.map((text) => estimateTokens(text) + perQuestion),
  });
  return { results: answers.map(toResult), retried };
}
