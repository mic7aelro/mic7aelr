/**
 * Practice scrambles. Each preset builds a cube that starts in a known stage of CFOP.
 * The builder runs the verified tables backward, so the preset is exact.
 */

import { invertAlg, randomScramble, formatMove, parseToken } from './cube';
import { buildTables, type Candidate } from './cfop-tables';

export type PresetId = 'random' | 'last-layer' | 'coll' | 'winter';

export interface Preset {
  id: PresetId;
  label: string;
  description: string;
  /** True when the cross must stay on the bottom, because the cube starts after the cross. */
  keepsCross: boolean;
}

export const PRESETS: Preset[] = [
  { id: 'random', label: 'Random scramble', description: '25 random face turns.', keepsCross: false },
  { id: 'last-layer', label: 'Last layer', description: 'The first two layers are solved. OLL and PLL remain.', keepsCross: true },
  { id: 'coll', label: 'COLL case', description: 'The first two layers are solved and all edges are oriented. COLL then EPLL remain.', keepsCross: true },
  { id: 'winter', label: 'Winter Variation', description: 'One connected pair remains and three top edges are oriented.', keepsCross: true },
];

/** Merge neighbouring turns of the same face so the scramble stays short. */
export function simplifyFaceTurns(moves: readonly string[]): string[] {
  const output: { name: string; turns: number }[] = [];
  for (const token of moves) {
    const { name, turns } = parseToken(token);
    const last = output[output.length - 1];
    if (last && last.name === name && /^[URFDLB]$/.test(name)) {
      last.turns = (last.turns + turns) % 4;
      if (last.turns === 0) output.pop();
    } else {
      output.push({ name, turns });
    }
  }
  return output.map(({ name, turns }) => formatMove(name, turns));
}

const pickOne = <T,>(items: readonly T[], random: () => number): T => items[Math.floor(random() * items.length)];

function anyCandidate(table: Map<string, Candidate[]>, random: () => number, accept: (candidate: Candidate) => boolean = () => true): Candidate {
  const keys = [...table.keys()];
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const candidate = pickOne(table.get(pickOne(keys, random)) as Candidate[], random);
    if (accept(candidate)) return candidate;
  }
  throw new Error('No candidate found.');
}

/** Cases that only permute the edges. COLL leaves one of these. */
const EDGE_ONLY = new Set(['pll-h', 'pll-ua', 'pll-ub', 'pll-z']);

export function buildPreset(id: PresetId, random: () => number = Math.random): string[] {
  if (id === 'random') return randomScramble(25, random);
  const tables = buildTables();
  const pll = anyCandidate(tables.pll, random);
  if (id === 'last-layer') {
    const oll = anyCandidate(tables.oll, random);
    return simplifyFaceTurns(invertAlg([...oll.moves, ...pll.moves]));
  }
  if (id === 'coll') {
    const coll = anyCandidate(tables.coll, random);
    const edges = anyCandidate(tables.pll, random, (candidate) => EDGE_ONLY.has(candidate.caseId));
    return simplifyFaceTurns(invertAlg([...coll.moves, ...edges.moves]));
  }
  const winter = anyCandidate(tables.wv, random);
  return simplifyFaceTurns(invertAlg([...winter.moves, ...pll.moves]));
}
