import { NextResponse } from 'next/server';
import { comics, type ComicStatus } from '@/data/comics';
import { editableFields, getComics } from '@/lib/comics-data';
import { getWritingDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/writing-auth';
import { cleanText, createSlug } from '@/lib/writing-utils';

export async function GET(request: Request) {
  const universe = new URL(request.url).searchParams.get('universe');
  const all = await getComics();
  const list = universe === 'dc' || universe === 'marvel'
    ? all.filter((comic) => (comic.universe ?? 'dc') === universe)
    : all;

  return NextResponse.json({
    count: list.length,
    universe: universe === 'dc' || universe === 'marvel' ? universe : 'all',
    read: list.filter((comic) => comic.read).length,
    owned: list.filter((comic) => comic.status === 'owned').length,
    wishlist: list.filter((comic) => comic.status === 'wishlist').length,
    comics: list,
    authenticated: await isAdmin(),
  });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const body = await request.json();
  const id = cleanText(body.id, 120);
  const read = typeof body.read === 'boolean' ? body.read : null;
  const status: ComicStatus | null = body.status === 'owned' || body.status === 'wishlist' ? body.status : null;
  const hasMetadata = editableFields.some((field) => field in body);
  if (!id || (read === null && status === null && !hasMetadata)) {
    return NextResponse.json({ error: 'Select a valid comic update.' }, { status: 400 });
  }

  const update: Record<string, string | boolean> = { updatedAt: new Date().toISOString() };
  if (read !== null) update.read = read;
  if (status !== null) update.status = status;
  for (const field of editableFields) {
    if (!(field in body)) continue;
    const limit = field === 'description' || field === 'collects' ? 600 : 300;
    const value = cleanText(body[field], limit);
    // Only accept an https cover address.
    if (field === 'cover' && value && !/^https:\/\//.test(value)) continue;
    update[field] = value;
  }

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
  // Only accept an https cover URL. The lookup supplies an Open Library address.
  const coverInput = cleanText(body.cover, 500);
  const cover = /^https:\/\//.test(coverInput) ? coverInput : '';

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
    cover,
    read,
    status,
    universe,
    custom: true,
    createdAt: new Date().toISOString(),
  };
  await database.collection('comics').insertOne(comic);
  return NextResponse.json({ comic }, { status: 201 });
}
