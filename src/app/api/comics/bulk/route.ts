import { NextResponse } from 'next/server';
import { amazonCover, extractIsbn, lookupByIsbn } from '@/lib/comic-lookup';
import { isAdmin } from '@/lib/writing-auth';
import { cleanText } from '@/lib/writing-utils';

type Candidate = {
  link: string;
  isbn: string;
  title: string;
  year: string;
  writers: string;
  artists: string;
  cover: string;
  found: boolean;
  note: string;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Look up several links at once.
 * The lookups run one after another with a pause, because Open Library limits
 * how often one address may call it.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });

  const body = await request.json();
  const raw = cleanText(body.links, 6_000);
  if (!raw) return NextResponse.json({ error: 'Paste at least one link.' }, { status: 400 });

  const all = raw.split(/[\s,]+/).map((line) => line.trim()).filter(Boolean);
  const lines = [...new Set(all)].slice(0, 20);
  const candidates: Candidate[] = [];

  for (const [index, line] of lines.entries()) {
    const isbn = extractIsbn(line);
    const link = /^https?:\/\//.test(line) ? line.replace(/^http:/, 'https:') : '';

    if (!isbn) {
      candidates.push({
        link, isbn: '', title: '', year: '', writers: '', artists: '', cover: '',
        found: false, note: 'That link holds no ISBN. A Kindle link has no ISBN.',
      });
      continue;
    }

    // Pause between calls to stay inside the Open Library rate limit.
    if (index > 0) await wait(350);

    const fallbackLink = link || `https://www.amazon.com/dp/${isbn}`;
    try {
      const book = await lookupByIsbn(isbn);
      if (book) {
        candidates.push({ link: fallbackLink, isbn, ...book, found: true, note: '' });
      } else {
        candidates.push({
          link: fallbackLink, isbn, title: '', year: '', writers: '', artists: '',
          cover: amazonCover(isbn), found: false,
          note: 'Open Library holds no record. The cover is available. Enter the title.',
        });
      }
    } catch {
      candidates.push({
        link: fallbackLink, isbn, title: '', year: '', writers: '', artists: '',
        cover: amazonCover(isbn), found: false, note: 'The lookup failed for this link.',
      });
    }
  }

  return NextResponse.json({ candidates, skipped: Math.max(0, all.length - lines.length) });
}
