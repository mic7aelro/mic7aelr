import { NextResponse } from 'next/server';
import { amazonCover, extractIsbn, lookupByIsbn, searchComics } from '@/lib/comic-lookup';
import { isAdmin } from '@/lib/writing-auth';
import { cleanText } from '@/lib/writing-utils';

export async function GET(request: Request) {
  // The lookup is for comic management only. The guard also stops the route
  // from working as an open proxy to Open Library.
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });

  const params = new URL(request.url).searchParams;
  const query = cleanText(params.get('q'), 200);
  if (!query) return NextResponse.json({ error: 'Enter a title, an ISBN, or an Amazon link.' }, { status: 400 });

  try {
    // An Amazon link or an ISBN identifies one edition, so return it directly.
    const isbn = extractIsbn(query);
    if (isbn) {
      const book = await lookupByIsbn(isbn);
      if (book) return NextResponse.json({ kind: 'book', isbn, book });
      // Open Library has no record. A recent release often still has a cover.
      const cover = amazonCover(isbn);
      if (cover) {
        return NextResponse.json({
          kind: 'book',
          isbn,
          book: { title: '', year: '', writers: '', artists: '', cover, pages: '' },
          note: 'Open Library has no record for that ISBN. The cover is available. Enter the other details by hand.',
        });
      }
      return NextResponse.json({ error: 'Open Library has no record for that ISBN.' }, { status: 404 });
    }

    const results = await searchComics(query);
    return NextResponse.json({ kind: 'results', results });
  } catch {
    return NextResponse.json({ error: 'Open Library did not respond. Try again.' }, { status: 502 });
  }
}
