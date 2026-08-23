import { NextResponse } from 'next/server';
import {
  clearSiteSession, createSiteSession, fantasyAuthIsConfigured, isSiteAuthenticated, verifySitePassword,
} from '@/lib/fantasy-auth';
import { readJsonBody } from '@/lib/read-json-body';

export async function GET() {
  return NextResponse.json({ authenticated: await isSiteAuthenticated() });
}

export async function POST(request: Request) {
  if (!fantasyAuthIsConfigured()) {
    return NextResponse.json({
      error: 'The page is not configured. Set FANTASY_FOOTBALL_PASSWORD and FANTASY_SESSION_SECRET on the server.',
    }, { status: 503 });
  }

  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ error: 'The request body was not valid JSON.' }, { status: 400 });
  const password = typeof body.password === 'string' ? body.password : '';
  if (!verifySitePassword(password)) {
    return NextResponse.json({ error: 'That password is not correct.' }, { status: 401 });
  }

  await createSiteSession();
  return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
  await clearSiteSession();
  return NextResponse.json({ authenticated: false });
}
