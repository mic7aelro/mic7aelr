'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FantasyBoard, FantasyBoardSummary } from '@/types/fantasy';
import { createCoalescedRunner } from '@/lib/async-queue';
import { PasswordGate } from './PasswordGate';
import { CreateBoardDialog } from './CreateBoardDialog';
import { UnlockDialog } from './UnlockDialog';
import { OverallView } from './OverallView';
import { PositionView } from './PositionView';
import { LiveDraftView } from './LiveDraftView';
import styles from '@/app/fantasyfootball/FantasyFootball.module.css';

type ViewKey = 'overall' | 'position' | 'live';

const VIEWS: Array<[ViewKey, string]> = [
  ['overall', 'Overall board'],
  ['position', 'By position'],
  ['live', 'Live draft'],
];

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function FantasyApp({ initialAuthenticated }: { initialAuthenticated: boolean }) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [boards, setBoards] = useState<FantasyBoardSummary[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [board, setBoard] = useState<FantasyBoard | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [view, setView] = useState<ViewKey>('overall');
  const [showCreate, setShowCreate] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [loadError, setLoadError] = useState('');

  const boardRef = useRef<FantasyBoard | null>(null);
  boardRef.current = board;

  const loadBoards = useCallback(async () => {
    const response = await fetch('/api/fantasyfootball/boards');
    const data = await response.json();
    if (!response.ok) { setLoadError(data.error || 'Boards could not load.'); return; }
    const list = data.boards as FantasyBoardSummary[];
    setBoards(list);
    setSelectedSlug((current) => current ?? list[0]?.slug ?? null);
  }, []);

  useEffect(() => {
    if (authenticated) void loadBoards();
  }, [authenticated, loadBoards]);

  useEffect(() => {
    if (!selectedSlug) { setBoard(null); return undefined; }
    let cancelled = false;
    (async () => {
      const response = await fetch(`/api/fantasyfootball/boards/${selectedSlug}`);
      const data = await response.json();
      if (cancelled) return;
      if (!response.ok) { setLoadError(data.error || 'That board could not load.'); return; }
      setBoard(data.board as FantasyBoard);
      setUnlocked(Boolean(data.unlocked));
    })();
    return () => { cancelled = true; };
  }, [selectedSlug]);

  // Every drag release triggers this. Two saves in flight at once can complete out of
  // order over the network and let a stale one silently overwrite a newer one, so this
  // runner keeps saves to one at a time per board and always sends one final request
  // reflecting whatever the latest state was once the in-flight one finishes.
  const persistOrder = useRef(createCoalescedRunner(async () => {
    const current = boardRef.current;
    if (!current) return;
    await fetch(`/api/fantasyfootball/boards/${current.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ players: current.players }),
    });
  })).current;

  const handleReorder = useCallback((next: FantasyBoard['players']) => {
    setBoard((current) => (current ? { ...current, players: next } : current));
  }, []);

  if (!authenticated) {
    return <div className={styles.shell}><PasswordGate onAuthenticated={() => setAuthenticated(true)} /></div>;
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.brand}>Fantasy Football</span>
          {boards.length > 0 && (
            <select
              className={styles.boardSelect}
              value={selectedSlug ?? ''}
              onChange={(event) => setSelectedSlug(event.target.value)}
            >
              {boards.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
            </select>
          )}
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryButton} type="button" onClick={() => setShowCreate(true)}>Create board</button>
        </div>
      </header>

      <main className={styles.main}>
        {loadError && <p className={styles.error}>{loadError}</p>}

        {!board && boards.length === 0 && (
          <div className={styles.emptyState}>
            <h2>No boards yet</h2>
            <p>Create a board to start a mock draft. Pick a name, a starting template, and a PIN. Anyone who enters the PIN can drag players and connect a Sleeper league.</p>
            <button className={styles.button} type="button" onClick={() => setShowCreate(true)}>Create board</button>
          </div>
        )}

        {!board && boards.length > 0 && <p className={styles.status}>Loading board…</p>}

        {board && (
          <>
            <div className={styles.boardHeader}>
              <div className={styles.boardTitle}>
                <h1>{board.name}</h1>
                <p>{board.template} template · {board.players.length} players</p>
              </div>
              <div className={styles.lockState}>
                {unlocked ? <strong>Unlocked</strong> : <span>Locked</span>}
                {!unlocked && (
                  <button className={styles.secondaryButton} type="button" onClick={() => setShowUnlock(true)}>
                    Enter PIN
                  </button>
                )}
              </div>
            </div>

            <nav className={styles.tabs}>
              {VIEWS.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={classNames(view === key && styles.tabActive)}
                  onClick={() => setView(key)}
                >
                  {label}
                </button>
              ))}
            </nav>

            {view === 'overall' && (
              <OverallView players={board.players} unlocked={unlocked} onReorder={handleReorder} onCommit={persistOrder} />
            )}
            {view === 'position' && (
              <PositionView players={board.players} unlocked={unlocked} onReorder={handleReorder} onCommit={persistOrder} />
            )}
            {view === 'live' && (
              <LiveDraftView
                slug={board.slug}
                players={board.players}
                connectedDraftId={board.connectedDraftId}
                unlocked={unlocked}
                onConnected={(leagueId, draftId) => setBoard((current) => (
                  current ? { ...current, connectedLeagueId: leagueId, connectedDraftId: draftId } : current
                ))}
              />
            )}
          </>
        )}
      </main>

      {showCreate && (
        <CreateBoardDialog
          onClose={() => setShowCreate(false)}
          onCreated={(created) => {
            setShowCreate(false);
            setBoards((current) => [{
              slug: created.slug,
              name: created.name,
              template: created.template,
              playerCount: created.players.length,
              connectedLeagueId: created.connectedLeagueId,
              connectedDraftId: created.connectedDraftId,
              updatedAt: created.updatedAt,
            }, ...current]);
            setBoard(created);
            setSelectedSlug(created.slug);
            setUnlocked(true);
          }}
        />
      )}

      {showUnlock && board && (
        <UnlockDialog
          slug={board.slug}
          boardName={board.name}
          onClose={() => setShowUnlock(false)}
          onUnlocked={() => { setUnlocked(true); setShowUnlock(false); }}
        />
      )}
    </div>
  );
}
