'use client';

import type { FantasyPlayer } from '@/types/fantasy';
import { PlayerListView } from './PlayerListView';

export function OverallView({ players, unlocked, onReorder, onCommit }: {
  players: FantasyPlayer[];
  unlocked: boolean;
  onReorder: (next: FantasyPlayer[]) => void;
  onCommit: () => void;
}) {
  return <PlayerListView players={players} draggable={unlocked} onReorder={onReorder} onCommit={onCommit} />;
}
