// Book metadata lookup through Open Library. Open Library needs no API key and
// no account, so the server holds no secret for this feature.

const SEARCH_URL = 'https://openlibrary.org/search.json';
const BOOKS_URL = 'https://openlibrary.org/api/books';
const COVER_URL = 'https://covers.openlibrary.org/b/isbn';
// Amazon serves a cover by ISBN. Use it when Open Library has no record, which
// happens with a recent release.
const AMAZON_COVER_URL = 'https://images-na.ssl-images-amazon.com/images/P';

export type ComicCandidate = {
  isbn: string;
  title: string;
  authors: string;
  year: string;
  publisher: string;
  cover: string;
};

export type ComicLookup = {
  title: string;
  year: string;
  writers: string;
  artists: string;
  cover: string;
  pages: string;
};

const writerRoles = ['writer', 'script', 'story', 'author', 'words', 'text'];
const artistRoles = ['illustrator', 'artist', 'penciller', 'penciler', 'pencils', 'inker', 'inks', 'colorist', 'colourist', 'colors', 'colours', 'art'];

function isbn10Checksum(value: string) {
  let total = 0;
  for (let index = 0; index < 9; index += 1) total += Number(value[index]) * (10 - index);
  const check = value[9] === 'X' ? 10 : Number(value[9]);
  return (total + check * 1) % 11 === 0;
}

/**
 * Read an ISBN from an Amazon link, an Open Library link, or a plain ISBN.
 * Amazon book links use the ISBN-10 as the ASIN, so `/dp/1401207529` is an ISBN.
 * A Kindle ASIN starts with `B` and is not an ISBN, so this returns an empty string.
 */
export function extractIsbn(input: string) {
  const text = input.trim();
  if (!text) return '';

  const fromPath = text.match(/\/(?:dp|gp\/product|product)\/([A-Z0-9]{10})/i)?.[1];
  const candidate = (fromPath || text).replace(/[\s-]/g, '').toUpperCase();

  if (/^97[89][0-9]{10}$/.test(candidate)) return candidate;
  if (/^[0-9]{9}[0-9X]$/.test(candidate) && isbn10Checksum(candidate)) return candidate;
  return '';
}

/** Split an Open Library `by_statement` into writer and artist credits. */
export function parseCredits(statement: string) {
  const writers: string[] = [];
  const artists: string[] = [];

  for (const rawSegment of statement.split(';')) {
    const segment = rawSegment.trim().replace(/\.$/, '');
    if (!segment || /created by/i.test(segment)) continue;

    const parts = segment.split(',').map((part) => part.trim()).filter(Boolean);
    if (parts.length === 0) continue;

    const name = parts[0];
    const role = parts.slice(1).join(' ').toLowerCase();
    if (!name || !role) continue;

    if (writerRoles.some((item) => role.includes(item))) writers.push(name);
    else if (artistRoles.some((item) => role.includes(item))) artists.push(name);
  }

  return { writers: writers.join(', '), artists: artists.join(', ') };
}

function coverFor(isbn: string) {
  return isbn ? `${COVER_URL}/${isbn}-L.jpg` : '';
}

/**
 * Return a cover address that shows a real image.
 * Amazon answers quickly and holds a cover for a recent release, so it comes
 * first. Open Library answers with a blank image and status 200 when it holds
 * no cover, and that check costs several seconds, so it runs only when Amazon
 * cannot serve the ISBN.
 */
export async function resolveCover(isbn: string) {
  if (!isbn) return '';
  const amazon = amazonCover(isbn);
  if (amazon) return amazon;

  try {
    // Bound the wait, because a slow reply must not stall a batch.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2_500);
    const response = await fetch(`${COVER_URL}/${isbn}-L.jpg?default=false`, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (response.ok) return coverFor(isbn);
  } catch {
    // Fall through and report no cover.
  }
  return '';
}

export async function searchComics(query: string): Promise<ComicCandidate[]> {
  const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}&limit=8`
    + '&fields=title,subtitle,author_name,first_publish_year,publisher,isbn';
  const response = await fetch(url, { headers: { 'User-Agent': 'mic7aelr-portfolio/1.0' } });
  if (!response.ok) throw new Error('The book search failed.');
  const data = await response.json() as { docs?: Array<Record<string, unknown>> };

  return (data.docs || []).flatMap((doc) => {
    const isbnList = Array.isArray(doc.isbn) ? doc.isbn as string[] : [];
    // Prefer an ISBN-13, because it identifies the exact modern edition.
    const isbn = isbnList.find((item) => /^97[89]/.test(item)) || isbnList[0] || '';
    if (!isbn) return [];
    const title = [doc.title, doc.subtitle].filter(Boolean).join(': ');
    const publishers = Array.isArray(doc.publisher) ? doc.publisher as string[] : [];
    const authors = Array.isArray(doc.author_name) ? doc.author_name as string[] : [];
    return [{
      isbn,
      title: String(title || 'Untitled'),
      authors: authors.slice(0, 3).join(', '),
      year: doc.first_publish_year ? String(doc.first_publish_year) : '',
      publisher: publishers[0] || '',
      cover: amazonCover(isbn) || coverFor(isbn),
    }];
  });
}

/** Convert a 978 ISBN-13 to the matching ISBN-10. */
export function toIsbn10(isbn: string) {
  if (isbn.length === 10) return isbn;
  if (!/^978[0-9]{10}$/.test(isbn)) return '';
  const core = isbn.slice(3, 12);
  let total = 0;
  for (let index = 0; index < 9; index += 1) total += Number(core[index]) * (10 - index);
  const check = (11 - (total % 11)) % 11;
  return core + (check === 10 ? 'X' : String(check));
}

export function amazonCover(isbn: string) {
  // Amazon indexes the cover by ISBN-10.
  const isbn10 = toIsbn10(isbn);
  return isbn10 ? `${AMAZON_COVER_URL}/${isbn10}.01.LZZZZZZZ.jpg` : '';
}

export async function lookupByIsbn(isbn: string): Promise<ComicLookup | null> {
  const url = `${BOOKS_URL}?bibkeys=ISBN:${encodeURIComponent(isbn)}&format=json&jscmd=data`;
  const response = await fetch(url, { headers: { 'User-Agent': 'mic7aelr-portfolio/1.0' } });
  if (!response.ok) throw new Error('The book lookup failed.');
  const data = await response.json() as Record<string, Record<string, unknown> | undefined>;
  const book = data[`ISBN:${isbn}`];
  if (!book) return null;

  const title = [book.title, book.subtitle].filter(Boolean).join(': ');
  const statement = typeof book.by_statement === 'string' ? book.by_statement : '';
  const credits = parseCredits(statement);
  // Fall back to the author list when the record has no role information.
  const authors = Array.isArray(book.authors)
    ? (book.authors as Array<{ name?: string }>).map((item) => item.name).filter(Boolean).join(', ')
    : '';
  const publishDate = typeof book.publish_date === 'string' ? book.publish_date : '';

  return {
    title: String(title || ''),
    year: publishDate.match(/\d{4}/)?.[0] || '',
    writers: credits.writers || authors,
    artists: credits.artists,
    cover: await resolveCover(isbn),
    pages: book.number_of_pages ? String(book.number_of_pages) : '',
  };
}
