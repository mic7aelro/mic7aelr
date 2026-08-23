'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { moveItem } from './reorder-list';

type DragReorderOptions<T> = {
  items: T[];
  getId: (item: T) => string;
  onReorder: (next: T[]) => void;
  onCommit?: (next: T[]) => void;
  disabled?: boolean;
};

/** Pointer-based drag-to-reorder for a vertical list of rows. Works with mouse and touch. */
export function useDragReorder<T>({ items, getId, onReorder, onCommit, disabled }: DragReorderOptions<T>) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const rowRefs = useRef(new Map<string, HTMLElement>());
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const draggingIdRef = useRef<string | null>(null);
  const preFlipRectsRef = useRef<Map<string, DOMRect> | null>(null);

  const registerRow = useCallback((id: string) => (element: HTMLElement | null) => {
    if (element) rowRefs.current.set(id, element);
    else rowRefs.current.delete(id);
  }, []);

  const reorderAt = useCallback((clientY: number, draggedId: string) => {
    const current = itemsRef.current;
    const others = current.filter((item) => getId(item) !== draggedId);

    let index = others.length;
    for (let i = 0; i < others.length; i += 1) {
      const el = rowRefs.current.get(getId(others[i]));
      if (!el || clientY < el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2) {
        index = i;
        break;
      }
    }

    const next = moveItem(current, getId, draggedId, index);
    const currentIds = current.map(getId);
    const changed = next.some((item, i) => getId(item) !== currentIds[i]);
    if (changed) {
      // Capture "first" rects (FLIP) so the layout effect can slide the other rows
      // smoothly into their new spots instead of snapping there instantly.
      const rects = new Map<string, DOMRect>();
      rowRefs.current.forEach((el, id) => rects.set(id, el.getBoundingClientRect()));
      preFlipRectsRef.current = rects;
      onReorder(next);
    }
  }, [getId, onReorder]);

  useLayoutEffect(() => {
    const before = preFlipRectsRef.current;
    if (!before) return;
    preFlipRectsRef.current = null;

    rowRefs.current.forEach((el, id) => {
      if (id === draggingIdRef.current) return;
      const previousRect = before.get(id);
      if (!previousRect) return;
      const currentRect = el.getBoundingClientRect();
      const deltaY = previousRect.top - currentRect.top;
      if (Math.abs(deltaY) < 0.5) return;

      el.style.transition = 'none';
      el.style.transform = `translateY(${deltaY}px)`;
      // eslint-disable-next-line no-unused-expressions -- forces a reflow so the transition below animates
      el.getBoundingClientRect();
      el.style.transition = 'transform 160ms ease';
      el.style.transform = '';
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const startDrag = useCallback((id: string) => (event: ReactPointerEvent<HTMLElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingIdRef.current = id;
    setDraggingId(id);
  }, [disabled]);

  const handleMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (!draggingIdRef.current) return;
    reorderAt(event.clientY, draggingIdRef.current);
  }, [reorderAt]);

  const finishDrag = useCallback(() => {
    if (!draggingIdRef.current) return;
    draggingIdRef.current = null;
    setDraggingId(null);
    onCommit?.(itemsRef.current);
  }, [onCommit]);

  const endDrag = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishDrag();
  }, [finishDrag]);

  // Safety net: if the row's own pointerup/pointercancel is ever missed (the row can move out
  // from under the cursor mid-drag as the list reorders), this guarantees the drag still ends
  // and gets saved instead of leaving a row stuck in its "lifted" dragging state.
  useEffect(() => {
    if (!draggingId) return undefined;
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);
    return () => {
      window.removeEventListener('pointerup', finishDrag);
      window.removeEventListener('pointercancel', finishDrag);
    };
  }, [draggingId, finishDrag]);

  return { draggingId, registerRow, startDrag, handleMove, endDrag };
}
