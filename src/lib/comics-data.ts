import { comics, type Comic } from '@/data/comics';
import { getWritingDatabase, isWritingConfigured } from '@/lib/mongodb';

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
      return {
        ...comic,
        ...(typeof record.read === 'boolean' ? { read: record.read } : {}),
        ...(record.status ? { status: record.status } : {}),
      };
    });
    const custom = records
      .filter((record) => record.custom)
      .map(({ _id: _ignored, custom: _custom, updatedAt: _updatedAt, ...comic }) => comic);
    return [...seeded, ...custom];
  } catch {
    return comics;
  }
}
