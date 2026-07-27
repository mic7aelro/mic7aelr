import { NextResponse } from 'next/server';
import { amazonCover, searchComics, toIsbn10 } from '@/lib/comic-lookup';
import { getComics } from '@/lib/comics-data';
import { getWritingDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/writing-auth';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Reduce a title to letters and digits, for a safe comparison. */
function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Read a volume number, so volume 3 never matches volume 5. */
function volumeOf(value: string) {
  const match = value.match(/\b(?:vol|volume|book|season|tome|part)\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}

const ignoredWords = new Set(['the', 'a', 'an', 'of', 'and', 'by', 'vol', 'volume', 'book', 'complete', 'collection']);

function tokens(value: string) {
  return new Set(normalize(value).split(' ').filter((word) => word && !ignoredWords.has(word)));
}

/**
 * Decide whether a search result names the same book.
 * A loose rule attaches the wrong link, and a wrong link is worse than no
 * link, so every test below must pass.
 */
function titlesMatch(wanted: string, found: string) {
  const left = normalize(wanted);
  const right = normalize(found);
  if (!left || !right) return false;
  if (left === right) return true;

  // A volume number must agree. One title carrying a number and the other
  // carrying none means the edition differs.
  if (volumeOf(wanted) !== volumeOf(found)) return false;

  // The titles must be close in length, which rejects a title that merely
  // contains the other, such as "Miles Morales" against every volume.
  const ratio = Math.min(left.length, right.length) / Math.max(left.length, right.length);
  if (ratio < 0.72) return false;

  // Every meaningful word of each title must appear in the other.
  const leftWords = tokens(wanted);
  const rightWords = tokens(found);
  if (!leftWords.size || !rightWords.size) return false;
  for (const word of leftWords) if (!rightWords.has(word)) return false;
  for (const word of rightWords) if (!leftWords.has(word)) return false;
  return true;
}

/**
 * Confirm that the result shares a creator with the comic.
 * Open Library does not know the publisher, so a common title such as
 * "Annihilation" can return a different book. A shared surname prevents that.
 */
function creatorsMatch(comic: { creators?: string; writers?: string; artists?: string }, authors: string) {
  const mine = new Set(
    normalize([comic.creators, comic.writers, comic.artists].filter(Boolean).join(' '))
      .split(' ')
      .filter((word) => word.length > 2),
  );
  if (!mine.size) return false;
  return normalize(authors).split(' ').some((word) => word.length > 2 && mine.has(word));
}

const preferredPublishers = ['dc comics', 'dc', 'marvel', 'marvel comics', 'marvel worldwide',
  'vertigo', 'image comics', 'dark horse', 'titan books', 'abrams'];
const foreignPublishers = ['panini', 'urban comics', 'ecc', 'planeta', 'norma', 'semic', 'glenat', 'salvat'];

/**
 * An ISBN-10 starting with 0 or 1 belongs to the English registration group.
 * 2 is French and 3 is German, so those editions carry a cover in that
 * language and must not become the link.
 */
function isEnglishIsbn(isbn10: string) {
  return /^[01]/.test(isbn10);
}

/** Rank a result so an English edition from the original publisher wins. */
function publisherRank(publisher: string) {
  const name = publisher.toLowerCase();
  if (foreignPublishers.some((item) => name.includes(item))) return 2;
  if (preferredPublishers.some((item) => name.includes(item))) return 0;
  return 1;
}

/**
 * Find a purchase link for a comic that holds none.
 * The route works on a slice, because a full scan of the collection exceeds
 * one request.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  // A dry run reports the matches and writes nothing.
  const dryRun = body.dryRun === true;
  // Scan a slice, because a full scan of every comic exceeds the request time.
  const offset = Number.isFinite(Number(body.offset)) ? Math.max(0, Number(body.offset)) : 0;
  const limit = Number.isFinite(Number(body.limit)) ? Math.min(40, Math.max(1, Number(body.limit))) : 25;

  const allComics = await getComics();
  const comics = allComics.slice(offset, offset + limit);
  const database = await getWritingDatabase();
  const collection = database.collection('comics');

  const report = {
    linked: 0,
    linkSkipped: 0,
    scanned: comics.length,
    total: allComics.length,
    nextOffset: offset + comics.length,
    done: offset + comics.length >= allComics.length,
    dryRun,
    matches: [] as Array<{ title: string; matched: string; isbn: string }>,
    skipped: [] as string[],
  };

  for (const comic of comics) {
    if (comic.link) continue;

    await wait(300);
    try {
      const hit = (await searchComics(comic.title))
        // A foreign edition would show a cover in another language, so drop it.
        .filter((item) => publisherRank(item.publisher) < 2)
        .filter((item) => titlesMatch(comic.title, item.title) && creatorsMatch(comic, item.authors))
        .sort((left, right) => publisherRank(left.publisher) - publisherRank(right.publisher))[0];

      const isbn10 = hit ? toIsbn10(hit.isbn) : '';
      if (!hit || !isbn10 || !isEnglishIsbn(isbn10)) {
        report.linkSkipped += 1;
        report.skipped.push(comic.title);
        continue;
      }

      report.matches.push({ title: comic.title, matched: hit.title, isbn: isbn10 });
      report.linked += 1;
      if (dryRun) continue;

      const update: Record<string, string> = {
        link: `https://www.amazon.com/dp/${isbn10}`,
        updatedAt: new Date().toISOString(),
      };
      // Keep a cover that already works; only fill an empty one.
      if (!comic.cover) update.cover = amazonCover(isbn10);
      await collection.updateOne(
        { id: comic.id },
        { $set: update, $setOnInsert: { id: comic.id, custom: false } },
        { upsert: true },
      );
    } catch {
      report.linkSkipped += 1;
      report.skipped.push(comic.title);
    }
  }

  return NextResponse.json(report);
}
