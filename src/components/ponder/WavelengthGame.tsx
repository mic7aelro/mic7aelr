'use client';

import { useEffect, useState, type FormEvent } from 'react';
import styles from '@/app/ponder/Ponder.module.css';
import {
  BANDS,
  MAX_CLUE_LENGTH,
  PACKS,
  pointsFor,
  randomTarget,
  scalesForPack,
  validateClue,
  type Pack,
  type Scale,
} from '@/lib/wavelength';

const ROUNDS = 5;
const MAX_POINTS = BANDS[0].points * ROUNDS;

interface Round {
  scale: Scale;
  target: number;
  clue?: string;
  guess?: number;
  confidence?: number;
  points?: number;
}

function newGame(pack: Pack): Round[] {
  const pool = [...scalesForPack(pack)].sort(() => Math.random() - 0.5);
  return Array.from({ length: ROUNDS }, (_, index) => ({ scale: pool[index % pool.length], target: randomTarget() }));
}

export function WavelengthGame() {
  const [pack, setPack] = useState<Pack>('any');
  const [rounds, setRounds] = useState<Round[]>([]);
  const [current, setCurrent] = useState(0);
  const [clue, setClue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Random content starts in the browser so the server and the browser render the same page.
  useEffect(() => {
    setRounds(newGame('any'));
  }, []);

  function start(nextPack: Pack) {
    setPack(nextPack);
    setRounds(newGame(nextPack));
    setCurrent(0);
    setClue('');
    setError(null);
  }

  const round = rounds[current];
  const revealed = round?.guess !== undefined;
  const finished = current >= ROUNDS;
  const score = rounds.reduce((sum, entry) => sum + (entry.points ?? 0), 0);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!round || busy || revealed) return;
    const problem = validateClue(clue);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/ponder/wavelength', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scaleId: round.scale.id, clue }),
      });
      const data = (await response.json()) as { position?: number; confidence?: number; error?: string };
      if (!response.ok || data.position === undefined) throw new Error(data.error ?? 'Jev failed.');
      const guess = data.position;
      setRounds((list) => list.map((entry, index) => (
        index === current
          ? { ...entry, clue: clue.trim(), guess, confidence: data.confidence, points: pointsFor(entry.target, guess) }
          : entry
      )));
    } catch (problem_) {
      setError(problem_ instanceof Error ? problem_.message : 'Jev failed.');
    } finally {
      setBusy(false);
    }
  }

  function next() {
    setCurrent((value) => value + 1);
    setClue('');
    setError(null);
  }

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Ponder 02</p>
          <h1>Wavelength.</h1>
        </div>
        <div className={styles.heroAside}>
          <p>A hidden target sits on a scale. Write one clue that points at the target. Jev guesses where your clue lands.</p>
          <p>Do not use numbers. The closer Jev lands to the target, the more points you score.</p>
        </div>
      </section>

      <section className={styles.wlBoard}>
        <div className={styles.tabs} role="tablist" aria-label="Pack">
          {PACKS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={entry.id === pack}
              className={entry.id === pack ? styles.tabActive : styles.tab}
              onClick={() => start(entry.id)}
              disabled={busy}
            >
              {entry.label}
            </button>
          ))}
        </div>

        {!round && !finished && <p className={styles.stageHint}>Loading the first round…</p>}

        {round && !finished && (
          <>
            <div className={styles.wlStatus}>
              <span>Round {current + 1} of {ROUNDS}</span>
              <span>Score {score} of {MAX_POINTS}</span>
            </div>

            <p className={styles.wlQuestion}>{round.scale.instructions}</p>

            <Dial round={round} revealed={revealed} />

            {!revealed ? (
              <form className={styles.wlForm} onSubmit={(event) => void submit(event)}>
                <label className={styles.fieldLabel} htmlFor="clue">Your clue</label>
                <div className={styles.wlInputRow}>
                  <input
                    id="clue"
                    className={styles.wlInput}
                    value={clue}
                    onChange={(event) => setClue(event.target.value)}
                    maxLength={MAX_CLUE_LENGTH}
                    placeholder="A character, a place, an item, or a line"
                    autoComplete="off"
                    autoFocus
                    disabled={busy}
                  />
                  <button className={styles.solveButton} type="submit" disabled={busy || clue.trim().length === 0}>
                    {busy ? 'Asking Jev…' : 'Ask Jev'}
                  </button>
                </div>
                <p className={styles.fieldHelp}>Aim at the shaded target. Jev sees only your clue and the scale.</p>
                {error && <p className={styles.fieldError} role="alert">{error}</p>}
              </form>
            ) : (
              <div className={styles.wlResult} aria-live="polite">
                <p>
                  Jev put <strong>“{round.clue}”</strong>{' '}
                  {Math.abs(round.guess! - round.target) < 1
                    ? 'on the target'
                    : `${Math.round(Math.abs(round.guess! - round.target))} points from the target, toward ${round.guess! > round.target ? round.scale.right : round.scale.left}`}.
                  {' '}Jev was {Math.round((round.confidence ?? 0) * 100)}% sure.
                </p>
                <p className={styles.wlPoints}>{round.points} {round.points === 1 ? 'point' : 'points'}</p>
                <button className={styles.solveButton} type="button" onClick={next}>
                  {current + 1 === ROUNDS ? 'See your score' : 'Next round'}
                </button>
              </div>
            )}
          </>
        )}

        {finished && (
          <div className={styles.wlFinal}>
            <p className={styles.eyebrow}>Final score</p>
            <p className={styles.wlTotal}>{score} <small>of {MAX_POINTS}</small></p>
            <ol className={styles.wlHistory}>
              {rounds.map((entry, index) => (
                <li key={index}>
                  <span>{entry.scale.left} to {entry.scale.right}</span>
                  <em>“{entry.clue}”</em>
                  <strong>{entry.points}</strong>
                </li>
              ))}
            </ol>
            <button className={styles.solveButton} type="button" onClick={() => start(pack)}>Play again</button>
          </div>
        )}
      </section>
    </main>
  );
}

interface Zone {
  from: number;
  to: number;
  points: number;
}

/** Split the bands around the target into separate zones that do not overlap. */
function zonesFor(target: number): Zone[] {
  const zones: Zone[] = [];
  let inner = 0;
  for (const band of BANDS) {
    const edges: [number, number][] = inner === 0
      ? [[target - band.reach, target + band.reach]]
      : [[target - band.reach, target - inner], [target + inner, target + band.reach]];
    for (const [from, to] of edges) {
      const clipped = { from: Math.max(0, from), to: Math.min(100, to), points: band.points };
      if (clipped.to > clipped.from) zones.push(clipped);
    }
    inner = band.reach;
  }
  return zones;
}

/** The scale. The shaded zones mark the target. After the guess, a pin shows where Jev landed. */
function Dial({ round, revealed }: { round: Round; revealed: boolean }) {
  return (
    <div className={styles.wlDial}>
      <div className={styles.wlBar}>
        <div className={styles.wlTrack}>
          {zonesFor(round.target).map((zone, index) => (
            <span
              key={index}
              className={styles.wlZone}
              data-points={zone.points}
              style={{ left: `${zone.from}%`, width: `${zone.to - zone.from}%` }}
            >
              {revealed && <em>{zone.points}</em>}
            </span>
          ))}
        </div>
        {revealed && round.guess !== undefined && (
          <div className={styles.wlPinLayer}>
            <span className={styles.wlPin} style={{ left: `${round.guess}%` }}>
              <b>Jev</b>
            </span>
          </div>
        )}
      </div>
      <div className={styles.wlEnds}>
        <span>← {round.scale.left}</span>
        <span>{round.scale.right} →</span>
      </div>
      <p className={styles.wlLegend}>
        The shaded zone is the target. The center scores {BANDS[0].points} points. Each zone away scores one point less.
      </p>
    </div>
  );
}
