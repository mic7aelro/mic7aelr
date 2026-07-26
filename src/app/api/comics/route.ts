import { NextResponse } from 'next/server';
import { comics, type ComicStatus } from '@/data/comics';
import { getComics } from '@/lib/comics-data';
import { getWritingDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/writing-auth';
import { cleanText, createSlug } from '@/lib/writing-utils';

export async function GET() {
  return NextResponse.json({ comics: await getComics(), authenticated: await isAdmin() });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const body = await request.json();
  const id = cleanText(body.id, 120);
  const read = typeof body.read === 'boolean' ? body.read : null;
  const status: ComicStatus | null = body.status === 'owned' || body.status === 'wishlist' ? body.status : null;
  if (!id || (read === null && status === null)) {
    return NextResponse.json({ error: 'Select a valid comic update.' }, { status: 400 });
  }

  const update: { read?: boolean; status?: ComicStatus; updatedAt: string } = {
    updatedAt: new Date().toISOString(),
  };
  if (read !== null) update.read = read;
  if (status !== null) update.status = status;

  const database = await getWritingDatabase();
  await database.collection('comics').updateOne(
    { id },
    { $set: update, $setOnInsert: { id, custom: false } },
    { upsert: true },
  );
  return NextResponse.json({ id, ...update });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const body = await request.json();
  const title = cleanText(body.title, 180);
  const universe = body.universe === 'marvel' ? 'marvel' : 'dc';
  const read = Boolean(body.read);
  const status: ComicStatus = body.status === 'wishlist' ? 'wishlist' : 'owned';
  if (!title) return NextResponse.json({ error: 'Enter a comic title.' }, { status: 400 });

  const baseId = createSlug(title) || 'comic';
  const existingIds = new Set(comics.map((comic) => comic.id));
  const database = await getWritingDatabase();
  let id = baseId;
  let suffix = 2;
  while (existingIds.has(id) || await database.collection('comics').findOne({ id })) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  const comic = {
    id,
    title,
    category: cleanText(body.category, 100) || 'Collected Editions',
    description: cleanText(body.description, 600),
    year: cleanText(body.year, 40),
    writers: cleanText(body.writers, 300),
    artists: cleanText(body.artists, 300),
    collects: cleanText(body.collects, 600),
    read,
    status,
    universe,
    custom: true,
    createdAt: new Date().toISOString(),
  };
  await database.collection('comics').insertOne(comic);
  return NextResponse.json({ comic }, { status: 201 });
}
