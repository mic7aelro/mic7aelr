'use client';

import { useEffect, useRef, useState } from 'react';
import type { FantasyPlayer } from '@/types/fantasy';
import { PlayerListView } from './PlayerListView';
import styles from '@/app/fantasyfootball/FantasyFootball.module.css';

const POLL_INTERVAL_MS = 3000;

type ConnectMode = 'league' | 'draft';

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function LiveDraftView({ slug, players, connectedDraftId, unlocked, onConnected }: {
  slug: string;
  players: FantasyPlayer[];
  connectedDraftId: string | null;
  unlocked: boolean;
  onConnected: (leagueId: string | null, draftId: string) => void;
}) {
  const [mode, setMode] = useState<ConnectMode>('draft');
  const [leagueIdInput, setLeagueIdInput] = useState('');
  const [draftIdInput, setDraftIdInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');
  const [draftedIds, setDraftedIds] = useState<Set<string>>(new Set());
  const [hideTaken, setHideTaken] = useState(false);
  const [pollError, setPollError] = useState('');
  const pollingRef = useRef(false);

  useEffect(() => {
    if (!connectedDraftId) return undefined;

    let cancelled = false;

    const poll = async () => {
      if (pollingRef.current) return;
      pollingRef.current = true;
      try {
        const response = await fetch(`/api/fantasyfootball/boards/${slug}/sleeper`);
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) { setPollError(data.error || 'Sleeper could not be reached.'); return; }
        setPollError('');
        setDraftedIds(new Set<string>(data.draftedPlayerIds || []));
      } catch {
        if (!cancelled) setPollError('Sleeper could not be reached.');
      } finally {
        pollingRef.current = false;
      }
    };

    void poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [slug, connectedDraftId]);

  if (!connectedDraftId) {
    return (
      <div className={styles.panel}>
        <h2>Connect a Sleeper draft</h2>
        {unlocked ? (
          <>
            <p>
              Connect a standalone mock draft by its draft ID, or connect a real league and Claude finds its
              current draft for you. Either way, players are marked here as they are picked.
            </p>
            <div className={styles.templateOptions} style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 18 }}>
              <button
                type="button"
                className={classNames(styles.templateOption, mode === 'draft' && styles.templateOptionActive)}
                onClick={() => setMode('draft')}
              >
                Mock draft ID
              </button>
              <button
                type="button"
                className={classNames(styles.templateOption, mode === 'league' && styles.templateOptionActive)}
                onClick={() => setMode('league')}
              >
                League ID
              </button>
            </div>
            <form
              className={styles.form}
              onSubmit={async (event) => {
                event.preventDefault();
                setConnecting(true);
                setConnectError('');
                const body = mode === 'draft' ? { draftId: draftIdInput.trim() } : { leagueId: leagueIdInput.trim() };
                const response = await fetch(`/api/fantasyfootball/boards/${slug}/sleeper`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(body),
                });
                const data = await response.json();
                setConnecting(false);
                if (!response.ok) { setConnectError(data.error || 'That could not be connected.'); return; }
                onConnected(data.sleeperLeagueId, data.sleeperDraftId);
              }}
            >
              {mode === 'draft' ? (
                <label>
                  Sleeper draft ID
                  <input
                    className={styles.field}
                    value={draftIdInput}
                    onChange={(event) => setDraftIdInput(event.target.value)}
                    placeholder="e.g. 918876123456789012"
                    required
                  />
                </label>
              ) : (
                <label>
                  Sleeper league ID
                  <input
                    className={styles.field}
                    value={leagueIdInput}
                    onChange={(event) => setLeagueIdInput(event.target.value)}
                    placeholder="e.g. 918876123456789012"
                    required
                  />
                </label>
              )}
              <button className={styles.button} type="submit" disabled={connecting}>
                {connecting ? 'Connecting…' : 'Connect'}
              </button>
              {connectError && <p className={styles.error}>{connectError}</p>}
            </form>
          </>
        ) : <p>Enter the board PIN to connect a Sleeper draft.</p>}
      </div>
    );
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <label className={styles.toggle}>
          <input type="checkbox" checked={hideTaken} onChange={(event) => setHideTaken(event.target.checked)} />
          Hide drafted players instead of graying them out
        </label>
      </div>
      {pollError && <p className={styles.error}>{pollError}</p>}
      <PlayerListView
        players={players}
        draggable={false}
        onReorder={() => {}}
        takenIds={draftedIds}
        hideTaken={hideTaken}
      />
    </div>
  );
}
