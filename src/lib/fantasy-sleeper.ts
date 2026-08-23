type SleeperDraftSummary = { draft_id: string; status: string; start_time: number | null };
type SleeperDraft = { draft_id: string; league_id: string | null };
type SleeperPick = { player_id: string; pick_no: number };

/** Find the current or most recent draft for a Sleeper league. */
export async function resolveLeagueDraftId(leagueId: string): Promise<string | null> {
  const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/drafts`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Sleeper could not find that league.');

  const drafts = await response.json() as SleeperDraftSummary[];
  if (!Array.isArray(drafts) || drafts.length === 0) return null;

  const mostRecent = [...drafts].sort((a, b) => (b.start_time ?? 0) - (a.start_time ?? 0))[0];
  return mostRecent.draft_id;
}

/** Look up a draft directly by its ID. Used for standalone mock drafts, which have no league. */
export async function resolveDraftById(draftId: string): Promise<{ draftId: string; leagueId: string | null } | null> {
  const response = await fetch(`https://api.sleeper.app/v1/draft/${draftId}`, { cache: 'no-store' });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Sleeper could not find that draft.');

  const draft = await response.json() as SleeperDraft;
  return { draftId: draft.draft_id, leagueId: draft.league_id ?? null };
}

/** Return the Sleeper player IDs already picked in a draft. */
export async function fetchDraftedPlayerIds(draftId: string): Promise<string[]> {
  const response = await fetch(`https://api.sleeper.app/v1/draft/${draftId}/picks`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Sleeper could not load draft picks.');

  const picks = await response.json() as SleeperPick[];
  return picks.map((pick) => pick.player_id).filter(Boolean);
}
