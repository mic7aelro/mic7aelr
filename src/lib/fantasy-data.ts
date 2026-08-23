import { ObjectId } from 'mongodb';
import { getFantasyDatabase } from './mongodb';
import { hashBoardPin, pinMatchesHash } from './fantasy-auth';
import { applyTemplateOrder, getSleeperPlayerPool } from './fantasy-players';
import { createSlug } from './writing-utils';
import type { FantasyBoard, FantasyBoardSummary, FantasyPlayer, FantasyTemplate } from '@/types/fantasy';

const PIN_MAX_ATTEMPTS = 8;
const PIN_LOCKOUT_MS = 15 * 60 * 1000;

type BoardDocument = {
  _id: ObjectId;
  slug: string;
  name: string;
  template: FantasyTemplate;
  pinHash: string;
  pinAttempts: number;
  pinLockedUntil: number | null;
  players: FantasyPlayer[];
  sleeperLeagueId: string | null;
  sleeperDraftId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toSummary(doc: BoardDocument): FantasyBoardSummary {
  return {
    slug: doc.slug,
    name: doc.name,
    template: doc.template,
    playerCount: doc.players.length,
    connectedLeagueId: doc.sleeperLeagueId,
    connectedDraftId: doc.sleeperDraftId,
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function toBoard(doc: BoardDocument): FantasyBoard {
  return { ...toSummary(doc), players: doc.players };
}

let indexesReady: Promise<void> | null = null;

async function getBoardsCollection() {
  const database = await getFantasyDatabase();
  const collection = database.collection<BoardDocument>('fantasyBoards');

  if (!indexesReady) {
    indexesReady = collection.createIndex({ slug: 1 }, { unique: true }).then(() => undefined).catch((error) => {
      indexesReady = null; // retry on the next call instead of staying permanently broken
      // eslint-disable-next-line no-console -- worth surfacing in server logs even though we don't fail the request over it
      console.error('Could not create the fantasyBoards.slug unique index:', error);
    });
  }
  await indexesReady;

  return collection;
}

export async function listBoards(): Promise<FantasyBoardSummary[]> {
  const collection = await getBoardsCollection();
  const docs = await collection.find().sort({ updatedAt: -1 }).toArray();
  return docs.map(toSummary);
}

export async function getBoardBySlug(slug: string): Promise<FantasyBoard | null> {
  const collection = await getBoardsCollection();
  const doc = await collection.findOne({ slug });
  return doc ? toBoard(doc) : null;
}

async function uniqueSlug(collection: Awaited<ReturnType<typeof getBoardsCollection>>, base: string) {
  let slug = base || 'board';
  let suffix = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await collection.findOne({ slug })) {
    slug = `${base || 'board'}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

function isDuplicateSlugError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
}

const CREATE_RETRY_ATTEMPTS = 5;

/** Create a board seeded from the current Sleeper player pool, ordered by the chosen template. */
export async function createBoard(name: string, template: FantasyTemplate, pin: string): Promise<FantasyBoard> {
  const collection = await getBoardsCollection();
  const pool = await getSleeperPlayerPool();
  const players = applyTemplateOrder(pool, template);
  const base = createSlug(name);
  const now = new Date();
  const pinHash = hashBoardPin(pin);

  // uniqueSlug's own check-then-insert has a gap: two requests can both see a slug as free
  // and both try to claim it. The unique index on slug is what actually prevents that; this
  // retries with a fresh candidate whenever the index rejects a collision instead of failing
  // outright, which is the case that check alone cannot rule out under concurrent creates.
  for (let attempt = 0; attempt < CREATE_RETRY_ATTEMPTS; attempt += 1) {
    const slug = await uniqueSlug(collection, base);
    const doc: BoardDocument = {
      _id: new ObjectId(),
      slug,
      name,
      template,
      pinHash,
      pinAttempts: 0,
      pinLockedUntil: null,
      players,
      sleeperLeagueId: null,
      sleeperDraftId: null,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await collection.insertOne(doc);
      return toBoard(doc);
    } catch (error) {
      if (!isDuplicateSlugError(error) || attempt === CREATE_RETRY_ATTEMPTS - 1) throw error;
    }
  }

  throw new Error('Could not create a unique board slug.');
}

export type PinCheckResult = 'ok' | 'wrong' | 'locked' | 'not-found';

/** Verify a board's PIN, locking it out for a while after repeated wrong guesses. */
export async function checkBoardPin(slug: string, pin: string): Promise<PinCheckResult> {
  const collection = await getBoardsCollection();
  const now = Date.now();

  // Atomically check "not currently locked" and increment the attempt count in the same
  // operation. A plain read-then-write here would let concurrent wrong guesses (fired in
  // parallel by a script, not just one at a time) all read the same stale attempt count and
  // never accumulate to the lockout threshold, defeating the lockout entirely.
  const attempted = await collection.findOneAndUpdate(
    { slug, $or: [{ pinLockedUntil: null }, { pinLockedUntil: { $lte: now } }] },
    { $inc: { pinAttempts: 1 } },
    { returnDocument: 'after' },
  );

  if (!attempted) {
    const exists = await collection.findOne({ slug }, { projection: { _id: 1 } });
    return exists ? 'locked' : 'not-found';
  }

  if (pinMatchesHash(pin, attempted.pinHash)) {
    await collection.updateOne({ _id: attempted._id }, { $set: { pinAttempts: 0, pinLockedUntil: null } });
    return 'ok';
  }

  if (attempted.pinAttempts >= PIN_MAX_ATTEMPTS) {
    await collection.updateOne({ _id: attempted._id }, { $set: { pinLockedUntil: now + PIN_LOCKOUT_MS } });
    return 'locked';
  }

  return 'wrong';
}

/** Replace a board's player order. The caller must confirm the set of players did not change. */
export async function setBoardPlayerOrder(slug: string, players: FantasyPlayer[]) {
  const collection = await getBoardsCollection();
  await collection.updateOne({ slug }, { $set: { players, updatedAt: new Date() } });
}

export async function connectBoardToSleeperLeague(slug: string, leagueId: string | null, draftId: string | null) {
  const collection = await getBoardsCollection();
  await collection.updateOne(
    { slug },
    { $set: { sleeperLeagueId: leagueId, sleeperDraftId: draftId, updatedAt: new Date() } },
  );
}
