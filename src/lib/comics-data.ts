import { comics, type Comic } from '@/data/comics';
import { ratingFields } from '@/lib/comic-rating';
import { getWritingDatabase, isWritingConfigured } from '@/lib/mongodb';

/** Fields the author can change from the comics page. */
export const editableFields = [
  'title', 'description', 'year', 'category', 'creators',
  'writers', 'artists', 'collects', 'cover', 'link', 'series', 'review',
] as const;

type ComicRecord = Comic & {
  custom?: boolean;
  updatedAt?: string;
};

export async function getComics(): Promise<Comic[]> {
  if (!isWritingConfigured()) return comics;

  try {
    const database = await getWritingDatabase();
    const records = await database.collection<ComicRecord>('comics').find({}).toArray();
    const recordsById = new Map(records.map((record) => [record.id, record]));
    const seeded = comics.map((comic) => {
      const record = recordsById.get(comic.id);
      if (!record) return comic;
      // Apply only the fields the record holds. A record that stores one field
      // must not erase the seeded value of the other field.
      const overrides: Partial<Comic> = {};
      if (typeof record.read === 'boolean') overrides.read = record.read;
      if (record.status) overrides.status = record.status;
      for (const field of editableFields) {
        const value = record[field];
        // Accept an empty string, which clears a field, and accept a number.
        if (value !== undefined && value !== null) overrides[field] = value;
      }
      for (const field of ratingFields) {
        const value = record[field];
        if (typeof value === 'number') overrides[field] = value;
      }
      return { ...comic, ...overrides };
    });
    const custom = records
      .filter((record) => record.custom)
      .map(({ _id: _ignored, custom: _custom, updatedAt: _updatedAt, ...comic }) => comic);
    return [...seeded, ...custom];
  } catch {
    return comics;
  }
}
