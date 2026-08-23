import { describe, expect, it } from 'vitest';
import { moveItem } from './reorder-list';

type Item = { id: string };

const getId = (item: Item) => item.id;
const items = (...ids: string[]): Item[] => ids.map((id) => ({ id }));
const idsOf = (list: Item[]) => list.map(getId);

describe('moveItem', () => {
  it('moves an item to the front', () => {
    const result = moveItem(items('a', 'b', 'c', 'd'), getId, 'c', 0);
    expect(idsOf(result)).toEqual(['c', 'a', 'b', 'd']);
  });

  it('moves an item to the end', () => {
    const result = moveItem(items('a', 'b', 'c', 'd'), getId, 'a', 3);
    expect(idsOf(result)).toEqual(['b', 'c', 'd', 'a']);
  });

  it('moves an item into the middle', () => {
    const result = moveItem(items('a', 'b', 'c', 'd', 'e'), getId, 'e', 2);
    expect(idsOf(result)).toEqual(['a', 'b', 'e', 'c', 'd']);
  });

  it('reproduces the reported Taylor/Gibbs long-distance drag with no data loss', () => {
    // Original board order: Gibbs, Robinson, Chase, Taylor. Drag Taylor (index 3 among
    // "others" after removal, i.e. targetIndex 0) to the very top.
    const board = items('gibbs', 'robinson', 'chase', 'taylor');
    const result = moveItem(board, getId, 'taylor', 0);
    expect(idsOf(result)).toEqual(['taylor', 'gibbs', 'robinson', 'chase']);
    expect(result).toHaveLength(4);
    expect(new Set(idsOf(result)).size).toBe(4);
  });

  it('is a no-op when the dragged id is not in the list', () => {
    const board = items('a', 'b', 'c');
    const result = moveItem(board, getId, 'not-here', 1);
    expect(result).toBe(board);
  });

  it('clamps a negative target index to the front', () => {
    const result = moveItem(items('a', 'b', 'c'), getId, 'c', -5);
    expect(idsOf(result)).toEqual(['c', 'a', 'b']);
  });

  it('clamps an out-of-range target index to the end', () => {
    const result = moveItem(items('a', 'b', 'c'), getId, 'a', 999);
    expect(idsOf(result)).toEqual(['b', 'c', 'a']);
  });

  it('handles a single-item list', () => {
    const result = moveItem(items('only'), getId, 'only', 0);
    expect(idsOf(result)).toEqual(['only']);
  });

  it('handles an empty list', () => {
    const result = moveItem(items(), getId, 'missing', 0);
    expect(result).toEqual([]);
  });

  it('is always a full permutation for every possible target index and start position', () => {
    const size = 12;
    const base = items(...Array.from({ length: size }, (_, i) => `p${i}`));

    for (let dragIndex = 0; dragIndex < size; dragIndex += 1) {
      for (let target = 0; target <= size - 1; target += 1) {
        const draggedId = `p${dragIndex}`;
        const result = moveItem(base, getId, draggedId, target);
        expect(result, `dragIndex=${dragIndex} target=${target}`).toHaveLength(size);
        expect(new Set(idsOf(result)).size, `dragIndex=${dragIndex} target=${target}`).toBe(size);
      }
    }
  });
});
