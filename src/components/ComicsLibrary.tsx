'use client';

import { BookmarkSimple, CaretLeft, CaretRight, Check, Circle, Plus, X } from '@phosphor-icons/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { type Comic } from '@/data/comics';
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

type ComicsLibraryProps = {
  initialComics: Comic[];
  authenticated: boolean;
};

export function ComicsLibrary({ initialComics, authenticated }: ComicsLibraryProps) {
  const router = useRouter();
  const [library, setLibrary] = useState(initialComics);
  const [universe, setUniverse] = useState<Universe>('dc');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
  const [addingComic, setAddingComic] = useState(false);
  const [savingComic, setSavingComic] = useState(false);
  const [comicError, setComicError] = useState('');
  const [failedCovers, setFailedCovers] = useState<Record<string, boolean>>({});
  const [signingIn, setSigningIn] = useState(false);
  const [signInPending, setSignInPending] = useState(false);
  const [signInError, setSignInError] = useState('');

  useEffect(() => {
    if (!selectedComic && !addingComic && !signingIn) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedComic(null);
        setAddingComic(false);
        setSigningIn(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [addingComic, selectedComic, signingIn]);

  const universeComics = useMemo(
    () => library.filter((comic) => (comic.universe ?? 'dc') === universe),
    [library, universe],
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
  const dcCount = library.filter((comic) => (comic.universe ?? 'dc') === 'dc').length;
  const marvelCount = library.filter((comic) => comic.universe === 'marvel').length;
  const selectedIndex = selectedComic
    ? visibleComics.findIndex((comic) => comic.id === selectedComic.id)
    : -1;

  const selectAdjacentComic = (direction: -1 | 1) => {
    if (selectedIndex < 0 || visibleComics.length < 2) return;
    const nextIndex = (selectedIndex + direction + visibleComics.length) % visibleComics.length;
    setSelectedComic(visibleComics[nextIndex]);
  };

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignInPending(true);
    setSignInError('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch('/api/writing/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    setSignInPending(false);
    if (!response.ok) {
      setSignInError(data.error || 'The sign-in failed.');
      return;
    }
    setSigningIn(false);
    router.refresh();
  };

  const signOut = async () => {
    await fetch('/api/writing/auth', { method: 'DELETE' });
    setSelectedComic(null);
    setAddingComic(false);
    router.refresh();
  };

  const updateComic = async (update: { read?: boolean; status?: Comic['status'] }) => {
    if (!selectedComic) return;
    setComicError('');
    const response = await fetch('/api/comics', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedComic.id, ...update }),
    });
    const data = await response.json();
    if (!response.ok) {
      setComicError(data.error || 'The comic could not be updated.');
      return;
    }
    const applyUpdate = (comic: Comic) => comic.id === selectedComic.id ? { ...comic, ...update } : comic;
    setLibrary((current) => current.map(applyUpdate));
    setSelectedComic((current) => current ? { ...current, ...update } : current);
  };

  const addComic = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingComic(true);
    setComicError('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch('/api/comics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        read: values.read === 'on',
      }),
    });
    const data = await response.json();
    setSavingComic(false);
    if (!response.ok) {
      setComicError(data.error || 'The comic could not be added.');
      return;
    }
    setLibrary((current) => [...current, data.comic]);
    setUniverse(data.comic.universe);
    setFilter('all');
    setAddingComic(false);
    setSelectedComic(data.comic);
  };

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
          {authenticated ? (
            <button className={styles.authButton} type="button" onClick={signOut}>Sign out</button>
          ) : (
            <button className={styles.authButton} type="button" onClick={() => { setSignInError(''); setSigningIn(true); }}>Author login</button>
          )}
          <Link className={styles.portfolioLink} href="/">Portfolio</Link>
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
          {authenticated && (
            <button className={styles.addComicButton} type="button" onClick={() => setAddingComic(true)}>
              <Plus weight="bold" />
              Add comic
            </button>
          )}
          <span>{visibleComics.length} books</span>
        </nav>

        <div className={styles.grid}>
          {visibleComics.map((comic, index) => {
            const cover = `/images/comics/${comic.id}.jpg`;
            const showImage = !failedCovers[comic.id];
            return (
              <article className={styles.card} key={comic.id}>
                <button
                  className={styles.cardButton}
                  type="button"
                  onClick={() => setSelectedComic(comic)}
                  aria-label={`Open details for ${comic.title}`}
                >
                  <div className={styles.cover}>
                    {showImage ? (
                      <img
                        className={comic.id === 'swamp-thing' ? styles.containCover : undefined}
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
                    <p>{comic.category}{comic.year ? ` / ${comic.year}` : ''}</p>
                    <h2>{comic.title}</h2>
                    {comic.creators && <span>{comic.creators}</span>}
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      </main>

      {selectedComic && (
        <div
          className={styles.detailBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedComic(null);
          }}
        >
          <aside
            className={styles.detailPanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="comic-detail-title"
          >
            <button
              className={`${styles.detailArrow} ${styles.detailPrevious}`}
              type="button"
              onClick={() => selectAdjacentComic(-1)}
              aria-label="Open previous comic"
              disabled={visibleComics.length < 2}
            >
              <CaretLeft weight="regular" />
            </button>
            <button
              className={`${styles.detailArrow} ${styles.detailNext}`}
              type="button"
              onClick={() => selectAdjacentComic(1)}
              aria-label="Open next comic"
              disabled={visibleComics.length < 2}
            >
              <CaretRight weight="regular" />
            </button>

            <header className={styles.detailHeader}>
              <span>Comic details</span>
              <button
                type="button"
                onClick={() => setSelectedComic(null)}
                aria-label="Close comic details"
                autoFocus
              >
                <X weight="regular" />
              </button>
            </header>

            <div className={styles.detailBody} data-lenis-prevent>
              <div className={styles.detailCover}>
                {!failedCovers[selectedComic.id] ? (
                  <img
                    className={selectedComic.id === 'swamp-thing' ? styles.containCover : undefined}
                    src={`/images/comics/${selectedComic.id}.jpg`}
                    alt={`Cover of ${selectedComic.title}`}
                    onError={() => setFailedCovers((current) => ({
                      ...current,
                      [selectedComic.id]: true,
                    }))}
                  />
                ) : (
                  <div className={styles.fallbackCover}>
                    <span>{selectedComic.universe === 'marvel' ? 'Marvel' : 'DC'}</span>
                    <strong>{selectedComic.title}</strong>
                    <small>{selectedComic.creators}</small>
                  </div>
                )}
              </div>

              <div className={styles.detailCopy}>
                <p className={styles.detailMeta}>
                  {selectedComic.category}
                  {selectedComic.year ? ` / ${selectedComic.year}` : ''}
                </p>
                <h2 id="comic-detail-title">{selectedComic.title}</h2>
                {selectedComic.creators && (
                  <p className={styles.detailCreators}>{selectedComic.creators}</p>
                )}
                <p className={styles.detailDescription}>
                  {selectedComic.description
                    ?? selectedComic.collects
                    ?? 'A description has not been added for this book.'}
                </p>

                <dl className={styles.detailStatus}>
                  {selectedComic.writers && (
                    <div>
                      <dt>Writer{selectedComic.writers.includes(',') || selectedComic.writers.includes('&') ? 's' : ''}</dt>
                      <dd>{selectedComic.writers}</dd>
                    </div>
                  )}
                  {selectedComic.artists && (
                    <div>
                      <dt>Artist{selectedComic.artists.includes(',') || selectedComic.artists.includes('&') ? 's' : ''}</dt>
                      <dd>{selectedComic.artists}</dd>
                    </div>
                  )}
                  {selectedComic.collects && (
                    <div className={styles.detailCollection}>
                      <dt>Collects</dt>
                      <dd>{selectedComic.collects}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Reading</dt>
                    <dd>
                      {selectedComic.read ? <Check weight="bold" /> : <Circle weight="regular" />}
                      {selectedComic.read ? 'Read' : 'Unread'}
                    </dd>
                  </div>
                  <div>
                    <dt>Collection</dt>
                    <dd className={selectedComic.status === 'wishlist' ? styles.detailWishlist : undefined}>
                      {selectedComic.status === 'wishlist' && <BookmarkSimple weight="fill" />}
                      {selectedComic.status === 'wishlist' ? 'Wishlist' : 'Owned'}
                    </dd>
                  </div>
                </dl>
                {authenticated && (
                  <div className={styles.ownerControls}>
                    <p>Owner controls</p>
                    <div>
                      <button type="button" onClick={() => updateComic({ read: !selectedComic.read })}>
                        {selectedComic.read ? 'Mark unread' : 'Mark read'}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateComic({
                          status: selectedComic.status === 'owned' ? 'wishlist' : 'owned',
                        })}
                      >
                        {selectedComic.status === 'owned' ? 'Move to wishlist' : 'Mark owned'}
                      </button>
                    </div>
                  </div>
                )}
                {comicError && <p className={styles.comicError}>{comicError}</p>}
              </div>
            </div>
          </aside>
        </div>
      )}

      {addingComic && (
        <div className={styles.detailBackdrop} role="presentation">
          <section className={`${styles.detailPanel} ${styles.addComicPanel}`} role="dialog" aria-modal="true" aria-labelledby="add-comic-title">
            <header className={styles.detailHeader}>
              <span>Claude catalog assistant</span>
              <button type="button" onClick={() => setAddingComic(false)} aria-label="Close add comic form">
                <X weight="regular" />
              </button>
            </header>
            <form className={styles.addComicForm} onSubmit={addComic} data-lenis-prevent>
              <div>
                <p className={styles.detailMeta}>New collected edition</p>
                <h2 id="add-comic-title">Add a comic.</h2>
                <p>Enter the exact edition title. Claude will create the description and catalog details. Review the saved details after Claude adds the comic.</p>
              </div>
              <label>
                Comic title
                <input name="title" required maxLength={180} placeholder="Batman: Year One" />
              </label>
              <label>
                Edition notes
                <textarea name="notes" maxLength={2000} placeholder="Optional ISBN, volume, or edition details" />
              </label>
              <div className={styles.addComicOptions}>
                <label>
                  Publisher
                  <select name="universe" defaultValue={universe}>
                    <option value="dc">DC</option>
                    <option value="marvel">Marvel</option>
                  </select>
                </label>
                <label>
                  Collection
                  <select name="status" defaultValue="owned">
                    <option value="owned">Owned</option>
                    <option value="wishlist">Wishlist</option>
                  </select>
                </label>
              </div>
              <label className={styles.readCheckbox}>
                <input name="read" type="checkbox" />
                I have read this comic.
              </label>
              {comicError && <p className={styles.comicError}>{comicError}</p>}
              <button className={styles.createComicButton} type="submit" disabled={savingComic}>
                {savingComic ? 'Claude is creating details…' : 'Create with Claude'}
              </button>
            </form>
          </section>
        </div>
      )}

      {signingIn && (
        <div
          className={styles.detailBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSigningIn(false);
          }}
        >
          <section
            className={`${styles.detailPanel} ${styles.addComicPanel}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="comics-login-title"
          >
            <header className={styles.detailHeader}>
              <span>Author access</span>
              <button type="button" onClick={() => setSigningIn(false)} aria-label="Close the login form">
                <X weight="regular" />
              </button>
            </header>
            <form className={styles.addComicForm} onSubmit={signIn} data-lenis-prevent>
              <div>
                <p className={styles.detailMeta}>One login for the whole site</p>
                <h2 id="comics-login-title">Author login.</h2>
                <p>Use the credentials stored in the server environment. The session stays active on the comics pages and the writing pages.</p>
              </div>
              <label>
                Username
                <input name="username" autoComplete="username" required maxLength={100} autoFocus />
              </label>
              <label>
                Password
                <input name="password" type="password" autoComplete="current-password" required maxLength={300} />
              </label>
              {signInError && <p className={styles.comicError}>{signInError}</p>}
              <button className={styles.createComicButton} type="submit" disabled={signInPending}>
                {signInPending ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
