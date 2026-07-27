#!/usr/bin/env node
/**
 * Fill the purchase link and the Goodreads rating for the comics collection.
 *
 * The server route works on a slice, because a full scan of the collection
 * exceeds one request. This script walks every slice and prints a report.
 *
 * Usage:
 *   node scripts/backfill-comics.mjs                 # dry run, writes nothing
 *   node scripts/backfill-comics.mjs --apply         # writes the results
 *   node scripts/backfill-comics.mjs --apply --base https://www.mic7aelr.com
 *
 * The script reads WRITING_ADMIN_USERNAME and WRITING_ADMIN_PASSWORD from
 * .env.local, or from the environment.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const baseIndex = args.indexOf('--base');
const base = baseIndex >= 0 ? args[baseIndex + 1] : 'http://localhost:3000';
const step = 20;

function readEnvFile() {
  try {
    const text = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    return Object.fromEntries(text.split('\n').filter((line) => line.includes('=')).map((line) => {
      const at = line.indexOf('=');
      return [line.slice(0, at).trim(), line.slice(at + 1).trim().replace(/^["']|["']$/g, '')];
    }));
  } catch {
    return {};
  }
}

const env = { ...readEnvFile(), ...process.env };
const username = env.WRITING_ADMIN_USERNAME;
const password = env.WRITING_ADMIN_PASSWORD;

if (!username || !password) {
  console.error('Set WRITING_ADMIN_USERNAME and WRITING_ADMIN_PASSWORD in .env.local or the environment.');
  process.exit(1);
}

const signIn = await fetch(`${base}/api/writing/auth`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password }),
});
if (!signIn.ok) {
  console.error(`Sign-in failed: ${signIn.status} ${(await signIn.json().catch(() => ({}))).error || ''}`);
  process.exit(1);
}
const cookie = (signIn.headers.getSetCookie?.() || []).map((item) => item.split(';')[0]).join('; ');

console.log(`${apply ? 'APPLY' : 'DRY RUN'} against ${base}\n`);

const totals = { linked: 0, linkSkipped: 0, rated: 0, ratingMissing: 0 };
const matches = [];
const skipped = [];
let offset = 0;
let total = Infinity;

while (offset < total) {
  const response = await fetch(`${base}/api/comics/enrich`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ dryRun: !apply, offset, limit: step }),
  });
  if (!response.ok) {
    console.error(`Slice at ${offset} failed: ${response.status}`);
    break;
  }
  const report = await response.json();
  total = report.total;
  totals.linked += report.linked;
  totals.linkSkipped += report.linkSkipped;
  totals.rated += report.rated;
  totals.ratingMissing += report.ratingMissing;
  matches.push(...(report.matches || []));
  skipped.push(...(report.skipped || []));
  process.stdout.write(`  scanned ${Math.min(report.nextOffset, total)} of ${total}\r`);
  offset = report.nextOffset;
  if (report.done) break;
}

console.log(`  scanned ${total} of ${total}    \n`);

if (matches.length) {
  console.log(`LINKS ${apply ? 'SET' : 'PROPOSED'} (${matches.length}):`);
  for (const item of matches) {
    console.log(`  ${item.title.slice(0, 46).padEnd(48)} ${item.isbn}  (${item.matched.slice(0, 34)})`);
  }
  console.log();
}

if (skipped.length) {
  console.log(`NO CONFIDENT MATCH (${skipped.length}) — add these by hand:`);
  for (const title of skipped) console.log(`  ${title}`);
  console.log();
}

console.log(`links ${apply ? 'set' : 'proposed'}: ${totals.linked}`);
console.log(`links skipped:  ${totals.linkSkipped}`);
console.log(`ratings ${apply ? 'set' : 'found'}: ${totals.rated}`);
console.log(`ratings missing: ${totals.ratingMissing}`);
if (!apply) console.log('\nNothing was written. Re-run with --apply once the matches look right.');
