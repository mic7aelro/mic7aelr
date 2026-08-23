import type { FantasyPlayer, FantasyPosition } from '@/types/fantasy';

export const FANTASY_POSITION_ORDER: FantasyPosition[] = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

// QB, RB, WR, and TE match the exact pill colors read from Sleeper's own web app.
// Sleeper does not show a distinct K or DEF pill color anywhere public, so those two
// reuse other colors already present in Sleeper's product (their muted label gray and
// their draft-rank purple) to stay in the same family instead of guessing new ones.
export const FANTASY_POSITION_COLORS: Record<FantasyPosition, { background: string; text: string }> = {
  QB: { background: '#ff2a6d', text: '#131b38' },
  RB: { background: '#28e757', text: '#131b38' },
  WR: { background: '#58a7ff', text: '#131b38' },
  TE: { background: '#ffae58', text: '#131b38' },
  K: { background: '#b7c5d4', text: '#131b38' },
  DEF: { background: '#8c64ff', text: '#131b38' },
};

/** Re-insert a reordered position group back into the full ranked list, keeping other positions in place. */
export function applyPositionReorder(all: FantasyPlayer[], position: FantasyPosition, reordered: FantasyPlayer[]): FantasyPlayer[] {
  let cursor = 0;
  return all.map((player) => (player.position === position ? reordered[cursor++] : player));
}

// Only the ORDER a client sends is trusted, never the player data itself -- otherwise
// someone who knows the board PIN could rewrite a player's name, position, or team by
// submitting a save with the right set of IDs but doctored fields on one of them. This
// rebuilds every entry from the board's own current records, keyed by the submitted order.
export function reorderFromTrustedRecords(current: FantasyPlayer[], submitted: unknown): FantasyPlayer[] | null {
  if (!Array.isArray(submitted) || submitted.length !== current.length) return null;

  const byId = new Map(current.map((player) => [player.sleeperId, player]));
  const submittedIds = submitted.map((entry) => (
    entry && typeof entry === 'object' && typeof (entry as { sleeperId?: unknown }).sleeperId === 'string'
      ? (entry as { sleeperId: string }).sleeperId
      : null
  ));

  if (submittedIds.some((id) => id === null || !byId.has(id))) return null;
  if (new Set(submittedIds).size !== current.length) return null;

  return submittedIds.map((id) => byId.get(id as string)!);
}
