import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync('src/data/comics.ts', 'utf8');
const comics = [...source.matchAll(/\{ id: '([^']+)', title: '([^']+)'(?:, creators: '([^']+)')?/g)]
  .map((match) => ({ id: match[1], title: match[2], creators: match[3] || '' }));
const existing = new Map(
  [...source.matchAll(/^\s*['"]?([a-z0-9-]+)['"]?:\s*'(https:[^']+)'/gm)]
    .map((match) => [match[1], match[2]]),
);
const outputDirectory = 'public/images/comics';

fs.mkdirSync(outputDirectory, { recursive: true });

function normalize(value) {
  return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim();
}

function matchScore(comic, result) {
  const title = normalize(comic.title);
  const resultTitle = normalize(result.title || '');
  const coreTitle = title
    .replace(/\b(the|complete|collection|omnibus|volume|vol)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const firstCreatorName = normalize(comic.creators).split(' ')[0];
  let score = title === resultTitle ? 120 : 0;

  if (resultTitle.includes(coreTitle) || coreTitle.includes(resultTitle)) score += 50;
  for (const word of coreTitle.split(' ').filter((item) => item.length > 3)) {
    if (resultTitle.includes(word)) score += 3;
  }
  if (
    firstCreatorName
    && normalize((result.author_name || []).join(' ')).includes(firstCreatorName)
  ) score += 12;
  return score;
}

async function download(url, file) {
  try {
    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) return false;
    const contents = Buffer.from(await response.arrayBuffer());
    if (contents.length < 8000) return false;
    fs.writeFileSync(file, contents);
    return true;
  } catch {
    return false;
  }
}

const report = [];

for (const [index, comic] of comics.entries()) {
  const file = path.join(outputDirectory, `${comic.id}.jpg`);
  let downloaded = false;
  let sourceTitle = '';

  if (existing.has(comic.id)) {
    downloaded = await download(existing.get(comic.id), file);
    if (downloaded) sourceTitle = 'existing catalog URL';
  }

  if (!downloaded) {
    const query = new URLSearchParams({
      q: comic.title,
      limit: '20',
      fields: 'title,author_name,cover_i,isbn',
    });
    let results = [];

    try {
      const response = await fetch(`https://openlibrary.org/search.json?${query}`);
      results = (await response.json()).docs || [];
    } catch {
      results = [];
    }

    const choices = results
      .map((result) => ({ result, score: matchScore(comic, result) }))
      .sort((left, right) => right.score - left.score);

    for (const { result, score } of choices) {
      if (score < 12) break;
      const urls = [];
      if (result.cover_i) {
        urls.push(`https://covers.openlibrary.org/b/id/${result.cover_i}-L.jpg`);
      }
      for (const isbn of (result.isbn || []).filter((value) => value.length === 10).slice(0, 4)) {
        urls.push(`https://images-na.ssl-images-amazon.com/images/P/${isbn}.01.LZZZZZZZ.jpg`);
      }
      for (const url of urls) {
        if (await download(url, file)) {
          downloaded = true;
          sourceTitle = `${result.title} (${score})`;
          break;
        }
      }
      if (downloaded) break;
    }
  }

  report.push({ id: comic.id, downloaded, sourceTitle });
  console.log(
    `${String(index + 1).padStart(2, '0')}/${comics.length} `
    + `${downloaded ? 'OK  ' : 'MISS'} ${comic.id}`
    + `${sourceTitle ? ` <- ${sourceTitle}` : ''}`,
  );
}

fs.writeFileSync('/tmp/comic-download-report.json', JSON.stringify(report, null, 2));
console.log(`Downloaded ${report.filter((item) => item.downloaded).length} of ${report.length}.`);
