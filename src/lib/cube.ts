/**
 * Rubik's Cube engine.
 *
 * A cube state is a string of 54 characters. Each character names the home face of the sticker
 * (U, R, F, D, L, or B). The stickers use the order U, R, F, D, L, B. Each face has 9 stickers
 * in row-major order. A solved cube reads "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB".
 *
 * All moves come from 3D geometry. Each sticker has a position and a normal vector. A move
 * rotates the stickers in the selected layers. This method gives face turns, wide turns,
 * slice turns, and whole-cube rotations with one code path.
 */

export type Face = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';
export const FACES: readonly Face[] = ['U', 'R', 'F', 'D', 'L', 'B'];
export const SOLVED = FACES.map((face) => face.repeat(9)).join('');

type Vec = [number, number, number];

const NORMALS: Record<Face, Vec> = {
  U: [0, 1, 0],
  R: [1, 0, 0],
  F: [0, 0, 1],
  D: [0, -1, 0],
  L: [-1, 0, 0],
  B: [0, 0, -1],
};

function stickerPosition(face: Face, row: number, col: number): Vec {
  switch (face) {
    case 'U': return [col - 1, 1, row - 1];
    case 'R': return [1, 1 - row, 1 - col];
    case 'F': return [col - 1, 1 - row, 1];
    case 'D': return [col - 1, -1, 1 - row];
    case 'L': return [-1, 1 - row, col - 1];
    case 'B': return [1 - col, 1 - row, -1];
  }
}

const POSITIONS: Vec[] = [];
const STICKER_NORMALS: Vec[] = [];
const INDEX_BY_KEY = new Map<string, number>();

for (const face of FACES) {
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const index = POSITIONS.length;
      const position = stickerPosition(face, row, col);
      POSITIONS.push(position);
      STICKER_NORMALS.push(NORMALS[face]);
      INDEX_BY_KEY.set(`${position}|${NORMALS[face]}`, index);
    }
  }
}

export const stickerCoordinates = (index: number): readonly number[] => POSITIONS[index];
export const stickerNormal = (index: number): readonly number[] => STICKER_NORMALS[index];
export const faceOfIndex = (index: number): Face => FACES[Math.floor(index / 9)];
export const stickerIndex = (face: Face, row: number, col: number) => FACES.indexOf(face) * 9 + row * 3 + col;

const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec, b: Vec): Vec => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** Rotate a vector by `turns` clockwise quarter turns, seen from the positive side of `axis`. */
function rotate(vector: Vec, axis: Vec, turns: number): Vec {
  let result = vector;
  const count = ((turns % 4) + 4) % 4;
  for (let step = 0; step < count; step += 1) {
    const c = cross(axis, result);
    const d = dot(axis, result);
    result = [-c[0] + axis[0] * d, -c[1] + axis[1] * d, -c[2] + axis[2] * d];
  }
  return result.map((value) => (value === 0 ? 0 : value)) as Vec;
}

interface MoveSpec {
  /** Axis that points toward the turned face. The turn is clockwise when seen from this side. */
  axis: Vec;
  /** Layer coordinates along the axis. 1 is the outer layer and 0 is the middle layer. */
  layers: number[];
}

const BASE_MOVES: Record<string, MoveSpec> = {
  U: { axis: [0, 1, 0], layers: [1] },
  D: { axis: [0, -1, 0], layers: [1] },
  R: { axis: [1, 0, 0], layers: [1] },
  L: { axis: [-1, 0, 0], layers: [1] },
  F: { axis: [0, 0, 1], layers: [1] },
  B: { axis: [0, 0, -1], layers: [1] },
  u: { axis: [0, 1, 0], layers: [1, 0] },
  d: { axis: [0, -1, 0], layers: [1, 0] },
  r: { axis: [1, 0, 0], layers: [1, 0] },
  l: { axis: [-1, 0, 0], layers: [1, 0] },
  f: { axis: [0, 0, 1], layers: [1, 0] },
  b: { axis: [0, 0, -1], layers: [1, 0] },
  M: { axis: [-1, 0, 0], layers: [0] },
  E: { axis: [0, -1, 0], layers: [0] },
  S: { axis: [0, 0, 1], layers: [0] },
  x: { axis: [1, 0, 0], layers: [1, 0, -1] },
  y: { axis: [0, 1, 0], layers: [1, 0, -1] },
  z: { axis: [0, 0, 1], layers: [1, 0, -1] },
};

const ROTATION_NAMES = new Set(['x', 'y', 'z']);
const sameVec = (a: Vec, b: Vec) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
const sameLayers = (a: number[], b: number[]) => a.length === b.length && a.every((layer) => b.includes(layer));

const permutationCache = new Map<string, number[]>();

/** Permutation for one clockwise quarter turn of a base move, so `next[perm[i]] = state[i]`. */
function quarterPermutation(spec: MoveSpec, turns: number): number[] {
  const permutation = Array.from({ length: 54 }, (_, index) => index);
  for (let index = 0; index < 54; index += 1) {
    if (!spec.layers.includes(dot(POSITIONS[index], spec.axis))) continue;
    const position = rotate(POSITIONS[index], spec.axis, turns);
    const normal = rotate(STICKER_NORMALS[index], spec.axis, turns);
    const target = INDEX_BY_KEY.get(`${position}|${normal}`);
    if (target === undefined) throw new Error('Move geometry is inconsistent.');
    permutation[index] = target;
  }
  return permutation;
}

export interface ParsedMove {
  name: string;
  /** Number of clockwise quarter turns: 1, 2, or 3. */
  turns: number;
}

const TOKEN_PATTERN = /^([RLUDFBrludfbMESxyz]|[RLUDFB]w)(2'|2|3|')?$/;

export function parseToken(token: string): ParsedMove {
  const match = TOKEN_PATTERN.exec(token.replace(/’/g, "'"));
  if (!match) throw new Error(`Invalid move: ${token}`);
  let name = match[1];
  if (name.length === 2) name = name[0].toLowerCase();
  const suffix = match[2];
  const turns = suffix === "'" || suffix === '3' ? 3 : suffix === '2' || suffix === "2'" ? 2 : 1;
  return { name, turns };
}

/** The turned layers of a move, for animation. The turn is clockwise seen from `axis`. */
export function moveGeometry(token: string): { axis: readonly number[]; layers: readonly number[]; turns: number } {
  const { name, turns } = parseToken(token);
  const spec = BASE_MOVES[name];
  return { axis: spec.axis, layers: spec.layers, turns };
}

export function formatMove(name: string, turns: number): string {
  const normalized = ((turns % 4) + 4) % 4;
  if (normalized === 0) return '';
  return name + (normalized === 1 ? '' : normalized === 2 ? '2' : "'");
}

/** Split a notation string into normalized move tokens. Parentheses and commas are ignored. */
export function parseAlg(text: string | readonly string[]): string[] {
  const raw = typeof text === 'string' ? text.replace(/[(),]/g, ' ').split(/\s+/) : [...text];
  return raw
    .filter((token) => token.length > 0)
    .map((token) => {
      const { name, turns } = parseToken(token);
      return formatMove(name, turns);
    })
    .filter((token) => token.length > 0);
}

export const formatAlg = (moves: readonly string[]) => moves.join(' ');

export function invertAlg(moves: readonly string[]): string[] {
  return [...moves].reverse().map((token) => {
    const { name, turns } = parseToken(token);
    return formatMove(name, 4 - turns);
  });
}

function permutationFor(token: string): number[] {
  const cached = permutationCache.get(token);
  if (cached) return cached;
  const { name, turns } = parseToken(token);
  const base = quarterPermutation(BASE_MOVES[name], 1);
  let result = Array.from({ length: 54 }, (_, index) => index);
  for (let step = 0; step < turns; step += 1) result = result.map((target) => base[target]);
  permutationCache.set(token, result);
  return result;
}

export function applyMove(state: string, token: string): string {
  const permutation = permutationFor(token);
  const next = new Array<string>(54);
  for (let index = 0; index < 54; index += 1) next[permutation[index]] = state[index];
  return next.join('');
}

export function applyAlg(state: string, moves: string | readonly string[]): string {
  let result = state;
  for (const token of parseAlg(moves)) result = applyMove(result, token);
  return result;
}

/** Where the sticker at location `index` goes after the move. */
export function moveTarget(token: string, index: number): number {
  return permutationFor(token)[index];
}

// ---------------------------------------------------------------------------------------------
// Frames: conjugation of an algorithm by a rotation.
// ---------------------------------------------------------------------------------------------

const TOKEN_BY_SPEC: { name: string; spec: MoveSpec }[] = Object.entries(BASE_MOVES)
  .filter(([name]) => !ROTATION_NAMES.has(name))
  .map(([name, spec]) => ({ name, spec }));

function specToToken(axis: Vec, layers: number[], turns: number): string {
  for (const entry of TOKEN_BY_SPEC) {
    if (sameVec(entry.spec.axis, axis) && sameLayers(entry.spec.layers, layers)) return formatMove(entry.name, turns);
  }
  const flipped = axis.map((value) => (value === 0 ? 0 : -value)) as Vec;
  const flippedLayers = layers.map((layer) => (layer === 0 ? 0 : -layer));
  for (const entry of TOKEN_BY_SPEC) {
    if (sameVec(entry.spec.axis, flipped) && sameLayers(entry.spec.layers, flippedLayers)) return formatMove(entry.name, 4 - turns);
  }
  for (const entry of TOKEN_BY_SPEC) {
    if (sameVec(entry.spec.axis, axis) && sameLayers(entry.spec.layers, flippedLayers)) return formatMove(entry.name, turns);
  }
  throw new Error('No token for move specification.');
}

const Y_AXIS: Vec = [0, 1, 0];

/**
 * Express an algorithm for the front-right slot as an algorithm for slot number `frame`.
 * Frame 1 turns the front-right slot into the front-left slot, and so on around the cube.
 */
export function frameAlg(moves: readonly string[], frame: number): string[] {
  const normalized = ((frame % 4) + 4) % 4;
  if (normalized === 0) return [...moves];
  return moves.map((token) => {
    const { name, turns } = parseToken(token);
    if (ROTATION_NAMES.has(name)) throw new Error('frameAlg does not accept rotations.');
    const spec = BASE_MOVES[name];
    return specToToken(rotate(spec.axis, Y_AXIS, normalized), spec.layers, turns);
  });
}

const EXPANSIONS: Record<string, string[]> = {
  r: ['x', 'L'], l: ["x'", 'R'], u: ['y', 'D'], d: ["y'", 'U'], f: ['z', 'B'], b: ["z'", 'F'],
  M: ["x'", 'R', "L'"], E: ["y'", 'U', "D'"], S: ['z', "F'", 'B'],
};

/** Replace wide turns and slice turns with face turns and whole-cube rotations. */
export function expandToFaceTurns(moves: readonly string[]): string[] {
  return moves.flatMap((token) => {
    const { name, turns } = parseToken(token);
    const parts = EXPANSIONS[name];
    if (!parts) return [token];
    return parts.map((part) => {
      const inner = parseToken(part);
      return formatMove(inner.name, inner.turns * turns);
    });
  });
}

/**
 * Remove whole-cube rotations from an algorithm. The result gives the same cube pattern
 * relative to the centers, and it needs no rotation.
 */
export function dropRotations(moves: readonly string[]): string[] {
  let unrotate = (vector: Vec): Vec => vector;
  const output: string[] = [];
  for (const token of moves) {
    const { name, turns } = parseToken(token);
    const spec = BASE_MOVES[name];
    if (ROTATION_NAMES.has(name)) {
      const previous = unrotate;
      unrotate = (vector) => previous(rotate(vector, spec.axis, 4 - turns));
      continue;
    }
    output.push(specToToken(unrotate(spec.axis), spec.layers, turns));
  }
  return output;
}

// ---------------------------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------------------------

const CENTER_INDEX: Record<Face, number> = { U: 4, R: 13, F: 22, D: 31, L: 40, B: 49 };
export const centerIndex = (face: Face) => CENTER_INDEX[face];

export interface Cubie {
  position: Vec;
  /** Sticker indices in ascending order. */
  stickers: number[];
}

const cubiesByPosition = new Map<string, Cubie>();
for (let index = 0; index < 54; index += 1) {
  const key = POSITIONS[index].join(',');
  const cubie = cubiesByPosition.get(key) ?? { position: POSITIONS[index], stickers: [] };
  cubie.stickers.push(index);
  cubiesByPosition.set(key, cubie);
}

export const CUBIES: readonly Cubie[] = [...cubiesByPosition.values()];
export const EDGE_CUBIES = CUBIES.filter((cubie) => cubie.stickers.length === 2);
export const CORNER_CUBIES = CUBIES.filter((cubie) => cubie.stickers.length === 3);

/** Faces of the stickers that lie on a cubie, in the order of `cubie.stickers`. */
export const cubieHomeFaces = (cubie: Cubie) => cubie.stickers.map(faceOfIndex);

/**
 * Find the cubie that holds the piece with these colors. Return the location of each named
 * color, in the order the colors are given.
 */
export function locatePiece(state: string, colors: readonly string[]): number[] {
  for (const cubie of CUBIES) {
    if (cubie.stickers.length !== colors.length) continue;
    const found = cubie.stickers.map((index) => state[index]);
    if (colors.every((color) => found.includes(color))) {
      return colors.map((color) => cubie.stickers[found.indexOf(color)]);
    }
  }
  throw new Error(`Piece ${colors.join('')} not found.`);
}

/** Location of a specific sticker of the solved cube, after the cube changes. */
export function locateSticker(state: string, home: number): number {
  const colors = cubieHomeFaces(cubieOfIndex(home));
  const own = faceOfIndex(home);
  return locatePiece(state, colors)[colors.indexOf(own)];
}

const cubieByIndex = new Map<number, Cubie>();
for (const cubie of CUBIES) for (const index of cubie.stickers) cubieByIndex.set(index, cubie);
export const cubieOfIndex = (index: number): Cubie => cubieByIndex.get(index) as Cubie;

// ---------------------------------------------------------------------------------------------
// Rotations of a whole state
// ---------------------------------------------------------------------------------------------

const yPermutation = permutationFor('y');
const yFaceMap: Record<Face, Face> = {} as Record<Face, Face>;
for (const face of FACES) yFaceMap[face] = faceOfIndex(yPermutation[CENTER_INDEX[face]]);

/** Apply a y-axis frame change of `turns` quarter turns to an index. */
export function rotateIndexY(index: number, turns: number): number {
  const count = ((turns % 4) + 4) % 4;
  let result = index;
  for (let step = 0; step < count; step += 1) result = yPermutation[result];
  return result;
}

/**
 * View the state as if the cube were turned about the vertical axis by `-frame` quarter turns,
 * so that slot number `frame` sits at the front-right position.
 */
export function frameState(state: string, frame: number): string {
  const normalized = ((frame % 4) + 4) % 4;
  if (normalized === 0) return state;
  const back = 4 - normalized;
  const next = new Array<string>(54);
  for (let index = 0; index < 54; index += 1) {
    let face = state[index] as Face;
    for (let step = 0; step < back; step += 1) face = yFaceMap[face];
    next[rotateIndexY(index, back)] = face;
  }
  return next.join('');
}

/** Rename colors so that each center carries the name of its own face. */
export function normalizeToCenters(state: string): string {
  const names = new Map<string, Face>();
  for (const face of FACES) names.set(state[CENTER_INDEX[face]], face);
  return [...state].map((color) => names.get(color) as Face).join('');
}

// ---------------------------------------------------------------------------------------------
// Scrambles
// ---------------------------------------------------------------------------------------------

export function randomScramble(length = 25, random: () => number = Math.random): string[] {
  const faces = ['U', 'D', 'R', 'L', 'F', 'B'];
  const moves: string[] = [];
  let previousAxis = -1;
  while (moves.length < length) {
    const face = faces[Math.floor(random() * faces.length)];
    const axis = Math.floor(faces.indexOf(face) / 2);
    if (axis === previousAxis) continue;
    moves.push(formatMove(face, 1 + Math.floor(random() * 3)));
    previousAxis = axis;
  }
  return moves;
}

export const isSolved = (state: string) => normalizeToCenters(state) === SOLVED;
