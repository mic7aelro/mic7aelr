import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { comics, type ComicStatus } from '@/data/comics';
import { getComics } from '@/lib/comics-data';
import { getWritingDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/writing-auth';
import { cleanText, createSlug } from '@/lib/writing-utils';

type ClaudeComic = {
  title: string;
  category: string;
  description: string;
  year: string;
  writers: string;
  artists: string;
  collects: string;
};

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
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured.' }, { status: 503 });

  const body = await request.json();
  const suppliedTitle = cleanText(body.title, 180);
  const notes = cleanText(body.notes, 2_000);
  const universe = body.universe === 'marvel' ? 'marvel' : 'dc';
  const read = Boolean(body.read);
  const status: ComicStatus = body.status === 'wishlist' ? 'wishlist' : 'owned';
  if (!suppliedTitle) return NextResponse.json({ error: 'Enter a comic title.' }, { status: 400 });

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1_200,
    output_config: {
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            title: { type: 'string' },
            category: { type: 'string' },
            description: { type: 'string' },
            year: { type: 'string' },
            writers: { type: 'string' },
            artists: { type: 'string' },
            collects: { type: 'string' },
          },
          required: ['title', 'category', 'description', 'year', 'writers', 'artists', 'collects'],
        },
      },
    },
    system: `Create accurate catalog metadata for one collected comic book.
Use the exact collected edition in the request.
Write a spoiler-free description of one to three short sentences.
List the publication year or year range.
List the writers and artists separately.
List the exact issues or material in the collected edition.
If a fact is uncertain, state "Not confirmed" for that field. Do not invent a fact.
Use ASD-STE100 Simplified Technical English.`,
    messages: [{
      role: 'user',
      content: `Publisher: ${universe === 'marvel' ? 'Marvel' : 'DC'}\nTitle: ${suppliedTitle}\nAdditional edition notes: ${notes || 'None'}`,
    }],
  });
  const responseText = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');
  let details: ClaudeComic;
  try {
    details = JSON.parse(responseText) as ClaudeComic;
  } catch {
    return NextResponse.json({ error: 'Claude did not return valid comic metadata.' }, { status: 502 });
  }

  const baseId = createSlug(cleanText(details.title, 180) || suppliedTitle) || 'comic';
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
    title: cleanText(details.title, 180) || suppliedTitle,
    category: cleanText(details.category, 100) || 'Collected Editions',
    description: cleanText(details.description, 600),
    year: cleanText(details.year, 40),
    writers: cleanText(details.writers, 300),
    artists: cleanText(details.artists, 300),
    collects: cleanText(details.collects, 600),
    read,
    status,
    universe,
    custom: true,
    createdAt: new Date().toISOString(),
  };
  await database.collection('comics').insertOne(comic);
  return NextResponse.json({ comic }, { status: 201 });
}
