import { NextResponse } from 'next/server';
import { FIDELITY, labelTexts, MAX_CATEGORIES, MAX_CONTEXT_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH, MIN_CATEGORIES, type Category } from '@/lib/bulk-label';
import { createJevDecider } from '@/lib/jev';
import { isPonderAuthenticated } from '@/lib/ponder-auth';
import { clientAddress, createBudget } from '@/lib/rate-limit';
import { readJsonBody } from '@/lib/read-json-body';

export const maxDuration = 300;

/** Most rows in one request. The page sends a big file as many requests. */
export const MAX_ROWS_PER_REQUEST = 500;
/** Most rows that one address can label in one hour. Each row costs Jev tokens, so this protects the key. */
const ROWS_PER_HOUR = 60_000;
const spendRows = createBudget(ROWS_PER_HOUR, 60 * 60_000);

function readCategories(value: unknown): Category[] | string {
  if (!Array.isArray(value)) return 'Send a list of categories.';
  if (value.length < MIN_CATEGORIES || value.length > MAX_CATEGORIES) return `Use ${MIN_CATEGORIES} to ${MAX_CATEGORIES} categories.`;
  const seen = new Set<string>();
  const categories: Category[] = [];
  for (const entry of value) {
    const name = typeof entry?.name === 'string' ? entry.name.trim() : '';
    const description = typeof entry?.description === 'string' ? entry.description.trim() : '';
    if (!name || name.length > MAX_NAME_LENGTH || description.length > MAX_DESCRIPTION_LENGTH) return 'A category has an invalid name or description.';
    if (seen.has(name.toLowerCase())) return `The category "${name}" appears twice.`;
    seen.add(name.toLowerCase());
    categories.push({ name, description });
  }
  return categories;
}

/** Label a group of rows. The page sends a large file as many groups. */
export async function POST(request: Request) {
  if (!(await isPonderAuthenticated())) return NextResponse.json({ error: 'Enter the Ponder password first.' }, { status: 401 });

  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Jev is not set up on this server.' }, { status: 503 });

  const body = await readJsonBody(request);
  if (!body || !Array.isArray(body.rows) || !body.rows.every((row) => typeof row === 'string')) {
    return NextResponse.json({ error: 'Send "rows" as a list of text.' }, { status: 400 });
  }
  const rows = body.rows as string[];
  if (rows.length === 0 || rows.length > MAX_ROWS_PER_REQUEST) {
    return NextResponse.json({ error: `Send 1 to ${MAX_ROWS_PER_REQUEST} rows in each request.` }, { status: 400 });
  }
  const categories = readCategories(body.categories);
  if (typeof categories === 'string') return NextResponse.json({ error: categories }, { status: 400 });

  const batchSize = Math.min(30, Math.max(1, Math.round(Number(body.batchSize) || FIDELITY[1].batchSize)));
  const context = typeof body.context === 'string' ? body.context.trim().slice(0, MAX_CONTEXT_LENGTH) : '';

  if (!spendRows(clientAddress(request), rows.length)) {
    return NextResponse.json({ error: `This is more than ${ROWS_PER_HOUR.toLocaleString()} rows in one hour. Wait and try again.` }, { status: 429 });
  }

  const usage = { inputTokens: 0, outputTokens: 0 };
  const decide = createJevDecider(apiKey, {
    onUsage: (tokens) => {
      usage.inputTokens += tokens.inputTokens;
      usage.outputTokens += tokens.outputTokens;
    },
  });

  try {
    const { results, retried } = await labelTexts(decide, rows, categories, { batchSize, context });
    return NextResponse.json({ results, retried, usage });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'The run failed.' }, { status: 502 });
  }
}
