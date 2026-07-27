import type { Comic } from '@/data/comics';

/**
 * The parts of a comic rating and the weight of each part.
 * Each part takes a score from 0 to 10. The weights total 100.
 */
export const ratingParts = [
  { field: 'storyRating', name: 'Story', weight: 40 },
  { field: 'artRating', name: 'Art', weight: 30 },
  { field: 'colorsRating', name: 'Colors', weight: 15 },
  { field: 'pacingRating', name: 'Pacing', weight: 15 },
] as const;

export type RatingField = (typeof ratingParts)[number]['field'];

export const ratingFields = ratingParts.map((part) => part.field) as readonly RatingField[];

/** Read a score, or return null when the comic holds no score for that part. */
export function score(comic: Comic, field: RatingField) {
  const value = comic[field];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Return the weighted score out of 100, or null when a part has no score.
 * A rating needs every part, so a partial rating stays hidden.
 */
export function aggregate(comic: Comic) {
  let total = 0;
  for (const part of ratingParts) {
    const value = score(comic, part.field);
    if (value === null) return null;
    total += (value * part.weight) / 10;
  }
  return Math.round(total);
}

/** Keep a score inside 0 to 10 with one decimal, or return null. */
export function cleanScore(value: unknown) {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.round(Math.min(10, Math.max(0, number)) * 10) / 10;
}
