import { NextResponse } from 'next/server';
import { isBoardUnlocked, isSiteAuthenticated } from '@/lib/fantasy-auth';
import { getBoardBySlug, setBoardPlayerOrder } from '@/lib/fantasy-data';
import { reorderFromTrustedRecords } from '@/lib/fantasy-order';
import { readJsonBody } from '@/lib/read-json-body';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  if (!(await isSiteAuthenticated())) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

  const { slug } = await params;
  const board = await getBoardBySlug(slug);
  if (!board) return NextResponse.json({ error: 'That board does not exist.' }, { status: 404 });

  return NextResponse.json({ board, unlocked: await isBoardUnlocked(slug) });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!(await isSiteAuthenticated())) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

  const { slug } = await params;
  if (!(await isBoardUnlocked(slug))) {
    return NextResponse.json({ error: 'Enter the board PIN to edit it.' }, { status: 403 });
  }

  const board = await getBoardBySlug(slug);
  if (!board) return NextResponse.json({ error: 'That board does not exist.' }, { status: 404 });

  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ error: 'The request body was not valid JSON.' }, { status: 400 });
  const reordered = reorderFromTrustedRecords(board.players, body.players);
  if (!reordered) {
    return NextResponse.json({ error: 'The player order did not match the board.' }, { status: 400 });
  }

  await setBoardPlayerOrder(slug, reordered);
  return NextResponse.json({ ok: true });
}
