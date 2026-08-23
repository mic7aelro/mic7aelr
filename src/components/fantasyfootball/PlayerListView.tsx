'use client';

import type { FantasyPlayer } from '@/types/fantasy';
import { FANTASY_POSITION_COLORS } from '@/lib/fantasy-order';
import { useDragReorder } from './useDragReorder';
import styles from '@/app/fantasyfootball/FantasyFootball.module.css';

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function GripIcon() {
  return (
    <svg width="12" height="20" viewBox="0 0 12 20" fill="none" aria-hidden="true">
      {[3, 9, 15].map((cy) => (
        <g key={cy}>
          <circle cx="3" cy={cy} r="1.6" fill="currentColor" />
          <circle cx="9" cy={cy} r="1.6" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}

export function PlayerListView({
  players, draggable, onReorder, onCommit, takenIds, hideTaken,
}: {
  players: FantasyPlayer[];
  draggable: boolean;
  onReorder: (next: FantasyPlayer[]) => void;
  onCommit?: () => void;
  takenIds?: Set<string>;
  hideTaken?: boolean;
}) {
  const { draggingId, registerRow, startDrag, handleMove, endDrag } = useDragReorder({
    items: players,
    getId: (player) => player.sleeperId,
    onReorder,
    onCommit,
    disabled: !draggable,
  });

  return (
    <ol className={styles.playerList}>
      {players.map((player, index) => {
        const isTaken = Boolean(takenIds?.has(player.sleeperId));
        if (isTaken && hideTaken) return null;

        return (
          <li
            key={player.sleeperId}
            ref={registerRow(player.sleeperId)}
            className={classNames(
              styles.playerRow,
              draggingId === player.sleeperId && styles.playerRowDragging,
              isTaken && styles.playerRowTaken,
            )}
          >
            <span className={styles.playerRank}>{index + 1}</span>
            <span className={styles.playerName}>{player.name}</span>
            <span className={styles.playerMeta}>
              <span
                className={styles.positionPill}
                style={{
                  backgroundColor: FANTASY_POSITION_COLORS[player.position].background,
                  color: FANTASY_POSITION_COLORS[player.position].text,
                }}
              >
                {player.position}
              </span>
              {player.team && <span className={styles.playerTeam}>{player.team}</span>}
            </span>
            {draggable ? (
              <span
                className={styles.dragHandle}
                onPointerDown={startDrag(player.sleeperId)}
                onPointerMove={handleMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                role="button"
                tabIndex={-1}
                aria-label={`Drag to move ${player.name}`}
              >
                <GripIcon />
              </span>
            ) : <span />}
          </li>
        );
      })}
    </ol>
  );
}
