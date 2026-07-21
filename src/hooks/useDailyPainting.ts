'use client';

import { useEffect, useState } from 'react';
import paintings from '../../public/images/paintings/paintings.json';

export type Painting = (typeof paintings)[number];

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function getDailyIndex(date: Date) {
  const dayNumber = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
  return dayNumber % paintings.length;
}

export function useDailyPainting() {
  const [paintingIndex, setPaintingIndex] = useState(0);
  const [debugEnabled, setDebugEnabled] = useState(false);

  useEffect(() => {
    const dailyIndex = getDailyIndex(new Date());
    const url = new URL(window.location.href);
    const isLocalHost = LOCAL_HOSTS.has(window.location.hostname);
    const requestedPainting = isLocalHost ? url.searchParams.get('painting') : null;

    if (!isLocalHost && url.searchParams.has('painting')) {
      url.searchParams.delete('painting');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }

    if (requestedPainting === 'debug') {
      setDebugEnabled(true);
      setPaintingIndex(dailyIndex);
      return;
    }

    const requestedIndex = paintings.findIndex(({ slug }) => slug === requestedPainting);
    setPaintingIndex(requestedIndex >= 0 ? requestedIndex : dailyIndex);
  }, []);

  const previousPainting = () => {
    setPaintingIndex((current) => (current - 1 + paintings.length) % paintings.length);
  };

  const nextPainting = () => {
    setPaintingIndex((current) => (current + 1) % paintings.length);
  };

  return {
    painting: paintings[paintingIndex] ?? paintings[0],
    paintingIndex,
    paintingCount: paintings.length,
    debugEnabled,
    previousPainting,
    nextPainting,
  };
}
