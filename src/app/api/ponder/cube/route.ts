import { NextResponse } from 'next/server';
import { parseAlg } from '@/lib/cube';
import { buildPreset, PRESETS, type PresetId } from '@/lib/cfop-presets';
import { solveCube } from '@/lib/cfop-solve';
import { createJevDecider } from '@/lib/jev';
import { isPonderAuthenticated } from '@/lib/ponder-auth';
import { readJsonBody } from '@/lib/read-json-body';
import { clientAddress, createRateLimiter } from '@/lib/rate-limit';

export const maxDuration = 60;

const MAX_SCRAMBLE_MOVES = 100;
// Each solve can call Jev many times, so limit how often one address can start a solve.
const isRateLimited = createRateLimiter(10, 60_000);

export async function POST(request: Request) {
  if (!(await isPonderAuthenticated())) return NextResponse.json({ error: 'Enter the Ponder password first.' }, { status: 401 });
  if (isRateLimited(clientAddress(request))) {
    return NextResponse.json({ error: 'Too many solves. Wait one minute and try again.' }, { status: 429 });
  }

  const body = await readJsonBody(request);
  if (!body || typeof body.scramble !== 'string') {
    return NextResponse.json({ error: 'Send a JSON body with a "scramble" string.' }, { status: 400 });
  }

  let scramble: string[];
  try {
    scramble = parseAlg(body.scramble);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid scramble.' }, { status: 400 });
  }
  if (scramble.length > MAX_SCRAMBLE_MOVES) {
    return NextResponse.json({ error: `Use at most ${MAX_SCRAMBLE_MOVES} moves.` }, { status: 400 });
  }

  const apiKey = process.env.TYPESAFE_API_KEY;
  const wantsJev = body.useJev !== false;
  const jevEnabled = wantsJev && Boolean(apiKey);

  try {
    const started = Date.now();
    const result = await solveCube(scramble, jevEnabled && apiKey ? createJevDecider(apiKey) : undefined, {
      chooseCross: body.chooseCross !== false,
    });
    return NextResponse.json({
      ...result,
      jev: {
        requested: wantsJev,
        enabled: jevEnabled,
        reason: wantsJev && !apiKey ? 'The server has no TYPESAFE_API_KEY.' : undefined,
        milliseconds: Date.now() - started,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'The solve failed.' }, { status: 500 });
  }
}

/** Build a practice scramble, for example `/api/ponder/cube?preset=coll`. */
export async function GET(request: Request) {
  if (!(await isPonderAuthenticated())) return NextResponse.json({ error: 'Enter the Ponder password first.' }, { status: 401 });
  const preset = new URL(request.url).searchParams.get('preset');
  const known = PRESETS.find((entry) => entry.id === preset);
  if (!known) return NextResponse.json({ error: 'Unknown preset.' }, { status: 400 });
  return NextResponse.json({ scramble: buildPreset(known.id as PresetId).join(' '), keepsCross: known.keepsCross });
}
