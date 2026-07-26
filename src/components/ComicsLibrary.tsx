'use client';

import { Check, Circle, BookmarkSimple } from '@phosphor-icons/react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { comics } from '@/data/comics';
import styles from './ComicsLibrary.module.css';

type Filter = 'all' | 'read' | 'unread' | 'owned' | 'wishlist';
type Universe = 'dc' | 'marvel';

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'read', label: 'Read' },
  { id: 'unread', label: 'Unread' },
  { id: 'owned', label: 'Owned' },
  { id: 'wishlist', label: 'Wishlist' },
];

export function ComicsLibrary() {
  const [universe, setUniverse] = useState<Universe>('dc');
  const [filter, setFilter] = useState<Filter>('all');
  const [failedCovers, setFailedCovers] = useState<Record<string, boolean>>({});

  const universeComics = useMemo(
    () => comics.filter((comic) => (comic.universe ?? 'dc') === universe),
    [universe],
  );

  const visibleComics = useMemo(() => universeComics.filter((comic) => {
    if (filter === 'read') return comic.read;
    if (filter === 'unread') return !comic.read;
    if (filter === 'owned') return comic.status === 'owned';
    if (filter === 'wishlist') return comic.status === 'wishlist';
    return true;
  }), [filter, universeComics]);

  const readCount = universeComics.filter((comic) => comic.read).length;
  const ownedCount = universeComics.filter((comic) => comic.status === 'owned').length;
  const wishlistCount = universeComics.filter((comic) => comic.status === 'wishlist').length;
  const dcCount = comics.filter((comic) => (comic.universe ?? 'dc') === 'dc').length;
  const marvelCount = comics.filter((comic) => comic.universe === 'marvel').length;

  return (
    <div className={styles.page} data-native-cursor>
      <header className={styles.header}>
        <div className={styles.brandGroup}>
          <Link className={styles.brand} href="/">mic7aelr</Link>
          <span className={styles.sectionLabel}>Comics</span>
        </div>
        <nav className={styles.headerNav} aria-label="Comics navigation">
          <Link href="/#work">Work</Link>
          <Link href="/writing">Writing</Link>
          <Link href="/discovery">Discovery</Link>
        </nav>
        <div className={styles.headerActions}>
          <ThemeToggle className={styles.themeToggle} />
          <Link href="/">Portfolio</Link>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>The long box</p>
            <h1>Comics, collected.</h1>
          </div>
          <div className={styles.heroAside}>
            <p>A working shelf of {universe === 'dc' ? 'DC' : 'Marvel'} stories. A check means read. A yellow mark means the book is not bought and is on the wishlist.</p>
            <dl className={styles.stats}>
              <div><dt>Read</dt><dd>{readCount}</dd></div>
              <div><dt>Owned</dt><dd>{ownedCount}</dd></div>
              <div><dt>Wishlist</dt><dd>{wishlistCount}</dd></div>
            </dl>
          </div>
        </section>

        <nav className={styles.universeTabs} aria-label="Select comics publisher">
          <button
            className={universe === 'dc' ? styles.universeActive : undefined}
            type="button"
            onClick={() => setUniverse('dc')}
            aria-pressed={universe === 'dc'}
          >
            <span>Comics / 01</span>
            <strong>DC</strong>
            <small>{dcCount} books</small>
          </button>
          <button
            className={universe === 'marvel' ? styles.universeActive : undefined}
            type="button"
            onClick={() => setUniverse('marvel')}
            aria-pressed={universe === 'marvel'}
          >
            <span>Comics / 02</span>
            <strong>Marvel</strong>
            <small>{marvelCount} books</small>
          </button>
        </nav>

        <nav className={styles.filters} aria-label="Filter comics">
          {filters.map((item) => (
            <button
              className={filter === item.id ? styles.filterActive : undefined}
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
            >
              {item.label}
            </button>
          ))}
          <span>{visibleComics.length} books</span>
        </nav>

        <div className={styles.grid}>
          {visibleComics.map((comic, index) => {
            const cover = `/images/comics/${comic.id}.jpg`;
            const showImage = !failedCovers[comic.id];
            return (
              <article className={styles.card} key={comic.id}>
                <div className={styles.cover}>
                  {showImage ? (
                    <img
                      src={cover}
                      alt={`Cover of ${comic.title}`}
                      loading={index < 8 ? 'eager' : 'lazy'}
                      onError={() => setFailedCovers((current) => ({ ...current, [comic.id]: true }))}
                    />
                  ) : (
                    <div className={styles.fallbackCover} aria-label={`Cover placeholder for ${comic.title}`}>
                      <span>{comic.universe === 'marvel' ? 'Marvel' : 'DC'}</span>
                      <strong>{comic.title}</strong>
                      <small>{comic.creators}</small>
                    </div>
                  )}
                  <div className={styles.coverStatus}>
                    <span className={comic.read ? styles.read : styles.unread}>
                      {comic.read ? <Check weight="bold" /> : <Circle weight="regular" />}
                      {comic.read ? 'Read' : 'Unread'}
                    </span>
                    <span className={comic.status === 'wishlist' ? styles.wishlist : styles.owned}>
                      {comic.status === 'wishlist' && <BookmarkSimple weight="fill" />}
                      {comic.status === 'wishlist' ? 'Wishlist' : 'Owned'}
                    </span>
                  </div>
                </div>
                <div className={styles.cardCopy}>
                  <p>{comic.category}{comic.year ? ` · ${comic.year}` : ''}</p>
                  <h2>{comic.title}</h2>
                  {comic.creators && <span>{comic.creators}</span>}
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
