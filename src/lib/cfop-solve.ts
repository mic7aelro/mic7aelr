/**
 * CFOP solver with an injected decision function.
 *
 * Code does the parts that have one right answer: applying moves, recognizing cases, and
 * checking results. Jev makes the decisions that have no single right answer: the cross color,
 * the order of the F2L pairs, the route through the last layer, and the choice between
 * alternate algorithms. The solver checks every decision after it applies the decision.
 * A wrong Jev answer makes a solution longer. It never makes a solution wrong.
 */

import {
  applyAlg,
  centerIndex,
  cubieOfIndex,
  CUBIES,
  faceOfIndex,
  FACES,
  formatAlg,
  frameAlg,
  isSolved,
  locateSticker,
  moveTarget,
  normalizeToCenters,
  parseAlg,
  SOLVED,
  type Face,
} from './cube';
import {
  areEdgesOriented,
  buildTables,
  collKey,
  CROSS_STICKERS,
  isCrossSolved,
  isF2LSolved,
  isOriented,
  isSlotSolved,
  ollKey,
  pairKey,
  pllKey,
  SLOT_NAMES,
  slotStickers,
  U_CORNER_STICKERS,
  wvKey,
  type Candidate,
} from './cfop-tables';

// ---------------------------------------------------------------------------------------------
// Decision interface
// ---------------------------------------------------------------------------------------------

export interface ChoiceQuestion {
  type: 'choice';
  instructions: string;
  criteria: Record<string, string>;
}

export interface ScoreQuestion {
  type: 'score';
  instructions: string;
  criteria: string[];
}

export type Question = ChoiceQuestion | ScoreQuestion;

export interface DecisionRequest {
  /** Name of the decision point, for logs and for tests. */
  stage: string;
  state: unknown;
  questions: Record<string, Question>;
}

export type Answer =
  | { type: 'choice'; choice: string; probabilities: Record<string, number>; confidence: number }
  | { type: 'score'; score: number; confidence: number };

export type Decider = (request: DecisionRequest) => Promise<Record<string, Answer> | null>;

export interface DecisionOption {
  key: string;
  label: string;
  /** Jev probability for this option. */
  probability?: number;
  /** Move count of the option, when the solver can measure it. */
  moves?: number;
}

export interface DecisionRecord {
  id: string;
  stage: string;
  question: string;
  options: DecisionOption[];
  /** The option that the solver used. */
  picked: string;
  /** The option that Jev ranked first. */
  jevPick?: string;
  confidence?: number;
  source: 'jev' | 'fallback' | 'forced';
  note?: string;
}

export type StageId = 'orient' | 'cross' | 'f2l' | 'wv' | 'oll' | 'coll' | 'pll' | 'auf';

export interface SolveStep {
  stage: StageId;
  title: string;
  detail?: string;
  moves: string[];
}

/** Face turns for each area of the solve. Whole-cube rotations are not turns. */
export interface AreaMoves {
  cross: number;
  f2l: number;
  oll: number;
  pll: number;
  /** Winter Variation. It replaces the last F2L pair and OLL. */
  wv: number;
  /** COLL. It replaces OLL and part of PLL. */
  coll: number;
  /** Turns of the top layer that only align the last layer. */
  auf: number;
}

export interface SolveResult {
  scramble: string[];
  steps: SolveStep[];
  moves: string[];
  /** Face turns in the solution. The count leaves out whole-cube rotations. */
  turnCount: number;
  /** Whole-cube rotations at the start of the solution. */
  rotationCount: number;
  areas: AreaMoves;
  decisions: DecisionRecord[];
  /** Jev score for the finished solution, from 0 (poor) to 4 (excellent). */
  quality?: { score: number; confidence: number };
  solved: boolean;
  jevCalls: number;
  jevFailures: string[];
}

export interface SolveOptions {
  /** Let the decider choose the cross color. When false, the cross stays on the bottom face. */
  chooseCross?: boolean;
}

// ---------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------

export const COLOR_NAMES: Record<Face, string> = {
  U: 'white', D: 'yellow', F: 'green', B: 'blue', R: 'red', L: 'orange',
};
const FACE_MOVES = ['U', "U'", 'U2', 'D', "D'", 'D2', 'R', "R'", 'R2', 'L', "L'", 'L2', 'F', "F'", 'F2', 'B', "B'", 'B2'];

const isRotation = (move: string) => /^[xyz]/.test(move);

export function movesPerArea(steps: readonly SolveStep[]): AreaMoves {
  const areas: AreaMoves = { cross: 0, f2l: 0, oll: 0, pll: 0, wv: 0, coll: 0, auf: 0 };
  for (const step of steps) {
    if (step.stage === 'orient') continue;
    areas[step.stage] += step.moves.filter((move) => !isRotation(move)).length;
  }
  return areas;
}

/** Name of a location, for example "UFR" for a corner or "FR" for an edge. */
function locationName(index: number): string {
  const cubie = cubieOfIndex(index);
  const [x, y, z] = cubie.position;
  return (y === 1 ? 'U' : y === -1 ? 'D' : '') + (z === 1 ? 'F' : z === -1 ? 'B' : '') + (x === 1 ? 'R' : x === -1 ? 'L' : '');
}

const pieceName = (colors: readonly string[]) => colors.join('');

// ---------------------------------------------------------------------------------------------
// Cross: exact search with a pruning table
// ---------------------------------------------------------------------------------------------

const encode = (locations: readonly number[]) => locations.reduce((key, location) => key * 54 + location, 0);
let crossTable: Map<number, number> | undefined;

function buildCrossTable(): Map<number, number> {
  const table = new Map<number, number>();
  const start = [...CROSS_STICKERS];
  table.set(encode(start), 0);
  let frontier = [start];
  let depth = 0;
  while (frontier.length > 0) {
    depth += 1;
    const next: number[][] = [];
    for (const locations of frontier) {
      for (const move of FACE_MOVES) {
        const moved = locations.map((location) => moveTarget(move, location));
        const key = encode(moved);
        if (!table.has(key)) {
          table.set(key, depth);
          next.push(moved);
        }
      }
    }
    frontier = next;
  }
  return table;
}

const crossLocations = (state: string) => CROSS_STICKERS.map((home) => locateSticker(state, home));

export function crossDistance(state: string): number {
  crossTable ??= buildCrossTable();
  return crossTable.get(encode(crossLocations(state))) as number;
}

/** Shortest cross solution. */
export function solveCross(state: string): string[] {
  crossTable ??= buildCrossTable();
  const table = crossTable;
  let locations = crossLocations(state);
  let distance = table.get(encode(locations)) as number;
  const moves: string[] = [];
  while (distance > 0) {
    let advanced = false;
    for (const move of FACE_MOVES) {
      const moved = locations.map((location) => moveTarget(move, location));
      if (table.get(encode(moved)) === distance - 1) {
        moves.push(move);
        locations = moved;
        distance -= 1;
        advanced = true;
        break;
      }
    }
    if (!advanced) throw new Error('Cross search failed.');
  }
  return moves;
}

// ---------------------------------------------------------------------------------------------
// Decision plumbing
// ---------------------------------------------------------------------------------------------

interface Context {
  decide?: Decider;
  decisions: DecisionRecord[];
  jevCalls: number;
  jevFailures: string[];
}

interface ChoiceOption {
  key: string;
  /** Text that Jev reads. */
  criteria: string;
  /** Short text for the results panel. */
  label: string;
  /** Deterministic cost. A lower cost ranks first when Jev gives no answer. */
  cost: number;
}

interface Ranked {
  /** Option keys in the order that the solver tries them. */
  order: string[];
  record: DecisionRecord;
}

async function ask(context: Context, request: DecisionRequest): Promise<Record<string, Answer> | null> {
  if (!context.decide) return null;
  context.jevCalls += 1;
  try {
    return await context.decide(request);
  } catch (error) {
    context.jevFailures.push(error instanceof Error ? error.message : 'Jev request failed.');
    return null;
  }
}

async function rankChoice(
  context: Context,
  spec: { id: string; stage: string; instructions: string; state: unknown; options: ChoiceOption[] },
): Promise<Ranked> {
  const byCost = [...spec.options].sort((a, b) => a.cost - b.cost);
  const options: DecisionOption[] = byCost.map((option) => ({ key: option.key, label: option.label, moves: option.cost }));
  const base = { id: spec.id, stage: spec.stage, question: spec.instructions, options };

  if (byCost.length === 1) {
    const record: DecisionRecord = { ...base, picked: byCost[0].key, source: 'forced' };
    context.decisions.push(record);
    return { order: [byCost[0].key], record };
  }

  const criteria = Object.fromEntries(spec.options.map((option) => [option.key, option.criteria]));
  const answers = await ask(context, {
    stage: spec.stage,
    state: spec.state,
    questions: { [spec.id]: { type: 'choice', instructions: spec.instructions, criteria } },
  });
  const answer = answers?.[spec.id];

  if (answer && answer.type === 'choice') {
    const probability = (key: string) => answer.probabilities[key] ?? 0;
    const order = [...spec.options]
      .sort((a, b) => probability(b.key) - probability(a.key) || a.cost - b.cost)
      .map((option) => option.key);
    for (const option of options) option.probability = probability(option.key);
    const record: DecisionRecord = {
      ...base,
      picked: order[0],
      jevPick: order[0],
      confidence: answer.confidence,
      source: 'jev',
    };
    context.decisions.push(record);
    return { order, record };
  }

  const record: DecisionRecord = {
    ...base,
    picked: byCost[0].key,
    source: 'fallback',
    note: context.decide ? 'Jev gave no answer. The solver used the shortest option.' : 'Jev is off. The solver used the shortest option.',
  };
  context.decisions.push(record);
  return { order: byCost.map((option) => option.key), record };
}

/** Record that the solver used another option than the first one. */
function overridePick(ranked: Ranked, key: string, note: string) {
  ranked.record.picked = key;
  ranked.record.note = note;
}

// ---------------------------------------------------------------------------------------------
// F2L
// ---------------------------------------------------------------------------------------------

interface PairSolution {
  moves: string[];
  cases: string[];
}

const KICKS = [
  ['R', 'U', "R'"],
  ['R', "U'", "R'"],
  ['R', 'U2', "R'"],
  ["F'", "U'", 'F'],
  ["F'", 'U', 'F'],
];

/** Solve one front-right style pair by table lookup. Other pairs and the cross stay intact. */
function solvePair(state: string, slot: number, solvedSlots: readonly number[]): PairSolution | null {
  const { f2l } = buildTables();
  const intact = (candidate: string) => isCrossSolved(candidate) && solvedSlots.every((other) => isSlotSolved(candidate, other));
  const unsolvedOthers = [0, 1, 2, 3].filter((other) => other !== slot && !solvedSlots.includes(other));

  const kickSet: string[][] = [['U'], ["U'"], ['U2']];
  for (const other of [slot, ...unsolvedOthers]) for (const kick of KICKS) kickSet.push(frameAlg(kick, other));

  const attempt = (start: string, prefix: string[], depth: number): PairSolution | null => {
    if (isSlotSolved(start, slot)) return { moves: prefix, cases: [] };
    const candidates = f2l.get(pairKey(start, slot));
    if (candidates && candidates.length > 0) {
      const best = [...candidates].sort((a, b) => a.moves.length - b.moves.length)[0];
      const moves = frameAlg(best.moves, slot);
      const result = applyAlg(start, moves);
      if (isSlotSolved(result, slot) && intact(result)) {
        const setup = prefix.length > 0 ? [`Setup ${prefix.join(' ')}`] : [];
        return { moves: [...prefix, ...moves], cases: [...setup, best.caseName] };
      }
    }
    if (depth === 0) return null;
    let best: PairSolution | null = null;
    for (const kick of kickSet) {
      const next = applyAlg(start, kick);
      if (!intact(next)) continue;
      const found = attempt(next, [...prefix, ...kick], depth - 1);
      if (found && (!best || found.moves.length < best.moves.length)) best = found;
    }
    return best;
  };

  return attempt(state, [], 2);
}

function describePair(state: string, slot: number): string {
  const home = slotStickers(slot);
  const at = home.map((sticker) => locateSticker(state, sticker));
  const cornerPlace = locationName(at[0]);
  const edgePlace = locationName(at[3]);
  const downSticker = at[home.slice(0, 3).findIndex((sticker) => faceOfIndex(sticker) === 'D')];
  const cornerColors = home.slice(0, 3).map(faceOfIndex);
  const edgeColors = home.slice(3).map(faceOfIndex);

  // The pair is connected when the corner and the edge touch and their side stickers match.
  const connected = cornerPlace.length === 3 && edgePlace.length === 2
    && [...edgePlace].every((face) => cornerPlace.includes(face))
    && [3, 4].every((position) => {
      const face = faceOfIndex(at[position]);
      if (face === 'U' || face === 'D') return true;
      const cornerSticker = at.slice(0, 3).find((location) => faceOfIndex(location) === face);
      return cornerSticker !== undefined && state[cornerSticker] === state[at[position]];
    });

  return `Slot ${SLOT_NAMES[slot]}: corner ${pieceName(cornerColors)} sits at ${cornerPlace} with its ${COLOR_NAMES.D} sticker facing ${faceOfIndex(downSticker)}; `
    + `edge ${pieceName(edgeColors)} sits at ${edgePlace} with its ${COLOR_NAMES[edgeColors[0]]} sticker facing ${faceOfIndex(at[3])}; `
    + `the pair is ${connected ? 'connected' : 'not connected'}.`;
}

// ---------------------------------------------------------------------------------------------
// Whole-cube description for Jev
// ---------------------------------------------------------------------------------------------

function faceRows(state: string): Record<string, string> {
  const rows: Record<string, string> = {};
  for (const [index, face] of FACES.entries()) {
    rows[face] = state.slice(index * 9, index * 9 + 9);
  }
  return rows;
}

const OPPOSITE: Record<Face, Face> = { U: 'D', D: 'U', F: 'B', B: 'F', R: 'L', L: 'R' };
const ORIENTATIONS: string[][] = [[], ['x'], ['x2'], ["x'"], ['z'], ["z'"]];

// ---------------------------------------------------------------------------------------------
// Solve
// ---------------------------------------------------------------------------------------------

export async function solveCube(scrambleText: string | readonly string[], decide?: Decider, options: SolveOptions = {}): Promise<SolveResult> {
  const chooseCross = options.chooseCross ?? true;
  const scramble = parseAlg(scrambleText);
  const context: Context = { decide, decisions: [], jevCalls: 0, jevFailures: [] };
  const steps: SolveStep[] = [];
  const allMoves: string[] = [];

  const scrambled = applyAlg(SOLVED, scramble);
  let state = scrambled;

  const push = (stage: StageId, title: string, moves: readonly string[], detail?: string) => {
    if (moves.length === 0 && stage !== 'cross') return;
    steps.push({ stage, title, detail, moves: [...moves] });
    allMoves.push(...moves);
  };

  // --- Cross color ---
  const orientationOptions = ORIENTATIONS.map((rotation) => {
    const rotated = applyAlg(scrambled, rotation);
    const bottom = rotated[centerIndex('D')] as Face;
    const normalized = normalizeToCenters(rotated);
    return { rotation, bottom, normalized, cost: crossDistance(normalized) };
  });

  let chosenOrientation = orientationOptions[0];
  if (chooseCross) {
    const ranked = await rankChoice(context, {
      id: 'cross_color',
      stage: 'cross',
      instructions: 'Which color is the best choice for the cross? Prefer a color whose four edges are close to their final positions and already oriented well.',
      state: { faces: faceRows(scrambled), note: 'Each face lists 9 stickers row by row. Letters name the face where the sticker belongs.' },
      options: orientationOptions.map((option) => {
        const colors = [option.bottom];
        const edges = FACES.filter((side) => side !== option.bottom && side !== OPPOSITE[option.bottom]).map((side) => {
          const [first, second] = locatePieceForDisplay(scrambled, [option.bottom, side]);
          return `${COLOR_NAMES[option.bottom]}-${COLOR_NAMES[side]} edge at ${locationName(first)} (${COLOR_NAMES[option.bottom]} sticker faces ${faceOfIndex(first)}, ${COLOR_NAMES[side]} sticker faces ${faceOfIndex(second)})`;
        });
        return {
          key: COLOR_NAMES[colors[0]],
          criteria: `${COLOR_NAMES[option.bottom]} cross. ${edges.join('; ')}.`,
          label: `${COLOR_NAMES[option.bottom]} cross`,
          cost: option.cost,
        };
      }),
    });
    const bestKey = ranked.order[0];
    chosenOrientation = orientationOptions.find((option) => COLOR_NAMES[option.bottom] === bestKey) ?? orientationOptions[0];
  }
  const optimal = Math.min(...orientationOptions.map((option) => option.cost));
  const crossRecord = context.decisions.find((decision) => decision.id === 'cross_color');
  if (crossRecord) {
    crossRecord.note = `${crossRecord.note ? `${crossRecord.note} ` : ''}The shortest cross takes ${optimal} moves. The chosen cross takes ${chosenOrientation.cost}.`.trim();
  }

  push('orient', 'Turn the cube', chosenOrientation.rotation,
    chosenOrientation.rotation.length > 0 ? `${COLOR_NAMES[chosenOrientation.bottom]} goes to the bottom.` : undefined);
  state = chosenOrientation.normalized;

  // --- Cross ---
  const crossMoves = solveCross(state);
  state = applyAlg(state, crossMoves);
  push('cross', 'Cross', crossMoves, crossMoves.length === 0 ? 'The cross is already solved.' : `${crossMoves.length} moves, found by exact search.`);

  // --- F2L ---
  const solvedSlots: number[] = [];
  const refreshSolved = () => {
    for (const slot of [0, 1, 2, 3]) if (!solvedSlots.includes(slot) && isSlotSolved(state, slot)) solvedSlots.push(slot);
  };
  refreshSolved();

  const tables = buildTables();

  while (solvedSlots.length < 4) {
    const remaining = [0, 1, 2, 3].filter((slot) => !solvedSlots.includes(slot));

    // Winter Variation: the last pair, when the table has the case.
    if (remaining.length === 1) {
      const slot = remaining[0];
      const candidates = tables.wv.get(wvKey(state, slot));
      if (candidates && candidates.length > 0) {
        const wv = await tryWinter(context, state, slot, candidates);
        if (wv) {
          state = wv.state;
          push('wv', 'Winter Variation', wv.moves, wv.detail);
          refreshSolved();
          continue;
        }
      }
    }

    const solutions = remaining
      .map((slot) => ({ slot, solution: solvePair(state, slot, solvedSlots) }))
      .filter((entry): entry is { slot: number; solution: PairSolution } => entry.solution !== null);
    if (solutions.length === 0) throw new Error('F2L search failed.');

    const ranked = await rankChoice(context, {
      id: `pair_${solvedSlots.length + 1}`,
      stage: 'f2l',
      instructions: 'Which unsolved F2L pair is best to solve next? Prefer a pair that is connected or sits in the top layer. Avoid a pair that is trapped in a slot or that blocks another pair.',
      state: { solvedSlots: solvedSlots.map((slot) => SLOT_NAMES[slot]), pairs: remaining.map((slot) => describePair(state, slot)) },
      options: solutions.map(({ slot, solution }) => ({
        key: SLOT_NAMES[slot],
        criteria: describePair(state, slot),
        label: `Slot ${SLOT_NAMES[slot]}`,
        cost: solution.moves.length,
      })),
    });

    const key = ranked.order[0];
    const chosen = solutions.find(({ slot }) => SLOT_NAMES[slot] === key) ?? solutions[0];
    const shortest = Math.min(...solutions.map(({ solution }) => solution.moves.length));
    ranked.record.note = `${ranked.record.note ? `${ranked.record.note} ` : ''}The chosen pair takes ${chosen.solution.moves.length} moves. The shortest pair takes ${shortest}.`.trim();
    state = applyAlg(state, chosen.solution.moves);
    push(
      'f2l',
      `F2L pair ${solvedSlots.length + 1} · slot ${SLOT_NAMES[chosen.slot]}`,
      chosen.solution.moves,
      chosen.solution.cases.length > 0 ? chosen.solution.cases.join(', ') : 'Solved by another pair.',
    );
    refreshSolved();
  }

  if (!isF2LSolved(state)) throw new Error('F2L check failed.');

  // --- Last layer ---
  if (!isOriented(state)) {
    const collCandidates = areEdgesOriented(state) ? tables.coll.get(collKey(state)) : undefined;
    const route = collCandidates && collCandidates.length > 0 ? await tryRoute(context, state, collCandidates) : null;
    if (route) {
      state = route.state;
      push('coll', route.title, route.moves, route.detail);
    } else {
      const candidates = tables.oll.get(ollKey(state));
      if (!candidates) throw new Error('OLL lookup failed.');
      const outcome = await pickAlgorithm(context, {
        id: 'oll_alg',
        stage: 'oll',
        instructions: 'Which algorithm is best for this OLL case? Prefer fewer moves and easy finger tricks.',
        candidates,
        state,
        verify: (next) => isF2LSolved(next) && isOriented(next),
      });
      state = outcome.state;
      push('oll', outcome.title, outcome.moves, outcome.detail);
    }
  }

  if (!isSolved(state)) {
    const candidates = tables.pll.get(pllKey(state));
    if (candidates) {
      const outcome = await pickAlgorithm(context, {
        id: 'pll_alg',
        stage: 'pll',
        instructions: 'Which algorithm is best for this PLL case? Prefer fewer moves and easy finger tricks.',
        candidates,
        state,
        verify: (next) => isSolved(next),
      });
      state = outcome.state;
      push('pll', outcome.title, outcome.moves, outcome.detail);
    } else {
      const turn = ([['U'], ['U2'], ["U'"]] as string[][]).find((candidate) => isSolved(applyAlg(state, candidate)));
      if (!turn) throw new Error('PLL lookup failed.');
      state = applyAlg(state, turn);
      push('auf', 'Final U turn', turn, 'The last layer needs only a U turn.');
    }
  }

  const solved = isSolved(state);

  // --- Quality score ---
  let quality: SolveResult['quality'];
  if (context.decide && solved) {
    const summary = {
      totalMoves: allMoves.filter((move) => !isRotation(move)).length,
      stages: steps.map((step) => ({ stage: step.stage, moves: step.moves.length })),
      solution: formatAlg(allMoves),
    };
    const answers = await ask(context, {
      stage: 'quality',
      state: summary,
      questions: {
        quality: {
          type: 'score',
          instructions: 'How efficient is this CFOP solution? A typical human CFOP solve takes about 55 moves.',
          criteria: ['Far too long: over 80 moves', 'Long: 65 to 80 moves', 'Typical: 55 to 65 moves', 'Efficient: 45 to 55 moves', 'Excellent: under 45 moves'],
        },
      },
    });
    const answer = answers?.quality;
    if (answer && answer.type === 'score') quality = { score: answer.score, confidence: answer.confidence };
  }

  return {
    scramble,
    steps,
    moves: allMoves,
    turnCount: allMoves.filter((move) => !isRotation(move)).length,
    rotationCount: allMoves.filter(isRotation).length,
    areas: movesPerArea(steps),
    decisions: context.decisions,
    quality,
    solved,
    jevCalls: context.jevCalls,
    jevFailures: context.jevFailures,
  };
}

/** Find pieces for the cross color description. */
function locatePieceForDisplay(state: string, colors: readonly Face[]): number[] {
  for (const cubie of CUBIES) {
    if (cubie.stickers.length !== colors.length) continue;
    const found = cubie.stickers.map((index) => state[index]);
    if (colors.every((color) => found.includes(color))) return colors.map((color) => cubie.stickers[found.indexOf(color)]);
  }
  throw new Error('Piece not found.');
}

// ---------------------------------------------------------------------------------------------
// Last-layer helpers
// ---------------------------------------------------------------------------------------------

interface AlgorithmOutcome {
  state: string;
  moves: string[];
  title: string;
  detail: string;
}

/** Group candidates by algorithm variant and keep the shortest sequence of each. */
function distinctVariants(candidates: readonly Candidate[]): Candidate[] {
  const best = new Map<string, Candidate>();
  for (const candidate of candidates) {
    const key = `${candidate.caseId}#${candidate.variant}`;
    const existing = best.get(key);
    if (!existing || existing.moves.length > candidate.moves.length) best.set(key, candidate);
  }
  return [...best.values()];
}

async function pickAlgorithm(
  context: Context,
  spec: {
    id: string;
    stage: string;
    instructions: string;
    state: string;
    candidates: readonly Candidate[];
    verify: (state: string) => boolean;
  },
): Promise<AlgorithmOutcome> {
  const variants = distinctVariants(spec.candidates);
  const ranked = await rankChoice(context, {
    id: spec.id,
    stage: spec.stage,
    instructions: spec.instructions,
    state: { stage: spec.stage, case: variants[0].caseName },
    options: variants.map((candidate) => ({
      key: `${candidate.caseName} #${candidate.variant + 1}`,
      criteria: `${candidate.text} (${candidate.moves.length} moves with turns of the top layer)`,
      label: `${candidate.caseName} · ${candidate.text}`,
      cost: candidate.moves.length,
    })),
  });

  for (const key of ranked.order) {
    const candidate = variants.find((entry) => `${entry.caseName} #${entry.variant + 1}` === key) as Candidate;
    const next = applyAlg(spec.state, candidate.moves);
    if (spec.verify(next)) {
      if (key !== ranked.order[0]) overridePick(ranked, key, 'The first choice failed the check. The solver used the next option.');
      return {
        state: next,
        moves: candidate.moves,
        title: `${spec.stage.toUpperCase()} · ${candidate.caseName}`,
        detail: `Catalog: ${candidate.text}`,
      };
    }
  }
  throw new Error(`${spec.stage.toUpperCase()} check failed.`);
}

async function tryRoute(context: Context, state: string, candidates: readonly Candidate[]): Promise<AlgorithmOutcome | null> {
  const variants = distinctVariants(candidates);
  const oll = buildTables().oll.get(ollKey(state)) ?? [];
  const ollLength = oll.length > 0 ? Math.min(...oll.map((candidate) => candidate.moves.length)) : 0;
  const collLength = Math.min(...variants.map((candidate) => candidate.moves.length));

  const ranked = await rankChoice(context, {
    id: 'last_layer_route',
    stage: 'coll',
    instructions: 'All last-layer edges are oriented. Should the solver use COLL to solve the corners in one algorithm, or use a normal OLL algorithm first? Prefer COLL when it saves moves and the case is easy to recognize.',
    state: { edgesOriented: true, cornerPattern: collKey(state), collCase: variants[0].caseName },
    options: [
      { key: 'coll', criteria: `Use COLL case ${variants[0].caseName}. It takes about ${collLength} moves and solves the corners.`, label: `COLL · ${variants[0].caseName}`, cost: collLength },
      { key: 'oll', criteria: `Use a normal OLL algorithm. It takes about ${ollLength} moves and then PLL takes more moves.`, label: 'OLL then PLL', cost: ollLength + 12 },
    ],
  });
  if (ranked.order[0] !== 'coll') return null;
  return pickAlgorithm(context, {
    id: 'coll_alg',
    stage: 'coll',
    instructions: 'Which algorithm is best for this COLL case? Prefer fewer moves and easy finger tricks.',
    state,
    candidates,
    verify: (next) => isF2LSolved(next) && U_CORNER_STICKERS.every((index) => next[index] === faceOfIndex(index)),
  });
}

async function tryWinter(context: Context, state: string, slot: number, candidates: readonly Candidate[]): Promise<{ state: string; moves: string[]; detail: string } | null> {
  const variants = distinctVariants(candidates);
  const shortestWinter = Math.min(...variants.map((candidate) => candidate.moves.length));

  const standard = solvePair(state, slot, [0, 1, 2, 3].filter((other) => other !== slot));
  const standardLength = (standard?.moves.length ?? 99) + 9;

  const ranked = await rankChoice(context, {
    id: 'last_pair_route',
    stage: 'wv',
    instructions: 'The last F2L pair is connected and three last-layer edges are oriented. Should the solver use Winter Variation to insert the pair and orient the corners together, or solve the pair and then use OLL?',
    state: { pair: describePair(state, slot), topEdgesOriented: 3 },
    options: [
      { key: 'wv', criteria: `Use Winter Variation. It takes about ${shortestWinter} moves and orients the last-layer corners.`, label: `Winter Variation · ${variants[0].caseName}`, cost: shortestWinter },
      { key: 'standard', criteria: `Insert the pair, then use OLL and PLL. It takes about ${standardLength} moves before PLL.`, label: 'Insert, then OLL', cost: standardLength },
    ],
  });
  if (ranked.order[0] !== 'wv') return null;

  const wvChoice = await pickAlgorithm(context, {
    id: 'wv_alg',
    stage: 'wv',
    instructions: 'Which algorithm is best for this Winter Variation case? Prefer fewer moves and easy finger tricks.',
    state,
    candidates: variants.map((candidate) => ({ ...candidate, moves: frameAlg(candidate.moves, slot) })),
    verify: (next) => isF2LSolved(next) && isOriented(next),
  }).catch(() => null);
  if (!wvChoice) return null;
  return { state: wvChoice.state, moves: wvChoice.moves, detail: `${wvChoice.title.replace('WV · ', '')} · ${wvChoice.detail}` };
}
