import { NextResponse } from 'next/server';
import { getWritingDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/writing-auth';
import { cleanText } from '@/lib/writing-utils';

type Snapshot = Record<'group' | 'area' | 'post' | 'editPost', Record<string, string>>;
type DraftDocument = { owner: string; snapshot: Snapshot; undoStack: Snapshot[]; updatedAt: string };

const fieldLimits: Record<string, number> = {
  name: 160,
  description: 2_000,
  groupId: 50,
  areaId: 50,
  draftPostId: 50,
  title: 160,
  excerpt: 400,
  body: 30_000,
  storyRating: 10,
  directionRating: 10,
  actingRating: 10,
  cinematographyRating: 10,
  musicAndSoundRating: 10,
};

function cleanSection(value: unknown) {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(Object.entries(value).flatMap(([key, item]) => {
    const limit = fieldLimits[key];
    return limit ? [[key, cleanText(item, limit)]] : [];
  }));
}

function cleanSnapshot(value: unknown): Snapshot {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return { group: cleanSection(source.group), area: cleanSection(source.area), post: cleanSection(source.post), editPost: cleanSection(source.editPost) };
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const database = await getWritingDatabase();
  const draft = await database.collection<DraftDocument>('writing_drafts').findOne({ owner: 'author' });
  return NextResponse.json({ snapshot: draft?.snapshot || null, undoCount: Array.isArray(draft?.undoStack) ? draft.undoStack.length : 0, updatedAt: draft?.updatedAt || null });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const body = await request.json();
  const snapshot = cleanSnapshot(body.snapshot);
  const revision = body.revision ? cleanSnapshot(body.revision) : null;
  const database = await getWritingDatabase();
  const update = revision
    ? { $set: { snapshot, updatedAt: new Date().toISOString() }, $push: { undoStack: { $each: [revision], $slice: -30 } } }
    : { $set: { snapshot, updatedAt: new Date().toISOString() } };
  await database.collection<DraftDocument>('writing_drafts').updateOne({ owner: 'author' }, update, { upsert: true });
  return NextResponse.json({ saved: true });
}

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const database = await getWritingDatabase();
  const draft = await database.collection<DraftDocument>('writing_drafts').findOne({ owner: 'author' });
  const undoStack = Array.isArray(draft?.undoStack) ? draft.undoStack : [];
  const snapshot = undoStack.at(-1);
  if (!snapshot) return NextResponse.json({ error: 'There is no Claude change to undo.' }, { status: 409 });
  await database.collection<DraftDocument>('writing_drafts').updateOne(
    { owner: 'author' },
    { $set: { snapshot, undoStack: undoStack.slice(0, -1), updatedAt: new Date().toISOString() } },
  );
  return NextResponse.json({ snapshot });
}
