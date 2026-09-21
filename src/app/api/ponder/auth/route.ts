import { NextResponse } from 'next/server';
import {
  clearPonderSession, createPonderSession, isPonderAuthenticated, ponderAuthIsConfigured, verifyPonderPassword,
} from '@/lib/ponder-auth';
import { clientAddress, createRateLimiter } from '@/lib/rate-limit';
import { readJsonBody } from '@/lib/read-json-body';

// Slow down anyone who guesses the password.
const isRateLimited = createRateLimiter(10, 10 * 60_000);

export async function GET() {
  return NextResponse.json({ authenticated: await isPonderAuthenticated() });
}

export async function POST(request: Request) {
  if (!ponderAuthIsConfigured()) {
    return NextResponse.json({ error: 'Ponder is locked. Set PONDER_PASSWORD on the server.' }, { status: 503 });
  }
  if (isRateLimited(clientAddress(request))) {
    return NextResponse.json({ error: 'Too many tries. Wait a few minutes and try again.' }, { status: 429 });
  }

  const body = await readJsonBody(request);
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!verifyPonderPassword(password)) {
    return NextResponse.json({ error: 'That password is not correct.' }, { status: 401 });
  }

  await createPonderSession();
  return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
  await clearPonderSession();
  return NextResponse.json({ authenticated: false });
}
