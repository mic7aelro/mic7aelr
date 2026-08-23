import { NextResponse } from 'next/server';
import { isBoardUnlocked, isSiteAuthenticated } from '@/lib/fantasy-auth';
import { connectBoardToSleeperLeague, getBoardBySlug } from '@/lib/fantasy-data';
import { fetchDraftedPlayerIds, resolveDraftById, resolveLeagueDraftId } from '@/lib/fantasy-sleeper';
import { readJsonBody } from '@/lib/read-json-body';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  if (!(await isSiteAuthenticated())) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

  const { slug } = await params;
  const board = await getBoardBySlug(slug);
  if (!board) return NextResponse.json({ error: 'That board does not exist.' }, { status: 404 });
  if (!board.connectedDraftId) return NextResponse.json({ connected: false, draftedPlayerIds: [] });

  try {
    const draftedPlayerIds = await fetchDraftedPlayerIds(board.connectedDraftId);
    return NextResponse.json({ connected: true, draftedPlayerIds });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Sleeper could not be reached.' }, { status: 502 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  if (!(await isSiteAuthenticated())) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

  const { slug } = await params;
  if (!(await isBoardUnlocked(slug))) {
    return NextResponse.json({ error: 'Enter the board PIN to connect a league.' }, { status: 403 });
  }

  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ error: 'The request body was not valid JSON.' }, { status: 400 });
  const leagueId = typeof body.leagueId === 'string' ? body.leagueId.trim() : '';
  const draftId = typeof body.draftId === 'string' ? body.draftId.trim() : '';
  if (!leagueId && !draftId) return NextResponse.json({ error: 'Enter a Sleeper league ID or draft ID.' }, { status: 400 });

  try {
    if (draftId) {
      const draft = await resolveDraftById(draftId);
      if (!draft) return NextResponse.json({ error: 'That draft ID was not found.' }, { status: 404 });
      await connectBoardToSleeperLeague(slug, draft.leagueId, draft.draftId);
      return NextResponse.json({ sleeperLeagueId: draft.leagueId, sleeperDraftId: draft.draftId });
    }

    const resolvedDraftId = await resolveLeagueDraftId(leagueId);
    if (!resolvedDraftId) return NextResponse.json({ error: 'That league does not have a draft yet.' }, { status: 404 });
    await connectBoardToSleeperLeague(slug, leagueId, resolvedDraftId);
    return NextResponse.json({ sleeperLeagueId: leagueId, sleeperDraftId: resolvedDraftId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Sleeper could not be reached.' }, { status: 502 });
  }
}
