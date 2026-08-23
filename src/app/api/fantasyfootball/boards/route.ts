import { NextResponse } from 'next/server';
import { isSiteAuthenticated, markBoardUnlocked } from '@/lib/fantasy-auth';
import { createBoard, listBoards } from '@/lib/fantasy-data';
import { isFantasyConfigured } from '@/lib/mongodb';
import { readJsonBody } from '@/lib/read-json-body';
import { cleanText } from '@/lib/writing-utils';
import type { FantasyTemplate } from '@/types/fantasy';

const TEMPLATES: FantasyTemplate[] = ['sleeper', 'espn', 'cbs'];
const PIN_PATTERN = /^\d{4,8}$/;

export async function GET() {
  if (!(await isSiteAuthenticated())) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  if (!isFantasyConfigured()) return NextResponse.json({ boards: [] });

  const boards = await listBoards();
  return NextResponse.json({ boards });
}

export async function POST(request: Request) {
  if (!(await isSiteAuthenticated())) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  if (!isFantasyConfigured()) return NextResponse.json({ error: 'MONGODB_URI is not configured.' }, { status: 503 });

  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ error: 'The request body was not valid JSON.' }, { status: 400 });
  const name = cleanText(body.name, 60);
  const template = TEMPLATES.includes(body.template as FantasyTemplate) ? body.template as FantasyTemplate : null;
  const pin = typeof body.pin === 'string' ? body.pin.trim() : '';

  if (!name) return NextResponse.json({ error: 'Enter a name for the board.' }, { status: 400 });
  if (!template) return NextResponse.json({ error: 'Choose a starting template.' }, { status: 400 });
  if (!PIN_PATTERN.test(pin)) return NextResponse.json({ error: 'The PIN must be 4 to 8 digits.' }, { status: 400 });

  const board = await createBoard(name, template, pin);
  await markBoardUnlocked(board.slug);

  return NextResponse.json({ board }, { status: 201 });
}
