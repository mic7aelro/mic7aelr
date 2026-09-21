/**
 * Verified recognition tables for CFOP.
 *
 * The simulator checks each catalog algorithm. Then it builds a table that maps the pattern of
 * a case to the algorithms that solve the case. The solver looks up the state of the cube in
 * these tables. The lookup is exact, so Jev never has to recognize a case.
 */

import {
  applyAlg,
  centerIndex,
  CORNER_CUBIES,
  CUBIES,
  cubieOfIndex,
  dropRotations,
  expandToFaceTurns,
  faceOfIndex,
  FACES,
  frameAlg,
  frameState,
  invertAlg,
  locateSticker,
  parseAlg,
  rotateIndexY,
  SOLVED,
  stickerCoordinates,
} from './cube';
import { ALG_SETS, type AlgCase, type AlgSet } from './cfop-algs';

// ---------------------------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------------------------

const range54 = Array.from({ length: 54 }, (_, index) => index);
const CENTERS = FACES.map(centerIndex);

/** Stickers that lie in the top layer, including the top face and the ring on the four sides. */
export const U_LAYER = range54.filter((index) => stickerCoordinates(index)[1] === 1);
export const U_FACE = range54.filter((index) => faceOfIndex(index) === 'U');
export const U_RING = U_LAYER.filter((index) => faceOfIndex(index) !== 'U');

const FR_CORNER = CUBIES.find((cubie) => cubie.position.join(',') === '1,-1,1');
const FR_EDGE = CUBIES.find((cubie) => cubie.position.join(',') === '1,0,1');
if (!FR_CORNER || !FR_EDGE) throw new Error('Missing front-right slot.');

/** The five stickers of the front-right pair on a solved cube. Slot k uses the y-turned images. */
const FR_PAIR_STICKERS = [...FR_CORNER.stickers, ...FR_EDGE.stickers];
export const slotStickers = (slot: number) => FR_PAIR_STICKERS.map((index) => rotateIndexY(index, slot));
const SLOT_STICKER_SETS = [0, 1, 2, 3].map((slot) => new Set(slotStickers(slot)));

export const SLOT_NAMES = ['FR', 'FL', 'BL', 'BR'] as const;

export const U_CORNER_STICKERS = CORNER_CUBIES.filter((cubie) => cubie.position[1] === 1).flatMap((cubie) => cubie.stickers);
const U_EDGE_UFACE = U_FACE.filter((index) => index % 2 === 1);

// ---------------------------------------------------------------------------------------------
// Stage predicates. The state must use center-based color names.
// ---------------------------------------------------------------------------------------------

const homeAt = (state: string, indexes: readonly number[]) => indexes.every((index) => state[index] === faceOfIndex(index));

export const CROSS_STICKERS = range54.filter((index) => {
  const cubie = cubieOfIndex(index);
  return cubie.stickers.length === 2 && cubie.position[1] === -1;
});

export const centersHome = (state: string) => CENTERS.every((index) => state[index] === faceOfIndex(index));
export const isCrossSolved = (state: string) => homeAt(state, CROSS_STICKERS);
export const isSlotSolved = (state: string, slot: number) => homeAt(state, slotStickers(slot));
export const isF2LSolved = (state: string) => isCrossSolved(state) && [0, 1, 2, 3].every((slot) => isSlotSolved(state, slot));
export const isOriented = (state: string) => U_FACE.every((index) => state[index] === 'U');
export const areEdgesOriented = (state: string) => U_EDGE_UFACE.every((index) => state[index] === 'U');

// ---------------------------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------------------------

const pick = (state: string, indexes: readonly number[]) => indexes.map((index) => state[index]).join('');

export const ollKey = (state: string) => U_LAYER.map((index) => (state[index] === 'U' ? '1' : '0')).join('');
export const collKey = (state: string) => pick(state, U_CORNER_STICKERS);
export const pllKey = (state: string) => pick(state, U_RING);

/** Locations of the five front-right pair stickers after the state turns into the front-right frame. */
export function pairKey(state: string, slot: number): string {
  const framed = frameState(state, slot);
  return FR_PAIR_STICKERS.map((home) => locateSticker(framed, home)).join(',');
}

export const wvKey = (state: string, slot: number) => `${pairKey(state, slot)}|${ollKey(frameState(state, slot))}`;

// ---------------------------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------------------------

export interface VerifiedAlg {
  /** Rotation-free moves that a person applies to the cube. */
  moves: string[];
  /** For F2L and WV. The slot that the algorithm changes. */
  slot?: number;
}

export interface Rejection {
  set: AlgSet;
  caseName: string;
  alg: string;
  reason: string;
}

const disturbed = (state: string) => range54.filter((index) => state[index] !== SOLVED[index]);

/** Check one algorithm. Return the rotation-free moves, or a reason to reject them. */
export function verifyAlg(set: AlgSet, text: string): VerifiedAlg | string {
  let moves: string[];
  try {
    moves = dropRotations(expandToFaceTurns(parseAlg(text)));
  } catch (error) {
    return error instanceof Error ? error.message : 'Cannot parse.';
  }
  const applied = applyAlg(SOLVED, moves);
  const changed = disturbed(applied);
  if (changed.length === 0) return 'Does nothing.';

  if (set === 'F2L' || set === 'WV') {
    const slots = [0, 1, 2, 3].filter((slot) => changed.some((index) => SLOT_STICKER_SETS[slot].has(index)));
    if (slots.length !== 1) return `Changes ${slots.length} slots.`;
    const slot = slots[0];
    const allowed = new Set([...U_LAYER, ...slotStickers(slot)]);
    if (changed.some((index) => !allowed.has(index))) return 'Changes the cross or a solved slot.';
    return { moves: frameAlg(moves, (4 - slot) % 4), slot: 0 };
  }

  const layer = new Set(U_LAYER);
  if (changed.some((index) => !layer.has(index))) return 'Changes the first two layers.';
  if (set === 'PLL' && !isOriented(applied)) return 'Changes the orientation.';
  if (set === 'COLL' && !areEdgesOriented(applied)) return 'Does not keep the edges oriented.';
  return { moves };
}

// ---------------------------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------------------------

export interface Candidate {
  caseId: string;
  caseName: string;
  set: AlgSet;
  /** Alternate number inside the case. */
  variant: number;
  /** The algorithm as the catalog writes it. */
  text: string;
  /** The algorithm alone, without pre and post turns. */
  alg: string[];
  /** The complete sequence: pre-turns, algorithm, post-turns. */
  moves: string[];
}

export type Table = Map<string, Candidate[]>;

const AUF: string[][] = [[], ['U'], ['U2'], ["U'"]];

function addCandidate(table: Table, key: string, candidate: Candidate) {
  const list = table.get(key) ?? [];
  const existing = list.findIndex((entry) => entry.caseId === candidate.caseId && entry.variant === candidate.variant);
  if (existing >= 0) {
    if (list[existing].moves.length > candidate.moves.length) list[existing] = candidate;
  } else {
    list.push(candidate);
  }
  table.set(key, list);
}

export interface Tables {
  f2l: Table;
  oll: Table;
  pll: Table;
  coll: Table;
  wv: Table;
  rejections: Rejection[];
  accepted: Record<AlgSet, number>;
}

let cached: Tables | undefined;

export function buildTables(): Tables {
  if (cached) return cached;
  const tables: Tables = {
    f2l: new Map(),
    oll: new Map(),
    pll: new Map(),
    coll: new Map(),
    wv: new Map(),
    rejections: [],
    accepted: { F2L: 0, OLL: 0, PLL: 0, COLL: 0, WV: 0 },
  };

  const process = (set: AlgSet, entry: AlgCase) => {
    entry.algs.forEach((text, variant) => {
      const verified = verifyAlg(set, text);
      if (typeof verified === 'string') {
        tables.rejections.push({ set, caseName: entry.name, alg: text, reason: verified });
        return;
      }
      tables.accepted[set] += 1;
      const base = { caseId: entry.id, caseName: entry.name, set, variant, text, alg: verified.moves };
      const post = set === 'PLL' || set === 'COLL' ? AUF : [[]];
      for (const before of AUF) {
        for (const after of post) {
          const moves = [...before, ...verified.moves, ...after];
          const start = applyAlg(SOLVED, invertAlg(moves));
          if (set === 'F2L') addCandidate(tables.f2l, pairKey(start, 0), { ...base, moves });
          else if (set === 'WV') addCandidate(tables.wv, wvKey(start, 0), { ...base, moves });
          else if (set === 'OLL') addCandidate(tables.oll, ollKey(start), { ...base, moves });
          else if (set === 'PLL') addCandidate(tables.pll, pllKey(start), { ...base, moves });
          else if (areEdgesOriented(start)) addCandidate(tables.coll, collKey(start), { ...base, moves });
        }
      }
    });
  };

  for (const set of Object.keys(ALG_SETS) as AlgSet[]) for (const entry of ALG_SETS[set]) process(set, entry);
  cached = tables;
  return tables;
}

