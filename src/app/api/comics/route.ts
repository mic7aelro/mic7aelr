import { NextResponse } from 'next/server';
import { comics, type ComicStatus } from '@/data/comics';
import { amazonCover, extractIsbn } from '@/lib/comic-lookup';
import { editableFields, getComics } from '@/lib/comics-data';
import { getWritingDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/writing-auth';
import { cleanText, createSlug } from '@/lib/writing-utils';

/** Render the collection as a Markdown table, for a chat or a note. */
function toMarkdown(list: Awaited<ReturnType<typeof getComics>>, universe: string | null) {
  const label = universe === 'dc' ? 'DC' : universe === 'marvel' ? 'Marvel' : 'DC and Marvel';
  const cell = (value?: string) => (value || '').replaceAll('|', '\\|').replaceAll('\n', ' ');
  const lines = [
    `# Comics — ${label}`,
    '',
    `${list.length} books. ${list.filter((c) => c.read).length} read. `
      + `${list.filter((c) => c.status === 'owned').length} owned. `
      + `${list.filter((c) => c.status === 'wishlist').length} on the wishlist.`,
    '',
    '| Title | Year | Category | Writers | Artists | Collects | Read | Status |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ];
  for (const comic of list) {
    lines.push(`| ${cell(comic.title)} | ${cell(comic.year)} | ${cell(comic.category)} `
      + `| ${cell(comic.writers || comic.creators)} | ${cell(comic.artists)} | ${cell(comic.collects)} `
      + `| ${comic.read ? 'yes' : 'no'} | ${comic.status} |`);
  }
  return lines.join('\n') + '\n';
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const universe = params.get('universe');
  const all = await getComics();
  const list = universe === 'dc' || universe === 'marvel'
    ? all.filter((comic) => (comic.universe ?? 'dc') === universe)
    : all;

  if (params.get('format') === 'md') return new Response(toMarkdown(list, universe), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });

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
  const nextUniverse = body.universe === 'dc' || body.universe === 'marvel' ? body.universe : null;
  const hasMetadata = editableFields.some((field) => field in body) || nextUniverse !== null;
  if (!id || (read === null && status === null && !hasMetadata)) {
    return NextResponse.json({ error: 'Select a valid comic update.' }, { status: 400 });
  }

  const update: Record<string, string | boolean> = { updatedAt: new Date().toISOString() };
  if (read !== null) update.read = read;
  if (status !== null) update.status = status;
  if (nextUniverse !== null) update.universe = nextUniverse;
  for (const field of editableFields) {
    if (!(field in body)) continue;
    const limit = field === 'description' || field === 'collects' ? 600 : 300;
    const value = cleanText(body[field], limit);
    // Only accept an https address for the cover and for the purchase link.
    if ((field === 'cover' || field === 'link') && value && !/^https:\/\//.test(value)) continue;
    update[field] = value;
  }
  // Derive the cover from the purchase link when the cover is empty, so the
  // cover always shows the edition that the link sells.
  if (!update.cover && typeof update.link === 'string' && update.link) {
    const derived = amazonCover(extractIsbn(update.link));
    if (derived) update.cover = derived;
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
  const linkInput = cleanText(body.link, 500);
  const link = /^https:\/\//.test(linkInput) ? linkInput : '';
  let cover = /^https:\/\//.test(coverInput) ? coverInput : '';
  if (!cover && link) cover = amazonCover(extractIsbn(link));

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
    link,
    read,
    status,
    universe,
    custom: true,
    createdAt: new Date().toISOString(),
  };
  await database.collection('comics').insertOne(comic);
  return NextResponse.json({ comic }, { status: 201 });
}
