'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { applyAlg, applyMove, parseAlg, randomScramble, SOLVED } from '@/lib/cube';
import type { AreaMoves, DecisionRecord, SolveResult } from '@/lib/cfop-solve';
import styles from '@/app/ponder/Ponder.module.css';
import { AlgCatalog, type CatalogSet } from './AlgCatalog';

const Cube3D = dynamic(() => import('./Cube3D'), {
  ssr: false,
  loading: () => <div className={styles.viewport3d} aria-busy="true" />,
});

type SolveResponse = SolveResult & {
  jev: { requested: boolean; enabled: boolean; reason?: string; milliseconds: number };
};

const PRESETS = [
  { id: 'random', label: 'Random' },
  { id: 'last-layer', label: 'Last layer' },
  { id: 'coll', label: 'COLL' },
  { id: 'winter', label: 'Winter Variation' },
] as const;

const SPEEDS = [
  { label: 'Slow', delay: 700 },
  { label: 'Normal', delay: 320 },
  { label: 'Fast', delay: 110 },
] as const;

const STAGE_LABELS: Record<string, string> = {
  orient: 'Turn', cross: 'Cross', f2l: 'F2L', wv: 'Winter Variation', oll: 'OLL', coll: 'COLL', pll: 'PLL', auf: 'Final turn',
};

const QUALITY_LEVELS = ['Far too long', 'Long', 'Typical', 'Efficient', 'Excellent'];

const AREAS: { key: keyof AreaMoves; label: string; always: boolean }[] = [
  { key: 'cross', label: 'Cross', always: true },
  { key: 'f2l', label: 'F2L', always: true },
  { key: 'oll', label: 'OLL', always: true },
  { key: 'pll', label: 'PLL', always: true },
  { key: 'wv', label: 'Winter Variation', always: false },
  { key: 'coll', label: 'COLL', always: false },
  { key: 'auf', label: 'Final turn', always: false },
];

function tryParse(text: string): { moves: string[]; error?: undefined } | { moves?: undefined; error: string } {
  try {
    return { moves: parseAlg(text) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Invalid scramble.' };
  }
}

export function CubeSolver({ catalog, rejected }: { catalog: CatalogSet[]; rejected: number }) {
  const [scrambleText, setScrambleText] = useState('');
  const [useJev, setUseJev] = useState(true);
  const [chooseCross, setChooseCross] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SolveResponse | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [reduceMotion, setReduceMotion] = useState(false);

  // The first scramble comes from the browser so the server and the browser render the same page.
  useEffect(() => {
    setScrambleText(randomScramble(25).join(' '));
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const parsed = useMemo(() => tryParse(scrambleText), [scrambleText]);
  const scrambled = useMemo(() => (parsed.moves ? applyAlg(SOLVED, parsed.moves) : SOLVED), [parsed]);

  // States after each move of the solution, from the scrambled cube to the final cube.
  const states = useMemo(() => {
    if (!result) return [scrambled];
    const list = [applyAlg(SOLVED, result.scramble)];
    for (const move of result.moves) list.push(applyMove(list[list.length - 1], move));
    return list;
  }, [result, scrambled]);

  const moves = useMemo(() => result?.moves ?? [], [result]);
  const total = moves.length;

  const stepStarts = useMemo(() => {
    let sum = 0;
    return (result?.steps ?? []).map((step) => {
      const start = sum;
      sum += step.moves.length;
      return start;
    });
  }, [result]);

  /** The step that owns the move at this position, counted from 0. */
  const stepAt = useCallback(
    (position: number) => (result?.steps ?? []).findIndex((step, i) => position >= stepStarts[i] && position < stepStarts[i] + step.moves.length),
    [result, stepStarts],
  );

  const turnDuration = reduceMotion ? 0 : Math.min(450, Math.max(90, SPEEDS[speed].delay * 0.85));

  useEffect(() => {
    if (!playing || !result) return undefined;
    if (index >= total) {
      setPlaying(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setIndex((value) => Math.min(total, value + 1)), SPEEDS[speed].delay);
    return () => window.clearTimeout(timer);
  }, [playing, index, total, speed, result]);

  const reset = () => {
    setResult(null);
    setPlaying(false);
    setIndex(0);
  };

  async function applyPreset(id: (typeof PRESETS)[number]['id']) {
    setError(null);
    reset();
    if (id === 'random') {
      setScrambleText(randomScramble(25).join(' '));
      setChooseCross(true);
      return;
    }
    try {
      const response = await fetch(`/api/ponder/cube?preset=${id}`);
      const data = (await response.json()) as { scramble?: string; keepsCross?: boolean; error?: string };
      if (!response.ok || !data.scramble) throw new Error(data.error ?? 'Cannot build the preset.');
      setScrambleText(data.scramble);
      setChooseCross(!data.keepsCross);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Cannot build the preset.');
    }
  }

  async function solve() {
    if (!parsed.moves) {
      setError(parsed.error ?? 'Invalid scramble.');
      return;
    }
    setBusy(true);
    setError(null);
    setPlaying(false);
    try {
      const response = await fetch('/api/ponder/cube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scramble: scrambleText, useJev, chooseCross }),
      });
      const data = (await response.json()) as SolveResponse & { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'The solve failed.');
      setResult(data);
      setIndex(0);
    } catch (problem) {
      setResult(null);
      setError(problem instanceof Error ? problem.message : 'The solve failed.');
    } finally {
      setBusy(false);
    }
  }

  const jump = (position: number) => {
    setPlaying(false);
    setIndex(Math.max(0, Math.min(total, position)));
  };

  // What the player shows: the move just made, where it sits in the solve, and the next move.
  const currentStep = index > 0 ? stepAt(index - 1) : -1;
  const nextStep = index < total ? stepAt(index) : -1;
  const step = result && currentStep >= 0 ? result.steps[currentStep] : null;
  const positionInStep = step ? index - 1 - stepStarts[currentStep] + 1 : 0;

  const jevNote = result && (
    !result.jev.requested
      ? 'Jev is off. The solver used the shortest option at each choice.'
      : !result.jev.enabled
        ? `Jev is unavailable. ${result.jev.reason ?? ''} The solver used the shortest option at each choice.`
        : result.jevFailures.length > 0
          ? `${result.jevFailures.length} of ${result.jevCalls} Jev calls failed. The solver used the shortest option for those choices. ${result.jevFailures[0]}`
          : `${result.jevCalls} Jev calls in ${(result.jev.milliseconds / 1000).toFixed(1)} seconds.`
  );

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Ponder 01</p>
          <h1>CFOP with Jev.</h1>
        </div>
        <div className={styles.heroAside}>
          <p>Enter a scramble. Code solves the cube with CFOP. Jev makes the choices that have no single right answer.</p>
        </div>
      </section>

      <section className={styles.workbench}>
        <div className={styles.stage}>
          <Cube3D states={states} moves={moves} index={result ? index : 0} duration={turnDuration} />

          {result ? (
            <div className={styles.player}>
              <div className={styles.now} aria-live="polite">
                <span className={styles.nowMove}>{index > 0 ? moves[index - 1] : '–'}</span>
                <div className={styles.nowText}>
                  <strong>
                    {index === 0
                      ? 'Ready to start'
                      : index >= total
                        ? 'Solved'
                        : step
                          ? `${STAGE_LABELS[step.stage]} · move ${positionInStep} of ${step.moves.length}`
                          : ''}
                  </strong>
                  {step && index < total && <span>{step.title}</span>}
                  <span>
                    {index < total
                      ? `Next: ${moves[index]}${nextStep !== currentStep ? ` (starts ${result.steps[nextStep].title})` : ''}`
                      : 'No moves left.'}
                  </span>
                </div>
                <span className={styles.nowCount}>{index} / {total}</span>
              </div>

              <ol className={styles.stageBar} aria-label="Stages of the solve">
                {result.steps.map((entry, i) => {
                  if (entry.moves.length === 0) return null;
                  const done = Math.max(0, Math.min(entry.moves.length, index - stepStarts[i]));
                  return (
                    <li key={`${entry.stage}-${i}`} style={{ flexGrow: entry.moves.length }} className={i === currentStep ? styles.stageActive : undefined}>
                      <button type="button" onClick={() => jump(stepStarts[i])} title={`${entry.title} · ${entry.moves.length} moves`}>
                        <span className={styles.stageFill} style={{ width: `${(done / entry.moves.length) * 100}%` }} />
                        <span className={styles.stageName}>{STAGE_LABELS[entry.stage]}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className={styles.playerRow}>
                <button type="button" onClick={() => jump(0)} aria-label="Go to the start" disabled={index === 0}>⏮</button>
                <button type="button" onClick={() => jump(index - 1)} aria-label="Previous move" disabled={index === 0}>◀</button>
                <button
                  type="button"
                  className={styles.playButton}
                  onClick={() => {
                    if (index >= total) setIndex(0);
                    setPlaying((value) => !value);
                  }}
                  aria-label={playing ? 'Pause' : 'Play'}
                >
                  {playing ? '❚❚' : '▶'}
                </button>
                <button type="button" onClick={() => jump(index + 1)} aria-label="Next move" disabled={index >= total}>▶</button>
                <button type="button" onClick={() => jump(total)} aria-label="Go to the end" disabled={index >= total}>⏭</button>
                <div className={styles.speed} role="group" aria-label="Speed">
                  {SPEEDS.map((option, i) => (
                    <button key={option.label} type="button" className={i === speed ? styles.speedActive : undefined} onClick={() => setSpeed(i)}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className={styles.stageHint}>The cube shows your scramble. Drag it to look around. Select Solve to start.</p>
          )}
        </div>

        <div className={styles.controls}>
          <label className={styles.fieldLabel} htmlFor="scramble">Scramble</label>
          <textarea
            id="scramble"
            className={styles.scramble}
            value={scrambleText}
            onChange={(event) => { setScrambleText(event.target.value); reset(); }}
            rows={3}
            spellCheck={false}
            aria-invalid={Boolean(parsed.error)}
            aria-describedby="scramble-help"
          />
          <p id="scramble-help" className={parsed.error ? styles.fieldError : styles.fieldHelp}>
            {parsed.error ?? `${parsed.moves?.length ?? 0} moves. Use standard notation, for example R U R' U2 F.`}
          </p>

          <div className={styles.presets} role="group" aria-label="Scramble presets">
            {PRESETS.map((preset) => (
              <button key={preset.id} type="button" onClick={() => void applyPreset(preset.id)} disabled={busy}>
                {preset.label}
              </button>
            ))}
          </div>

          <label className={styles.toggle}>
            <input type="checkbox" checked={useJev} onChange={(event) => setUseJev(event.target.checked)} />
            <span>Let Jev decide</span>
          </label>

          <button className={styles.solveButton} type="button" onClick={() => void solve()} disabled={busy || Boolean(parsed.error)}>
            {busy ? (useJev ? 'Asking Jev…' : 'Solving…') : 'Solve'}
          </button>
          {error && <p className={styles.fieldError} role="alert">{error}</p>}

          {result && (
            <div className={styles.result}>
              <p className={styles.resultLine}>
                <strong>{result.solved ? 'Solved' : 'Not solved'}</strong> in {result.turnCount} moves
                {result.rotationCount > 0 && ` plus ${result.rotationCount} cube ${result.rotationCount === 1 ? 'rotation' : 'rotations'}`}.
                {result.quality && ` Jev rates it ${QUALITY_LEVELS[Math.min(4, Math.max(0, Math.round(result.quality.score)))].toLowerCase()}.`}
              </p>
              <ul className={styles.areas}>
                {AREAS.filter((area) => area.always || result.areas[area.key] > 0).map((area) => (
                  <li key={area.key}>
                    <span>{area.label}</span>
                    <strong>{result.areas[area.key]}</strong>
                  </li>
                ))}
              </ul>
              <p className={styles.fieldHelp}>{jevNote}</p>
            </div>
          )}
        </div>
      </section>

      {result && (
        <>
          <section className={styles.section} aria-labelledby="solution-title">
            <div className={styles.sectionHead}>
              <h2 id="solution-title">Solution</h2>
              <p>Select a step or a move to jump to it. The cube shows the position after that move.</p>
            </div>
            <ol className={styles.steps}>
              {result.steps.map((entry, i) => (
                <li key={`${entry.stage}-${i}`} className={i === currentStep || (index === 0 && i === nextStep) ? styles.stepActive : styles.step}>
                  <button type="button" onClick={() => jump(stepStarts[i])}>
                    <span className={styles.stageTag}>{STAGE_LABELS[entry.stage]}</span>
                    <span className={styles.stepTitle}>{entry.title}</span>
                    <span className={styles.stepCount}>{entry.moves.length} moves</span>
                  </button>
                  {entry.detail && <p className={styles.stepDetail}>{entry.detail}</p>}
                  <p className={styles.moveList}>
                    {entry.moves.map((move, moveIndex) => {
                      const position = stepStarts[i] + moveIndex + 1;
                      return (
                        <button
                          key={moveIndex}
                          type="button"
                          className={position === index ? styles.moveActive : position < index ? styles.moveDone : styles.move}
                          onClick={() => jump(position)}
                          aria-label={`Go to move ${position}, ${move}`}
                          aria-current={position === index ? 'step' : undefined}
                        >
                          {move}
                        </button>
                      );
                    })}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <details className={styles.fold}>
            <summary>Jev decisions ({result.decisions.length})</summary>
            <p className={styles.foldNote}>Each card is one question. The bars show the probability that Jev gave to each option.</p>
            <div className={styles.decisions}>
              {result.decisions.map((decision, i) => <DecisionCard decision={decision} key={`${decision.id}-${i}`} />)}
            </div>
          </details>
        </>
      )}

      <AlgCatalog catalog={catalog} rejected={rejected} />
    </main>
  );
}

function DecisionCard({ decision }: { decision: DecisionRecord }) {
  const hasProbability = decision.options.some((option) => option.probability !== undefined);
  const sourceLabel = decision.source === 'jev' ? 'Jev' : decision.source === 'forced' ? 'One option' : 'Shortest option';

  return (
    <article className={styles.decision}>
      <header>
        <span className={styles.stageTag}>{STAGE_LABELS[decision.stage] ?? decision.stage}</span>
        <span className={styles.sourceTag}>{sourceLabel}</span>
        {decision.confidence !== undefined && <span className={styles.confidence}>Confidence {(decision.confidence * 100).toFixed(0)}%</span>}
      </header>
      <p className={styles.question}>{decision.question}</p>
      <ul className={styles.options}>
        {decision.options.map((option) => {
          const isPicked = option.key === decision.picked;
          return (
            <li key={option.key} className={isPicked ? styles.optionPicked : styles.option}>
              <div className={styles.optionRow}>
                <span className={styles.optionLabel}>
                  {option.label}
                  {isPicked && <em>used</em>}
                  {decision.jevPick === option.key && decision.jevPick !== decision.picked && <em>Jev first</em>}
                </span>
                <span className={styles.optionValue}>
                  {option.probability !== undefined && `${(option.probability * 100).toFixed(0)}%`}
                  {option.moves !== undefined && <small>{option.moves} moves</small>}
                </span>
              </div>
              {hasProbability && <div className={styles.bar}><span style={{ width: `${Math.max(1, (option.probability ?? 0) * 100)}%` }} /></div>}
            </li>
          );
        })}
      </ul>
      {decision.note && <p className={styles.decisionNote}>{decision.note}</p>}
    </article>
  );
}
