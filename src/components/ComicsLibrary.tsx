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

type ComicCandidate = {
  isbn: string;
  title: string;
  authors: string;
  year: string;
  publisher: string;
  cover: string;
};

type BulkCandidate = {
  link: string; isbn: string; title: string; year: string;
  writers: string; artists: string; cover: string; found: boolean; note: string;
  keep: boolean;
};

type Draft = {
  title: string; description: string; year: string; category: string;
  writers: string; artists: string; collects: string; cover: string; link: string;
  universe: Universe;
};

const emptyDraft: Draft = {
  title: '', description: '', year: '', category: '',
  writers: '', artists: '', collects: '', cover: '', link: '', universe: 'dc',
};

type ComicsLibraryProps = {
  initialComics: Comic[];
  authenticated: boolean;
};

export function ComicsLibrary({ initialComics, authenticated }: ComicsLibraryProps) {
  const router = useRouter();
  const [library, setLibrary] = useState(initialComics);
  const [universe, setUniverse] = useState<Universe>('dc');
  const [filter, setFilter] = useState<Filter>('all');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
  const [addingComic, setAddingComic] = useState(false);
  const [savingComic, setSavingComic] = useState(false);
  const [comicError, setComicError] = useState('');
  const [failedCovers, setFailedCovers] = useState<Record<string, boolean>>({});
  // A cover whose shape differs from the 2:3 card gets cropped by object-fit:
  // cover, which cuts the logo or the figure. Measure the image and switch that
  // cover to object-fit: contain.
  const [containCovers, setContainCovers] = useState<Record<string, boolean>>({});
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResults, setLookupResults] = useState<ComicCandidate[]>([]);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupNote, setLookupNote] = useState('');
  const [draft, setDraft] = useState(emptyDraft);
  const [editingComic, setEditingComic] = useState<Comic | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkLinks, setBulkLinks] = useState('');
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [bulkCandidates, setBulkCandidates] = useState<BulkCandidate[]>([]);
  const [bulkUniverse, setBulkUniverse] = useState<Universe>('dc');
  const [bulkStatus, setBulkStatus] = useState<'owned' | 'wishlist'>('owned');
  const [signingIn, setSigningIn] = useState(false);
  const [signInPending, setSignInPending] = useState(false);
  const [signInError, setSignInError] = useState('');

  useEffect(() => {
    if (!selectedComic && !addingComic && !signingIn && !editingComic && !bulkOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedComic(null);
        setAddingComic(false);
        setSigningIn(false);
        setEditingComic(null);
        setBulkOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [addingComic, bulkOpen, editingComic, selectedComic, signingIn]);

  const seriesTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const comic of library) {
      if (!comic.series) continue;
      totals.set(comic.series, (totals.get(comic.series) ?? 0) + 1);
    }
    return totals;
  }, [library]);

  const categories = useMemo(() => {
    const seen = new Map<string, number>();
    for (const comic of library) {
      if ((comic.universe ?? 'dc') !== universe) continue;
      seen.set(comic.category, (seen.get(comic.category) ?? 0) + 1);
    }
    return [...seen.entries()].sort((left, right) => right[1] - left[1]);
  }, [library, universe]);

  const selectUniverse = (next: Universe) => {
    setUniverse(next);
    setCategory('all');
  };

  const universeComics = useMemo(
    () => library.filter((comic) => (comic.universe ?? 'dc') === universe),
    [library, universe],
  );

  const visibleComics = useMemo(() => {
    const term = search.trim().toLowerCase();
    return universeComics.filter((comic) => {
      if (category !== 'all' && comic.category !== category) return false;
      if (term) {
        const haystack = [comic.title, comic.creators, comic.writers, comic.artists, comic.collects]
          .filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (filter === 'read') return comic.read;
      if (filter === 'unread') return !comic.read;
      if (filter === 'owned') return comic.status === 'owned';
      if (filter === 'wishlist') return comic.status === 'wishlist';
      return true;
    });
  }, [category, filter, search, universeComics]);

  const readCount = universeComics.filter((comic) => comic.read).length;
  const ownedCount = universeComics.filter((comic) => comic.status === 'owned').length;
  const wishlistCount = universeComics.filter((comic) => comic.status === 'wishlist').length;
  const dcCount = library.filter((comic) => (comic.universe ?? 'dc') === 'dc').length;
  const marvelCount = library.filter((comic) => comic.universe === 'marvel').length;
  const selectedIndex = selectedComic
    ? visibleComics.findIndex((comic) => comic.id === selectedComic.id)
    : -1;

  const measureCover = (id: string) => (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    if (!image.naturalWidth || !image.naturalHeight) return;
    const ratio = image.naturalWidth / image.naturalHeight;
    if (Math.abs(ratio - 2 / 3) > 0.04) setContainCovers((current) => ({ ...current, [id]: true }));
  };

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

  const setField = (name: keyof Draft) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDraft((current) => ({ ...current, [name]: event.target.value }));

  const applyBook = (book: Partial<Draft>, note: string) => {
    // Keep any value you already typed. The lookup only fills empty fields.
    setDraft((current) => ({
      ...current,
      title: current.title || book.title || '',
      year: current.year || book.year || '',
      writers: current.writers || book.writers || '',
      artists: current.artists || book.artists || '',
      cover: book.cover || current.cover,
    }));
    setLookupResults([]);
    setLookupNote(note);
  };

  const runLookup = async () => {
    const query = lookupQuery.trim();
    if (!query || lookupBusy) return;
    // Keep an Amazon link as the purchase link for this comic.
    if (/^https:\/\//.test(query)) setDraft((current) => ({ ...current, link: current.link || query }));
    setLookupBusy(true);
    setLookupNote('');
    setLookupResults([]);
    const response = await fetch(`/api/comics/lookup?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    setLookupBusy(false);
    if (!response.ok) {
      setLookupNote(data.error || 'The lookup failed.');
      return;
    }
    if (data.kind === 'book') {
      applyBook(data.book, 'Filled the empty fields from Open Library. Check every value before you save.');
      return;
    }
    if (!data.results.length) {
      setLookupNote('Open Library returned no match. Enter the details by hand.');
      return;
    }
    setLookupResults(data.results);
  };

  const selectCandidate = async (candidate: ComicCandidate) => {
    setLookupBusy(true);
    setLookupNote('');
    const response = await fetch(`/api/comics/lookup?q=${encodeURIComponent(candidate.isbn)}`);
    const data = await response.json();
    setLookupBusy(false);
    if (!response.ok || data.kind !== 'book') {
      // Fall back to the values the search result already carries.
      applyBook({ title: candidate.title, year: candidate.year, writers: candidate.authors, cover: candidate.cover },
        'Filled from the search result. Check every value before you save.');
      return;
    }
    applyBook(data.book, 'Filled the empty fields from Open Library. Check every value before you save.');
  };

  const runBulkLookup = async () => {
    if (bulkBusy || !bulkLinks.trim()) return;
    setBulkBusy(true);
    setBulkError('');
    setBulkCandidates([]);
    const response = await fetch('/api/comics/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ links: bulkLinks }),
    });
    const data = await response.json();
    setBulkBusy(false);
    if (!response.ok) {
      setBulkError(data.error || 'The lookup failed.');
      return;
    }
    setBulkCandidates((data.candidates as BulkCandidate[]).map((item) => ({ ...item, keep: true })));
    if (data.skipped) setBulkError(`This form reads 20 links at a time. It skipped ${data.skipped}.`);
  };

  const saveBulk = async () => {
    const chosen = bulkCandidates.filter((item) => item.keep && item.title.trim());
    if (!chosen.length || bulkSaving) return;
    setBulkSaving(true);
    setBulkError('');
    const added: Comic[] = [];
    for (const item of chosen) {
      const response = await fetch('/api/comics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title, year: item.year, writers: item.writers, artists: item.artists,
          cover: item.cover, link: item.link, universe: bulkUniverse, status: bulkStatus, read: false,
        }),
      });
      const data = await response.json();
      if (response.ok) added.push(data.comic);
    }
    setBulkSaving(false);
    if (!added.length) {
      setBulkError('No comic was saved.');
      return;
    }
    setLibrary((current) => [...current, ...added]);
    setUniverse(bulkUniverse);
    setFilter('all');
    setCategory('all');
    setBulkOpen(false);
    setBulkLinks('');
    setBulkCandidates([]);
  };

  const openEditor = (comic: Comic) => {
    setDraft({
      title: comic.title || '', description: comic.description || '', year: comic.year || '',
      category: comic.category || '', writers: comic.writers || '', artists: comic.artists || '',
      collects: comic.collects || '', cover: comic.cover || '', link: comic.link || '',
      universe: (comic.universe ?? 'dc') as Universe,
    });
    setLookupQuery('');
    setLookupResults([]);
    setLookupNote('');
    setComicError('');
    setEditingComic(comic);
  };

  const saveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingComic) return;
    setSavingComic(true);
    setComicError('');
    const response = await fetch('/api/comics', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingComic.id, ...draft }),
    });
    const data = await response.json();
    setSavingComic(false);
    if (!response.ok) {
      setComicError(data.error || 'The comic could not be saved.');
      return;
    }
    const saved: Partial<Comic> = { ...draft };
    const apply = (comic: Comic) => comic.id === editingComic.id ? { ...comic, ...saved } : comic;
    setLibrary((current) => current.map(apply));
    setSelectedComic((current) => current && current.id === editingComic.id ? { ...current, ...saved } : current);
    setEditingComic(null);
    setDraft(emptyDraft);
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
        ...draft,
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
    setDraft(emptyDraft);
    setLookupQuery('');
    setLookupNote('');
    setUniverse(data.comic.universe);
    setFilter('all');
    setAddingComic(false);
    setSelectedComic(data.comic);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandGroup}>
          <Link className={styles.brand} href="/">mic7aelr</Link>
          <span className={styles.sectionLabel}>Comics</span>
        </div>
        <nav className={styles.headerNav} aria-label="Comics navigation">
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
            <div className={styles.progress}>
              <div className={styles.progressHead}>
                <span>Reading progress</span>
                <strong>{readCount} of {universeComics.length}</strong>
              </div>
              <div
                className={styles.progressTrack}
                role="progressbar"
                aria-valuenow={readCount}
                aria-valuemin={0}
                aria-valuemax={universeComics.length}
                aria-label={`Read ${readCount} of ${universeComics.length} books`}
              >
                <span style={{ width: `${universeComics.length ? (readCount / universeComics.length) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </section>

        <nav className={styles.universeTabs} aria-label="Select comics publisher">
          <button
            className={universe === 'dc' ? styles.universeActive : undefined}
            type="button"
            onClick={() => selectUniverse('dc')}
            aria-pressed={universe === 'dc'}
          >
            <span>Comics / 01</span>
            <strong>DC</strong>
            <small>{dcCount} books</small>
          </button>
          <button
            className={universe === 'marvel' ? styles.universeActive : undefined}
            type="button"
            onClick={() => selectUniverse('marvel')}
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
          {authenticated && (
            <button className={styles.addComicButton} type="button" onClick={() => { setBulkError(''); setBulkOpen(true); }}>
              Add several
            </button>
          )}
          <span>{visibleComics.length} books</span>
        </nav>

        <div className={styles.toolbar}>
          <div className={styles.searchField}>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search a title, a writer, or an artist"
              aria-label="Search the comics"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear the search">
                <X weight="regular" />
              </button>
            )}
          </div>
          <nav className={styles.categories} aria-label="Filter by category">
            <button
              type="button"
              className={category === 'all' ? styles.categoryActive : undefined}
              aria-pressed={category === 'all'}
              onClick={() => setCategory('all')}
            >
              All categories
            </button>
            {categories.map(([name, total]) => (
              <button
                key={name}
                type="button"
                className={category === name ? styles.categoryActive : undefined}
                aria-pressed={category === name}
                onClick={() => setCategory(name)}
              >
                {name} <small>{total}</small>
              </button>
            ))}
          </nav>
        </div>

        {visibleComics.length === 0 && (
          <p className={styles.emptyResult}>No comic matches the current filters.</p>
        )}

        <div className={styles.grid}>
          {visibleComics.map((comic, index) => {
            const cover = comic.cover || `/images/comics/${comic.id}.jpg`;
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
                        className={containCovers[comic.id] ? styles.containCover : undefined}
                        src={cover}
                        alt={`Cover of ${comic.title}`}
                        loading={index < 8 ? 'eager' : 'lazy'}
                        onLoad={measureCover(comic.id)}
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
                    {typeof comic.goodreadsRating === 'number' && (
                      <span className={styles.scoreTag}>{comic.goodreadsRating.toFixed(2)}<small>/5</small></span>
                    )}
                    {comic.series && comic.order ? (
                      <span className={styles.seriesTag}>
                        {comic.series} · {comic.order} of {seriesTotals.get(comic.series) ?? comic.order}
                      </span>
                    ) : null}
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
                    className={containCovers[selectedComic.id] ? styles.containCover : undefined}
                    src={selectedComic.cover || `/images/comics/${selectedComic.id}.jpg`}
                    alt={`Cover of ${selectedComic.title}`}
                    onLoad={measureCover(selectedComic.id)}
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
                  {typeof selectedComic.goodreadsRating === 'number' && (
                    <div>
                      <dt>Goodreads</dt>
                      <dd className={styles.ratingValue}>
                        <strong>{selectedComic.goodreadsRating.toFixed(2)}</strong><small>/5</small>
                        {typeof selectedComic.goodreadsCount === 'number' && (
                          <span>{selectedComic.goodreadsCount.toLocaleString('en')} ratings</span>
                        )}
                      </dd>
                    </div>
                  )}
                  {selectedComic.series && (
                    <div>
                      <dt>Series</dt>
                      <dd>
                        {selectedComic.series}
                        {selectedComic.order
                          ? ` · Book ${selectedComic.order} of ${seriesTotals.get(selectedComic.series) ?? selectedComic.order}`
                          : ''}
                      </dd>
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
                {selectedComic.link && (
                  <a
                    className={styles.buyLink}
                    href={selectedComic.link}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Where to buy
                  </a>
                )}
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
                      <button type="button" onClick={() => openEditor(selectedComic)}>Edit entry</button>
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
              <span>New comic</span>
              <button type="button" onClick={() => setAddingComic(false)} aria-label="Close add comic form">
                <X weight="regular" />
              </button>
            </header>
            <form className={styles.addComicForm} onSubmit={addComic} data-lenis-prevent>
              <div>
                <p className={styles.detailMeta}>New collected edition</p>
                <h2 id="add-comic-title">Add a comic.</h2>
                <p>Search for the book, or paste an Amazon link or an ISBN. Open Library fills the empty fields that it can. Check every value before you save.</p>
              </div>

              <div className={styles.lookupField}>
                <label htmlFor="comic-lookup">Find the book</label>
                <div className={styles.lookupRow}>
                  <input
                    id="comic-lookup"
                    value={lookupQuery}
                    onChange={(event) => setLookupQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') { event.preventDefault(); void runLookup(); }
                    }}
                    maxLength={200}
                    placeholder="Batman: Year One, an ISBN, or an Amazon link"
                  />
                  <button type="button" onClick={() => void runLookup()} disabled={lookupBusy || !lookupQuery.trim()}>
                    {lookupBusy ? 'Searching…' : 'Search'}
                  </button>
                </div>
                <p className={styles.lookupHint}>Results include reprints and translations. Check the publisher before you select an edition. The year is the year of the printing, not the year of the first release.</p>
                {lookupNote && <p className={styles.lookupNote}>{lookupNote}</p>}
                {lookupResults.length > 0 && (
                  <ul className={styles.lookupResults}>
                    {lookupResults.map((candidate) => (
                      <li key={candidate.isbn}>
                        <button type="button" onClick={() => void selectCandidate(candidate)}>
                          <img src={candidate.cover} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} />
                          <span>
                            <strong>{candidate.title}</strong>
                            <small>{[candidate.authors, candidate.year, candidate.publisher].filter(Boolean).join(' / ')}</small>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <label>
                Comic title
                <input value={draft.title} onChange={setField('title')} required maxLength={180} placeholder="Batman: Year One" />
              </label>
              <label>
                Description
                <textarea value={draft.description} onChange={setField('description')} maxLength={600} placeholder="A short, spoiler-free summary" />
              </label>
              <div className={styles.addComicOptions}>
                <label>
                  Year
                  <input value={draft.year} onChange={setField('year')} maxLength={40} placeholder="1987" />
                </label>
                <label>
                  Category
                  <input value={draft.category} onChange={setField('category')} maxLength={100} placeholder="Collected Editions" />
                </label>
              </div>
              <div className={styles.addComicOptions}>
                <label>
                  Writers
                  <input value={draft.writers} onChange={setField('writers')} maxLength={300} placeholder="Frank Miller" />
                </label>
                <label>
                  Artists
                  <input value={draft.artists} onChange={setField('artists')} maxLength={300} placeholder="David Mazzucchelli" />
                </label>
              </div>
              <label>
                Collects
                <input value={draft.collects} onChange={setField('collects')} maxLength={600} placeholder="Batman #404-407" />
              </label>
              <label>
                Purchase link
                <input
                  value={draft.link}
                  onChange={setField('link')}
                  maxLength={500}
                  inputMode="url"
                  placeholder="https://www.amazon.com/dp/..."
                />
              </label>
              {draft.cover && (
                <div className={styles.lookupCover}>
                  <img src={draft.cover} alt="Cover found by the lookup" onError={() => setDraft((current) => ({ ...current, cover: '' }))} />
                  <div>
                    <p>Cover from Open Library</p>
                    <button type="button" onClick={() => setDraft((current) => ({ ...current, cover: '' }))}>Remove cover</button>
                  </div>
                </div>
              )}
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
                {savingComic ? 'Saving…' : 'Add comic'}
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

      {editingComic && (
        <div
          className={styles.detailBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditingComic(null);
          }}
        >
          <section
            className={`${styles.detailPanel} ${styles.addComicPanel}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-comic-title"
          >
            <header className={styles.detailHeader}>
              <span>Edit entry</span>
              <button type="button" onClick={() => setEditingComic(null)} aria-label="Close the edit form">
                <X weight="regular" />
              </button>
            </header>
            <form className={styles.addComicForm} onSubmit={saveEdit} data-lenis-prevent>
              <div>
                <p className={styles.detailMeta}>Edit this comic</p>
                <h2 id="edit-comic-title">Edit entry.</h2>
                <p>Change any field. Leave a field empty to remove the value.</p>
              </div>
              <div className={styles.lookupField}>
                <label htmlFor="comic-lookup">Find the book</label>
                <div className={styles.lookupRow}>
                  <input
                    id="comic-lookup"
                    value={lookupQuery}
                    onChange={(event) => setLookupQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') { event.preventDefault(); void runLookup(); }
                    }}
                    maxLength={200}
                    placeholder="Batman: Year One, an ISBN, or an Amazon link"
                  />
                  <button type="button" onClick={() => void runLookup()} disabled={lookupBusy || !lookupQuery.trim()}>
                    {lookupBusy ? 'Searching…' : 'Search'}
                  </button>
                </div>
                <p className={styles.lookupHint}>Results include reprints and translations. Check the publisher before you select an edition. The year is the year of the printing, not the year of the first release.</p>
                {lookupNote && <p className={styles.lookupNote}>{lookupNote}</p>}
                {lookupResults.length > 0 && (
                  <ul className={styles.lookupResults}>
                    {lookupResults.map((candidate) => (
                      <li key={candidate.isbn}>
                        <button type="button" onClick={() => void selectCandidate(candidate)}>
                          <img src={candidate.cover} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} />
                          <span>
                            <strong>{candidate.title}</strong>
                            <small>{[candidate.authors, candidate.year, candidate.publisher].filter(Boolean).join(' / ')}</small>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <label>
                Comic title
                <input value={draft.title} onChange={setField('title')} required maxLength={180} placeholder="Batman: Year One" />
              </label>
              <label>
                Description
                <textarea value={draft.description} onChange={setField('description')} maxLength={600} placeholder="A short, spoiler-free summary" />
              </label>
              <div className={styles.addComicOptions}>
                <label>
                  Year
                  <input value={draft.year} onChange={setField('year')} maxLength={40} placeholder="1987" />
                </label>
                <label>
                  Category
                  <input value={draft.category} onChange={setField('category')} maxLength={100} placeholder="Collected Editions" />
                </label>
              </div>
              <div className={styles.addComicOptions}>
                <label>
                  Writers
                  <input value={draft.writers} onChange={setField('writers')} maxLength={300} placeholder="Frank Miller" />
                </label>
                <label>
                  Artists
                  <input value={draft.artists} onChange={setField('artists')} maxLength={300} placeholder="David Mazzucchelli" />
                </label>
              </div>
              <label>
                Collects
                <input value={draft.collects} onChange={setField('collects')} maxLength={600} placeholder="Batman #404-407" />
              </label>
              <label>
                Purchase link
                <input
                  value={draft.link}
                  onChange={setField('link')}
                  maxLength={500}
                  inputMode="url"
                  placeholder="https://www.amazon.com/dp/..."
                />
              </label>
              {draft.cover && (
                <div className={styles.lookupCover}>
                  <img src={draft.cover} alt="Cover found by the lookup" onError={() => setDraft((current) => ({ ...current, cover: '' }))} />
                  <div>
                    <p>Cover from Open Library</p>
                    <button type="button" onClick={() => setDraft((current) => ({ ...current, cover: '' }))}>Remove cover</button>
                  </div>
                </div>
              )}
              <div className={styles.addComicOptions}>
                <label>
                  Publisher
                  <select
                    value={draft.universe}
                    onChange={(event) => setDraft((current) => ({ ...current, universe: event.target.value as Universe }))}
                  >
                    <option value="dc">DC</option>
                    <option value="marvel">Marvel</option>
                  </select>
                </label>
              </div>
              {draft.cover && (
                <div className={styles.lookupCover}>
                  <img src={draft.cover} alt="Cover for this comic" onError={() => setDraft((current) => ({ ...current, cover: '' }))} />
                  <div>
                    <p>Cover address</p>
                    <button type="button" onClick={() => setDraft((current) => ({ ...current, cover: '' }))}>Remove cover</button>
                  </div>
                </div>
              )}
              {comicError && <p className={styles.comicError}>{comicError}</p>}
              <button className={styles.createComicButton} type="submit" disabled={savingComic}>
                {savingComic ? 'Saving\u2026' : 'Save changes'}
              </button>
            </form>
          </section>
        </div>
      )}

      {bulkOpen && (
        <div
          className={styles.detailBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setBulkOpen(false);
          }}
        >
          <section
            className={`${styles.detailPanel} ${styles.addComicPanel}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-add-title"
          >
            <header className={styles.detailHeader}>
              <span>Add several</span>
              <button type="button" onClick={() => setBulkOpen(false)} aria-label="Close the bulk add form">
                <X weight="regular" />
              </button>
            </header>
            <div className={styles.addComicForm} data-lenis-prevent>
              <div>
                <p className={styles.detailMeta}>Several collected editions</p>
                <h2 id="bulk-add-title">Add several.</h2>
                <p>Paste up to 20 Amazon links or ISBNs, one per line. Check each title before you save.</p>
              </div>
              <label>
                Links
                <textarea
                  value={bulkLinks}
                  onChange={(event) => setBulkLinks(event.target.value)}
                  rows={5}
                  maxLength={6000}
                  placeholder={'https://www.amazon.com/dp/1401207529\nhttps://www.amazon.com/dp/0785130098'}
                />
              </label>
              <div className={styles.addComicOptions}>
                <label>
                  Publisher
                  <select value={bulkUniverse} onChange={(event) => setBulkUniverse(event.target.value as Universe)}>
                    <option value="dc">DC</option>
                    <option value="marvel">Marvel</option>
                  </select>
                </label>
                <label>
                  Collection
                  <select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value as 'owned' | 'wishlist')}>
                    <option value="owned">Owned</option>
                    <option value="wishlist">Wishlist</option>
                  </select>
                </label>
              </div>
              <button
                className={styles.createComicButton}
                type="button"
                onClick={() => void runBulkLookup()}
                disabled={bulkBusy || !bulkLinks.trim()}
              >
                {bulkBusy ? 'Looking up\u2026' : 'Look up the links'}
              </button>

              {bulkCandidates.length > 0 && (
                <ul className={styles.bulkList}>
                  {bulkCandidates.map((item, index) => (
                    <li key={`${item.isbn || item.link}-${index}`} className={item.keep ? undefined : styles.bulkSkipped}>
                      <label className={styles.bulkKeep}>
                        <input
                          type="checkbox"
                          checked={item.keep}
                          onChange={(event) => setBulkCandidates((current) => current.map((entry, position) =>
                            position === index ? { ...entry, keep: event.target.checked } : entry))}
                          aria-label={`Include ${item.title || item.link}`}
                        />
                      </label>
                      {item.cover
                        ? <img src={item.cover} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} />
                        : <span className={styles.bulkNoCover} aria-hidden="true" />}
                      <div className={styles.bulkFields}>
                        <input
                          value={item.title}
                          onChange={(event) => setBulkCandidates((current) => current.map((entry, position) =>
                            position === index ? { ...entry, title: event.target.value } : entry))}
                          placeholder="Enter the title"
                          aria-label="Comic title"
                        />
                        <small>
                          {[item.year, item.writers].filter(Boolean).join(' / ') || item.link}
                          {item.note ? ` — ${item.note}` : ''}
                        </small>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {bulkError && <p className={styles.comicError}>{bulkError}</p>}

              {bulkCandidates.length > 0 && (
                <button
                  className={styles.createComicButton}
                  type="button"
                  onClick={() => void saveBulk()}
                  disabled={bulkSaving || !bulkCandidates.some((item) => item.keep && item.title.trim())}
                >
                  {bulkSaving ? 'Saving\u2026' : (() => {
                    const total = bulkCandidates.filter((item) => item.keep && item.title.trim()).length;
                    return `Add ${total} ${total === 1 ? 'comic' : 'comics'}`;
                  })()}
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
