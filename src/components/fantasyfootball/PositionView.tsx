'use client';

import type { FantasyPlayer, FantasyPosition } from '@/types/fantasy';
import { FANTASY_POSITION_ORDER, applyPositionReorder } from '@/lib/fantasy-order';
import { PlayerListView } from './PlayerListView';
import styles from '@/app/fantasyfootball/FantasyFootball.module.css';

export function PositionView({ players, unlocked, onReorder, onCommit }: {
  players: FantasyPlayer[];
  unlocked: boolean;
  onReorder: (next: FantasyPlayer[]) => void;
  onCommit: () => void;
}) {
  return (
    <div className={styles.positionGrid}>
      {FANTASY_POSITION_ORDER.map((position: FantasyPosition) => {
        const group = players.filter((player) => player.position === position);
        if (group.length === 0) return null;

        return (
          <div key={position} className={styles.positionColumn}>
            <h2>{position}</h2>
            <PlayerListView
              players={group}
              draggable={unlocked}
              onReorder={(reordered) => onReorder(applyPositionReorder(players, position, reordered))}
              onCommit={onCommit}
            />
          </div>
        );
      })}
    </div>
  );
}
