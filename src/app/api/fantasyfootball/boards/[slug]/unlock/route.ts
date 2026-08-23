import { NextResponse } from 'next/server';
import { isSiteAuthenticated, markBoardUnlocked } from '@/lib/fantasy-auth';
import { checkBoardPin } from '@/lib/fantasy-data';
import { readJsonBody } from '@/lib/read-json-body';

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  if (!(await isSiteAuthenticated())) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

  const { slug } = await params;
  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ error: 'The request body was not valid JSON.' }, { status: 400 });
  const pin = typeof body.pin === 'string' ? body.pin.trim() : '';

  const result = await checkBoardPin(slug, pin);

  if (result === 'not-found') return NextResponse.json({ error: 'That board does not exist.' }, { status: 404 });
  if (result === 'locked') {
    return NextResponse.json({ error: 'Too many wrong PINs. Wait 15 minutes and try again.' }, { status: 429 });
  }
  if (result === 'wrong') return NextResponse.json({ error: 'That PIN is not correct.' }, { status: 401 });

  await markBoardUnlocked(slug);
  return NextResponse.json({ unlocked: true });
}
