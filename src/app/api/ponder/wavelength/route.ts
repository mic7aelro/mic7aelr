import { NextResponse } from 'next/server';
import { createJevDecider } from '@/lib/jev';
import { clientAddress, createRateLimiter } from '@/lib/rate-limit';
import { isPonderAuthenticated } from '@/lib/ponder-auth';
import { readJsonBody } from '@/lib/read-json-body';
import { positionFromScore, SCALES, validateClue } from '@/lib/wavelength';

const isRateLimited = createRateLimiter(30, 60_000);

/** Ask Jev where a clue sits on a scale. */
export async function POST(request: Request) {
  if (!(await isPonderAuthenticated())) return NextResponse.json({ error: 'Enter the Ponder password first.' }, { status: 401 });
  if (isRateLimited(clientAddress(request))) {
    return NextResponse.json({ error: 'Too many guesses. Wait one minute and try again.' }, { status: 429 });
  }

  const body = await readJsonBody(request);
  if (!body || typeof body.scaleId !== 'string' || typeof body.clue !== 'string') {
    return NextResponse.json({ error: 'Send a "scaleId" and a "clue".' }, { status: 400 });
  }
  const scale = SCALES.find((entry) => entry.id === body.scaleId);
  if (!scale) return NextResponse.json({ error: 'This round is out of date. Refresh the page to start a new game.' }, { status: 400 });
  const problem = validateClue(body.clue);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Jev is not set up on this server.' }, { status: 503 });

  try {
    const answers = await createJevDecider(apiKey)({
      stage: 'wavelength',
      state: body.clue.trim(),
      questions: { rating: { type: 'score', instructions: scale.instructions, criteria: [...scale.levels] } },
    });
    const answer = answers?.rating;
    if (!answer || answer.type !== 'score') {
      return NextResponse.json({ error: 'Jev gave no answer. Try another clue.' }, { status: 502 });
    }
    return NextResponse.json({
      position: positionFromScore(answer.score, scale.levels.length),
      confidence: answer.confidence,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Jev failed.' }, { status: 502 });
  }
}
