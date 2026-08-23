/**
 * Move one item to a new position among the rest of the list. `targetIndex` is the index the
 * dragged item should land at within the list of everyone else (0 = first, others.length = last).
 * Always returns a full permutation of `items` — every id in, every id out, exactly once.
 */
export function moveItem<T>(items: T[], getId: (item: T) => string, draggedId: string, targetIndex: number): T[] {
  const dragged = items.find((item) => getId(item) === draggedId);
  if (!dragged) return items;

  const others = items.filter((item) => getId(item) !== draggedId);
  const index = Math.max(0, Math.min(targetIndex, others.length));

  return [...others.slice(0, index), dragged, ...others.slice(index)];
}
