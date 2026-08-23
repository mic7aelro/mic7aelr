import { getFantasyDatabase } from './mongodb';
import type { FantasyPlayer, FantasyPosition, FantasyTemplate } from '@/types/fantasy';

const FANTASY_POSITIONS: FantasyPosition[] = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
const POOL_SIZE = 220;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type SleeperPlayer = {
  player_id: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  position?: string | null;
  team?: string | null;
  active?: boolean;
  search_rank?: number | null;
};

type PlayerPoolCache = { _id: 'sleeperPlayerPool'; players: FantasyPlayer[]; fetchedAt: number };

function playerName(player: SleeperPlayer): string {
  if (player.full_name) return player.full_name;
  if (player.position === 'DEF') return `${player.team ?? player.player_id} Defense`;
  const parts = [player.first_name, player.last_name].filter(Boolean);
  return parts.length ? parts.join(' ') : player.player_id;
}

// Sleeper's search_rank reflects overall player popularity across every format on their
// app, including superflex and dynasty leagues where quarterbacks are valued far higher
// than in a standard single-QB redraft league. Left alone, that puts QBs like Josh Allen
// in the top 5 overall, which does not match how most single-QB leagues actually draft.
// This shifts positions down by roughly how many picks later they tend to go in that
// more common format, so the starting board is usable out of the box.
const REDRAFT_POSITION_OFFSET: Partial<Record<FantasyPosition, number>> = { QB: 40, TE: 6 };

/** Re-sort a Sleeper-search-rank-ordered pool toward standard single-QB redraft value. */
export function applyRedraftOrder(players: FantasyPlayer[]): FantasyPlayer[] {
  return players
    .map((player, index) => ({ player, key: index + (REDRAFT_POSITION_OFFSET[player.position] ?? 0) }))
    .sort((a, b) => a.key - b.key)
    .map(({ player }) => player);
}

async function fetchSleeperPlayerPool(): Promise<FantasyPlayer[]> {
  const response = await fetch('https://api.sleeper.app/v1/players/nfl');
  if (!response.ok) throw new Error('Sleeper did not return the player list.');
  const data = await response.json() as Record<string, SleeperPlayer>;

  const ranked: Array<FantasyPlayer & { rank: number }> = [];
  const unranked: FantasyPlayer[] = [];

  for (const player of Object.values(data)) {
    const position = player.position as FantasyPosition;
    if (!FANTASY_POSITIONS.includes(position)) continue;
    // Sleeper keeps some retired players marked active for historical lookups. A player with
    // no current team is not on an NFL roster, so exclude them from the fantasy pool.
    if (position !== 'DEF' && (player.active !== true || !player.team)) continue;

    const entry: FantasyPlayer = {
      sleeperId: player.player_id,
      name: playerName(player),
      position,
      team: player.team ?? null,
    };

    if (typeof player.search_rank === 'number') {
      ranked.push({ ...entry, rank: player.search_rank });
    } else if (position === 'DEF') {
      unranked.push(entry);
    }
  }

  ranked.sort((a, b) => a.rank - b.rank);
  unranked.sort((a, b) => (a.team ?? '').localeCompare(b.team ?? ''));

  const redraftOrdered = applyRedraftOrder(ranked.map(({ rank, ...player }) => player));

  return [...redraftOrdered, ...unranked].slice(0, POOL_SIZE);
}

/** Return the top fantasy-relevant players, ordered by Sleeper's default rank. Cached in Mongo for one day. */
export async function getSleeperPlayerPool(): Promise<FantasyPlayer[]> {
  const database = await getFantasyDatabase();
  const collection = database.collection<PlayerPoolCache>('fantasyPlayerCache');
  const cached = await collection.findOne({ _id: 'sleeperPlayerPool' });

  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.players;

  try {
    const players = await fetchSleeperPlayerPool();
    await collection.updateOne(
      { _id: 'sleeperPlayerPool' },
      { $set: { players, fetchedAt: Date.now() } },
      { upsert: true },
    );
    return players;
  } catch (error) {
    if (cached) return cached.players;
    throw error;
  }
}

// Small additional offsets layered on top of the redraft-adjusted base order above, to give
// each template a slightly different starting shape. These do not come from live ESPN or
// CBS rankings and will drift out of date. Drag players to match your own rankings after
// you create the board.
const TEMPLATE_POSITION_OFFSET: Record<Exclude<FantasyTemplate, 'sleeper'>, Partial<Record<FantasyPosition, number>>> = {
  espn: { QB: 5, TE: -8 },
  cbs: { RB: -4, WR: 4, TE: -4, QB: 6 },
};

/** Apply a template's starting sort order to a Sleeper-ranked player pool. */
export function applyTemplateOrder(players: FantasyPlayer[], template: FantasyTemplate): FantasyPlayer[] {
  if (template === 'sleeper') return players;

  const offsets = TEMPLATE_POSITION_OFFSET[template];
  return players
    .map((player, index) => ({ player, key: index + (offsets[player.position] ?? 0) }))
    .sort((a, b) => a.key - b.key)
    .map(({ player }) => player);
}
