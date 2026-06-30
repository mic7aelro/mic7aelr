'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { getLenis } from '@/components/SmoothScroll';
import styles from './Liverpool.module.css';
import {
  squad,
  clFinals,
  legends,
  in2526,
  out2526,
  summer26,
  trophies,
  records,
  titleYears,
  verdictStats,
  xi,
  TABS,
  NAT,
  type TabId,
  type Player,
} from './data';

// Respect the user's reduced-motion preference (SSR-safe).
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Nationality code with a country-name tooltip for screen readers + hover.
function Nat({ code }: { code: string }) {
  return <abbr className={styles.nat} title={NAT[code] ?? code}>{code}</abbr>;
}

// ─── Crest (signature SVG from the original) ─────────────────────────────────

function Crest() {
  return (
    <svg className={styles.crest} viewBox="0 0 60 70" aria-hidden="true">
      <path
        d="M30 2 C18 2 8 6 8 6 L8 40 C8 56 30 68 30 68 C30 68 52 56 52 40 L52 6 C52 6 42 2 30 2 Z"
        fill="#5C0D17"
        stroke="#F0BD3E"
        strokeWidth="2"
      />
      <path
        d="M30 16 c-6 0-9 4-9 9 0 5 4 8 4 12 l-3 6 h16 l-3-6 c0-4 4-7 4-12 0-5-3-9-9-9z"
        fill="#F0BD3E"
      />
      <circle cx="30" cy="24" r="2.4" fill="#5C0D17" />
    </svg>
  );
}

// ─── Squad table ─────────────────────────────────────────────────────────────

function SquadTable({ pos, onSelect }: { pos: Player['pos']; onSelect: (p: Player) => void }) {
  const rows = squad.filter((p) => p.pos === pos);
  return (
    <div className={styles.tablewrap} data-reveal>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Role</th>
            <th>Nat</th>
            <th>Signed from</th>
            <th>Fee</th>
            <th>Joined</th>
            <th>Apps</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr
              key={p.n}
              className={styles.clickable}
              onClick={() => onSelect(p)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(p);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`${p.name} — view details`}
              data-cursor-grow
            >
              <td><span className={styles.numBadge}>{p.n}</span></td>
              <td>
                <b>{p.name}</b>
                {p.note && <><br /><span className={styles.cap}>{p.note}</span></>}
              </td>
              <td><span className={styles.posflag}>{p.posName}</span></td>
              <td><Nat code={p.nat} /></td>
              <td>{p.from}</td>
              <td><span className={styles.fee}>{p.fee}</span></td>
              <td>{p.when}</td>
              <td>{p.apps}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Flashcards ──────────────────────────────────────────────────────────────

function Flashcards() {
  // Deterministic deck (no randomness → no hydration mismatch)
  const deck = useMemo(() => squad.filter((p) => p.from !== 'Academy' || p.apps > 10), []);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const p = deck[index];

  const go = (dir: number) => {
    setFlipped(false);
    setIndex((i) => (i + dir + deck.length) % deck.length);
  };

  return (
    <div className={styles.fcStage}>
      <div
        className={`${styles.flashcard} ${flipped ? styles.flashcardFlip : ''}`}
        onClick={() => setFlipped((f) => !f)}
        data-cursor-grow
      >
        <div className={styles.fcInner}>
          <div className={`${styles.fcFace} ${styles.fcFront}`}>
            <div className={styles.num}>{p.n}</div>
            <div className={styles.name}>{p.name}</div>
            <div className={styles.hint}>Tap to flip</div>
          </div>
          <div className={`${styles.fcFace} ${styles.fcBack}`}>
            <div className={styles.role}>{p.posName}</div>
            <div className={styles.meta}>
              <b>{p.nat}</b> · signed from <b>{p.from}</b>
              <br />
              Fee <b>{p.fee}</b> · joined {p.when}
              {p.note && <><br /><span className={styles.fcNote}>{p.note}</span></>}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.fcNav}>
        <button onClick={() => go(-1)} data-cursor-grow>‹ Prev</button>
        <span className={styles.fcCount}>{index + 1} / {deck.length}</span>
        <button onClick={() => go(1)} data-cursor-grow>Next ›</button>
      </div>
    </div>
  );
}

// ─── Quiz ────────────────────────────────────────────────────────────────────

type Question = { q: React.ReactNode; opts: string[]; ans: string };

function shuffle<T>(a: T[]): T[] {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function uniqueWrong(field: 'posName' | 'from' | 'fee', correct: string, n: number): string[] {
  const vals = [...new Set(squad.map((p) => p[field]).filter((v) => v && v !== correct && v !== '—'))];
  return shuffle(vals).slice(0, n);
}

// Guarantee exactly 4 distinct options with the correct answer included.
function makeOpts(correct: string, wrong: string[]): string[] {
  const opts = [...new Set([correct, ...wrong])].slice(0, 4);
  return shuffle(opts);
}

function buildQuestions(): Question[] {
  const pool = squad.filter((p) => p.fee !== '—');
  return shuffle(pool).slice(0, 10).map((p) => {
    const type = Math.floor(Math.random() * 3);
    if (type === 0) {
      return {
        q: <>What position does <b>{p.name}</b> play?</>,
        opts: makeOpts(p.posName, uniqueWrong('posName', p.posName, 3)),
        ans: p.posName,
      };
    }
    if (type === 1) {
      return {
        q: <>Which club did Liverpool sign <b>{p.name}</b> from?</>,
        opts: makeOpts(p.from, uniqueWrong('from', p.from, 3)),
        ans: p.from,
      };
    }
    return {
      q: <>What was the transfer fee for <b>{p.name}</b>?</>,
      opts: makeOpts(p.fee, uniqueWrong('fee', p.fee, 3)),
      ans: p.fee,
    };
  });
}

function Quiz() {
  // Built lazily on the client (event-driven) → no hydration mismatch
  const [pool, setPool] = useState<Question[]>(() => buildQuestions());
  const [pos, setPos] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const restart = () => {
    setPool(buildQuestions());
    setPos(0);
    setScore(0);
    setPicked(null);
  };

  const done = pos >= pool.length;
  const item = pool[pos];

  const choose = (opt: string) => {
    if (picked !== null) return;
    setPicked(opt);
    if (opt === item.ans) setScore((s) => s + 1);
  };

  const next = () => {
    setPicked(null);
    setPos((p) => p + 1);
  };

  const pct = Math.round((score / pool.length) * 100);
  const barWidth = done ? '100%' : `${(pos / pool.length) * 100}%`;

  const message =
    pct === 100 ? "Flawless. You're a proper Kopite."
    : pct >= 70 ? 'Strong. You know this squad.'
    : pct >= 40 ? 'Getting there — hit the flashcards.'
    : 'Back to the flashcards, lad.';

  return (
    <div className={styles.quiz}>
      <div className={styles.qProgress}>
        <i className={styles.qBar} style={{ width: barWidth }} />
      </div>

      {done ? (
        <div className={styles.qResult}>
          <div className={styles.big}>{score}/{pool.length}</div>
          <p>{message} ({pct}%)</p>
          <button className={`${styles.qNext} ${styles.qNextOn}`} onClick={restart} data-cursor-grow>
            Play again
          </button>
        </div>
      ) : (
        <div>
          <div className={styles.qText}>Q{pos + 1}. {item.q}</div>
          <div className={styles.qOpts}>
            {item.opts.map((o) => {
              const reveal = picked !== null;
              const cls = [styles.opt];
              if (reveal && o === item.ans) cls.push(styles.optCorrect);
              else if (reveal && o === picked) cls.push(styles.optWrong);
              return (
                <button
                  key={o}
                  className={cls.join(' ')}
                  disabled={reveal}
                  onClick={() => choose(o)}
                  data-cursor-grow
                >
                  {o}
                </button>
              );
            })}
          </div>
          <div className={styles.qFoot}>
            <span className={styles.qScore}>Score: <b>{score}</b> / {pool.length}</span>
            <button
              className={`${styles.qNext} ${picked !== null ? styles.qNextOn : ''}`}
              onClick={next}
              data-cursor-grow
            >
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Transfer row ────────────────────────────────────────────────────────────

function TransferRow({ name, pos, sub, fee, tag, tagLabel }: {
  name: string; pos: string; sub: string; fee: string;
  tag: string; tagLabel: string;
}) {
  return (
    <div className={styles.row} style={{ gridTemplateColumns: '1fr auto auto' }} data-reveal>
      <span className={styles.rowMain}>
        <b>{name}</b> <span className={styles.posflag}>{pos}</span>
        <br />
        <span className={styles.rowSub}>{sub}</span>
      </span>
      <span className={styles.fee}>{fee}</span>
      <span className={`${styles.tag} ${tag}`}>{tagLabel}</span>
    </div>
  );
}

// ─── Main hub ────────────────────────────────────────────────────────────────

// Full name (for Wikipedia links) keyed by squad number — the pitch uses short names.
const squadByNumber: Record<number, Player> = Object.fromEntries(squad.map((p) => [p.n, p]));

function wikiTitle(name: string) {
  return encodeURIComponent(name.replace(/ /g, '_'));
}

type WikiSummary = {
  extract?: string;
  description?: string;
  thumbnail?: { source: string };
  content_urls?: { desktop?: { page?: string } };
};

// ─── Player modal — Wikipedia photo + bio, in-page, on-brand ─────────────────

function PlayerModal({ player, onClose }: { player: Player | null; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [summary, setSummary] = useState<WikiSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Fetch the Wikipedia summary whenever a new player opens
  useEffect(() => {
    if (!player) return;
    let cancelled = false;
    setSummary(null);
    setImgError(false);
    setLoading(true);
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle(player.name)}?redirect=true`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (!cancelled) setSummary(data); })
      .catch(() => { if (!cancelled) setSummary(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [player]);

  // Lock Lenis, trap focus, restore focus + close on Escape while open
  useEffect(() => {
    if (!player) return;
    getLenis()?.stop();

    // Remember what was focused (the row/shirt) so we can return to it on close.
    const opener = document.activeElement as HTMLElement | null;
    // Move focus into the dialog so screen readers + keyboard land inside it.
    requestAnimationFrame(() => cardRef.current?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      // Trap Tab within the dialog.
      const card = cardRef.current;
      if (!card) return;
      const focusable = card.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeEl = document.activeElement;
      if (e.shiftKey && (activeEl === first || activeEl === card)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      getLenis()?.start();
      window.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [player, onClose]);

  // Entrance animation (skipped under reduced-motion — elements just appear)
  useGSAP(() => {
    if (!player) return;
    if (prefersReducedMotion()) {
      gsap.set([overlayRef.current, cardRef.current], { opacity: 1, y: 0, scale: 1 });
      return;
    }
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 24, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.5)' }
    );
  }, { dependencies: [player] });

  if (!player) return null;

  // Use the API's canonical thumbnail as-is — arbitrary width upscales 400 on some files.
  const photo = !imgError ? summary?.thumbnail?.source : undefined;
  const wikiPage = summary?.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${wikiTitle(player.name)}`;

  return (
    <div
      ref={overlayRef}
      className={styles.modalOverlay}
      onClick={onClose}
      data-lenis-prevent
    >
      <div
        ref={cardRef}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={player.name}
        tabIndex={-1}
      >
        <button className={styles.modalClose} onClick={onClose} aria-label="Close" data-cursor-grow>✕</button>

        <div className={styles.modalHero}>
          <span className={styles.modalNo}>{player.n}</span>
          {photo ? (
            <>
              <div className={styles.modalHeroBg} style={{ backgroundImage: `url("${photo}")` }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.modalHeroImg} src={photo} alt={player.name} onError={() => setImgError(true)} />
            </>
          ) : (
            <div className={styles.modalHeroEmpty}>{loading ? '' : player.n}</div>
          )}
          <div className={styles.modalHeroFade} />
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalRole}>{player.posName}</div>
          <h3 className={styles.modalName}>{player.name}</h3>

          <div className={styles.modalMeta}>
            <div className={styles.modalMetaCell}>
              <div className={styles.modalMetaLbl}>Nationality</div>
              <div className={styles.modalMetaVal}>{NAT[player.nat] ?? player.nat}</div>
            </div>
            <div className={styles.modalMetaCell}>
              <div className={styles.modalMetaLbl}>Liverpool apps</div>
              <div className={styles.modalMetaVal}>{player.apps}</div>
            </div>
            <div className={styles.modalMetaCell}>
              <div className={styles.modalMetaLbl}>Signed from</div>
              <div className={styles.modalMetaVal}>{player.from}</div>
            </div>
            <div className={styles.modalMetaCell}>
              <div className={styles.modalMetaLbl}>Fee · joined</div>
              <div className={styles.modalMetaVal}>{player.fee} · {player.when}</div>
            </div>
          </div>

          <div className={styles.modalBio}>
            {loading ? (
              <>
                <div className={styles.modalSkeleton} style={{ width: '95%' }} />
                <div className={styles.modalSkeleton} style={{ width: '88%' }} />
                <div className={styles.modalSkeleton} style={{ width: '70%' }} />
              </>
            ) : summary?.extract ? (
              <p>{summary.extract}</p>
            ) : (
              <p>{player.note ? <><b>{player.note}.</b> </> : null}A {player.posName.toLowerCase()} for Liverpool, signed from {player.from} in {player.when}.</p>
            )}
          </div>

          <a className={styles.modalLink} href={wikiPage} target="_blank" rel="noopener noreferrer" data-cursor-grow>
            Read full article on Wikipedia ↗
          </a>
        </div>
      </div>
    </div>
  );
}

export function LiverpoolHub() {
  const [active, setActive] = useState<TabId>('now');
  const [studyMode, setStudyMode] = useState<'cards' | 'quiz'>('cards');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tablistRef = useRef<HTMLDivElement>(null);

  const switchTab = (v: TabId) => {
    if (v === active) return;
    setActive(v);
    getLenis()?.scrollTo(0, { duration: 0.8 });
  };

  // Roving-tabindex keyboard nav (manual activation: arrows move focus,
  // Enter/Space activates — so arrowing through tabs never yanks scroll).
  const onTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const nav = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!nav.includes(e.key)) return;
    e.preventDefault();
    const btns = Array.from(
      tablistRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []
    );
    const idx = btns.findIndex((b) => b === document.activeElement);
    let next = idx;
    if (e.key === 'ArrowRight') next = (idx + 1) % btns.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + btns.length) % btns.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = btns.length - 1;
    btns[next]?.focus();
  };

  // Reveal the active view's blocks on every tab change; count up numeric stats.
  useGSAP(
    () => {
      const root = contentRef.current;
      if (!root) return;

      // Reduced motion: skip the tweens but still write final state — the count-up
      // cells render a literal "0" and would otherwise stay stuck at zero.
      if (prefersReducedMotion()) {
        root.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
          el.textContent = el.dataset.count ?? el.textContent;
        });
        return;
      }

      const blocks = root.querySelectorAll('[data-reveal]');
      gsap.fromTo(
        blocks,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'power3.out' }
      );

      // Stat / pitch flourishes
      root.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
        const target = Number(el.dataset.count);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1,
          ease: 'power2.out',
          delay: 0.15,
          onUpdate: () => { el.textContent = String(Math.round(obj.v)); },
        });
      });

      const shirts = root.querySelectorAll('[data-shirt]');
      if (shirts.length) {
        gsap.fromTo(
          shirts,
          { opacity: 0, scale: 0 },
          { opacity: 1, scale: 1, duration: 0.5, stagger: 0.05, ease: 'back.out(1.7)', delay: 0.1 }
        );
      }
    },
    { scope: contentRef, dependencies: [active, studyMode] }
  );

  // Inline link that jumps to another tab (used in prose + the TL;DR).
  const Jump = ({ to, children }: { to: TabId; children: React.ReactNode }) => (
    <button type="button" className={styles.jump} onClick={() => switchTab(to)} data-cursor-grow>
      {children}
    </button>
  );

  return (
    <div className={styles.hub}>
      {/* ── Crest bar ── */}
      <header className={styles.crestbar}>
        <div className={styles.crestbarInner}>
          <Crest />
          <h1>This Is <span>Anfield</span></h1>
          <div className={styles.ticker}>
            Season <b>2025/26</b> &nbsp;·&nbsp; You&apos;ll Never <b>Walk Alone</b>
          </div>
        </div>
      </header>

      {/* ── Tabs ── */}
      <nav className={styles.tabs} aria-label="Liverpool hub sections">
        <div
          className={styles.tabsInner}
          ref={tablistRef}
          role="tablist"
          aria-label="Liverpool hub sections"
          onKeyDown={onTabKeyDown}
        >
          {TABS.map((t) => {
            const selected = active === t.v;
            return (
              <button
                key={t.v}
                id={`lv-tab-${t.v}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`lv-panel-${t.v}`}
                tabIndex={selected ? 0 : -1}
                className={`${styles.tab} ${selected ? styles.tabActive : ''}`}
                onClick={() => switchTab(t.v)}
                data-cursor-grow
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className={styles.main} ref={contentRef}>
        {/* ====================== NOW ====================== */}
        {active === 'now' && (
          <section role="tabpanel" id="lv-panel-now" aria-labelledby="lv-tab-now" tabIndex={0}>
            <div className={styles.hero} data-reveal>
              <div className={styles.heroTag}>Where things stand · June 2026</div>
              <h2>A title defence that <em>fell apart</em>.</h2>
              <p>
                One year after Arne Slot won the league at a canter, Liverpool collapsed from late
                September on, finished <b>5th</b>, won <b>nothing</b>, and sacked the manager on the
                final weekend. Andoni Iraola now inherits a squad in transition — <Jump to="squad">Salah gone</Jump>, Konaté
                heading to Madrid, and <Jump to="transfers">£417m of new signings</Jump> still searching for their best form.
              </p>
              <div className={styles.verdict}>
                <span className={styles.dot} />
                <span className={styles.verdictLabel}>
                  Champions League secured on the final day — barely
                </span>
              </div>
            </div>

            <ul className={styles.tldr} data-reveal aria-label="The 60-second version">
              <li>
                <span className={styles.tldrTag}>The 60-second version</span>
              </li>
              <li>Finished <b>5th</b>, won <b>nothing</b>, sacked Slot — Iraola in to rebuild.</li>
              <li><b>£417m</b> on Wirtz, Isak &amp; Ekitike. <Jump to="transfers">See every transfer →</Jump></li>
              <li>Salah &amp; Konaté gone; a squad in flux. <Jump to="squad">Meet the squad →</Jump></li>
              <li>Still England&apos;s most decorated club. <Jump to="history">20 titles, 6 European Cups →</Jump></li>
            </ul>

            <div className={styles.statstrip} data-reveal>
              {verdictStats.map((s) => {
                const numeric = /^\d+$/.test(s.num);
                return (
                  <div className={styles.statCell} key={s.lbl}>
                    <div className={`${styles.statNum} ${s.gold ? styles.statNumGold : ''}`}
                      {...(numeric ? { 'data-count': s.num } : {})}>
                      {numeric ? '0' : s.num}
                    </div>
                    <div className={styles.statLbl}>{s.lbl}</div>
                  </div>
                );
              })}
            </div>

            <div className={styles.eyebrow}>The headlines you missed</div>
            <div className={`${styles.grid} ${styles.g3}`}>
              <div className={styles.card} data-reveal>
                <h3>Slot out, Iraola in</h3>
                <p>Arne Slot was dismissed on 30 May 2026 after a trophyless second season. Five days later, <b>Andoni Iraola</b> — fresh off taking Bournemouth to 6th and into Europe — signed a two-year deal, tasked with restoring Klopp-style &quot;heavy metal&quot; football.</p>
              </div>
              <div className={styles.card} data-reveal>
                <h3>Salah&apos;s farewell</h3>
                <p>After 440 games and 257 goals, <b>Mohamed Salah</b> left at the end of the season — the second-highest scorer in the club&apos;s history. His form dipped sharply from his record 24/25, and his relationship with Slot soured.</p>
              </div>
              <div className={styles.card} data-reveal>
                <h3>British record broken</h3>
                <p>Liverpool smashed the British transfer record twice in one window — <b>Florian Wirtz</b> (£100m) then <b>Alexander Isak</b> (£125m) — on top of Ekitike, Kerkez and Frimpong. Total outlay: <b>£417m+</b>.</p>
              </div>
            </div>

            <div className={styles.eyebrow}>In memory</div>
            <div className={styles.memorial} data-reveal>
              <div className={styles.twenty}>20</div>
              <div>
                <h3>Diogo Jota · 1996–2025</h3>
                <p>The forward died in a car accident on 3 July 2025, days after his wedding. On 11 July the club retired his No. 20 across every level — the first squad number Liverpool has ever retired. The season was played in his shadow, and his teammates carried it with them.</p>
              </div>
            </div>

            <div className={styles.eyebrow}>The quick brief</div>
            <div className={`${styles.grid} ${styles.g2}`}>
              <div className={styles.card} data-reveal>
                <h3>What went wrong</h3>
                <p>A perfect August (five straight wins, top of the table) gave way to a four-game losing streak from October. Salah&apos;s goals dried up, attack and defence were hit by injuries, and Slot&apos;s slower, possession-heavy approach grew predictable. Arsenal ran away with it; Liverpool limped to 5th.</p>
              </div>
              <div className={styles.card} data-reveal>
                <h3>What to watch next</h3>
                <p>Iraola wants a faster, high-pressing side. Spain winger <b>Víctor Munoz</b> is in from Osasuna. <b>Bradley Barcola</b> (PSG) now heads the wing shortlist after top target <b>Yan Diomande</b> joined PSG. Midfield is the other rebuild priority. Pre-season starts after the 2026 World Cup. <Jump to="transfers">Track the rebuild →</Jump></p>
              </div>
            </div>
          </section>
        )}

        {/* ====================== HISTORY ====================== */}
        {active === 'history' && (
          <section role="tabpanel" id="lv-panel-history" aria-labelledby="lv-tab-history" tabIndex={0}>
            <div className={`${styles.eyebrow} ${styles.eyebrowFirst}`}>The most decorated club in England</div>
            <h2 className={styles.section} data-reveal>The Trophy Cabinet</h2>
            <p className={styles.lede} data-reveal>52 major men&apos;s honours. Joint-record 20 league titles, an English-record six European Cups, and more League Cups than anyone. Here&apos;s the haul.</p>

            <div className={styles.honours}>
              {trophies.map((t) => (
                <div className={styles.trophy} key={t.t} data-reveal>
                  <div className={styles.n}>{t.n}</div>
                  <div className={styles.t}>{t.t}</div>
                  <div className={styles.sub}>{t.sub}</div>
                </div>
              ))}
            </div>

            <div className={styles.eyebrow}>Six finals in Europe&apos;s biggest game</div>
            <h2 className={styles.section} data-reveal>European Cup / Champions League</h2>
            <div className={styles.rows}>
              {clFinals.map((f) => (
                <div className={styles.row} style={{ gridTemplateColumns: '64px 1fr auto' }} key={f.y} data-reveal>
                  <span className="y" style={{ fontFamily: 'var(--f-cond)', fontWeight: 600, color: 'var(--gold)', letterSpacing: '1px' }}>{f.y}</span>
                  <span className={styles.rowMain}>
                    <b>{f.r}</b>
                    <br />
                    <span className={styles.rowSub}>Final in {f.city}</span>
                  </span>
                  <span className={`${styles.tag} ${styles.tagRumor}`}>{f.mgr}</span>
                </div>
              ))}
            </div>

            <div className={styles.eyebrow}>All 20 of them</div>
            <h2 className={styles.section} data-reveal>League Title Years</h2>
            <div className={styles.card} style={{ marginTop: 16 }} data-reveal>
              <p className={styles.titleYears}>
                {titleYears.map((t, i) => (
                  <span key={t.year}>
                    {t.gold ? <b>{t.year}</b> : t.year}
                    {i < titleYears.length - 1 ? ' · ' : ''}
                  </span>
                ))}
              </p>
              <p style={{ marginTop: 12, color: 'var(--muted)', fontSize: 14 }}>
                The 2020 title (Klopp) ended a 30-year wait and was the club&apos;s first of the Premier League era. The 2025 title (Slot) equalled Manchester United&apos;s record of 20.
              </p>
            </div>

            <div className={styles.eyebrow}>Records that may never fall</div>
            <div className={`${styles.grid} ${styles.g4}`}>
              {records.map((r) => (
                <div className={styles.card} key={r.body} data-reveal>
                  <div className={styles.cardBig}>{r.big}</div>
                  <h3 style={{ marginTop: 8 }}>{r.title}</h3>
                  <p>{r.body}</p>
                </div>
              ))}
            </div>

            <div className={styles.eyebrow}>The names on the wall</div>
            <h2 className={styles.section} data-reveal>Legends &amp; Icons</h2>
            <div className={`${styles.grid} ${styles.g3}`} style={{ marginTop: 16 }}>
              {legends.map((l) => (
                <div className={styles.card} key={l.n} data-reveal>
                  <h3>{l.n}</h3>
                  <p>{l.d}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ====================== SQUAD ====================== */}
        {active === 'squad' && (
          <section role="tabpanel" id="lv-panel-squad" aria-labelledby="lv-tab-squad" tabIndex={0}>
            <div className={`${styles.eyebrow} ${styles.eyebrowFirst}`}>Slot&apos;s go-to shape</div>
            <h2 className={styles.section} data-reveal>The Starting XI</h2>
            <p className={styles.lede} data-reveal>A representative full-strength 4-2-3-1 from 25/26. Hover or tap a shirt for the position.</p>

            <div className={styles.pitch} data-reveal>
              <div>
                <i className={styles.pitchLine} style={{ left: '50%', top: 0, width: 0, height: '100%', borderWidth: '0 0 0 1.5px', transform: 'translateX(-50%)' }} />
                <i className={styles.pitchLine} style={{ left: '50%', top: '50%', width: 120, height: 120, borderRadius: '50%', transform: 'translate(-50%,-50%)' }} />
                <i className={styles.pitchLine} style={{ left: '50%', bottom: 0, width: '46%', height: '16%', transform: 'translateX(-50%)' }} />
                <i className={styles.pitchLine} style={{ left: '50%', top: 0, width: '46%', height: '16%', transform: 'translateX(-50%)' }} />
              </div>
              {xi.map((s) => {
                const player = squadByNumber[s.n];
                return (
                  <button
                    key={s.n}
                    type="button"
                    onClick={() => player && setSelectedPlayer(player)}
                    title={`${player?.name ?? s.nm} — details`}
                    className={`${styles.spot} ${styles.clickable} ${s.gk ? styles.spotGk : ''}`}
                    style={{ left: `${s.x}%`, top: `${s.y}%`, background: 'none', border: 0, padding: 0 }}
                    data-shirt
                    data-cursor-grow
                  >
                    <div className={styles.shirt}>{s.n}</div>
                    <div className={styles.spotNm}>{s.nm}</div>
                    <div className={styles.spotPs}>{s.ps}</div>
                  </button>
                );
              })}
            </div>

            <div className={styles.eyebrow}>Every player, every fee</div>
            <h2 className={styles.section} data-reveal>Full Squad 25/26</h2>
            <p className={styles.lede} data-reveal>Apps/goals are career totals for Liverpool. Fees and dates are when the player arrived at the club.</p>

            <div className={`${styles.eyebrow} ${styles.eyebrowSmall}`} style={{ marginTop: 24 }}>Goalkeepers</div>
            <SquadTable pos="GK" onSelect={setSelectedPlayer} />
            <div className={`${styles.eyebrow} ${styles.eyebrowSmall}`}>Defenders</div>
            <SquadTable pos="DF" onSelect={setSelectedPlayer} />
            <div className={`${styles.eyebrow} ${styles.eyebrowSmall}`}>Midfielders</div>
            <SquadTable pos="MF" onSelect={setSelectedPlayer} />
            <div className={`${styles.eyebrow} ${styles.eyebrowSmall}`}>Forwards</div>
            <SquadTable pos="FW" onSelect={setSelectedPlayer} />

            <div className={styles.eyebrow}>Loaned out &amp; academy</div>
            <div className={`${styles.grid} ${styles.g2}`}>
              <div className={styles.card} data-reveal>
                <h3>Out on loan (25/26)</h3>
                <p>Kostas Tsimikas (Roma), Harvey Elliott (Aston Villa), Lewis Koumas (Hull), Calum Scanlon (Cardiff), Luca Stephenson (Dundee Utd), Vítězslav Jaroš (Ajax), Fabian Mrozek (FC Cincinnati) and more — the standard Liverpool loan army gaining minutes.</p>
              </div>
              <div className={styles.card} data-reveal>
                <h3>Ones to watch (academy)</h3>
                <p><b>Rio Ngumoha</b> (#73) became the club&apos;s youngest-ever goalscorer at 16. Also breaking through: Trey Nyoni, James McConnell, Kieran Morrison, Amara Nallo and goalkeeper Ármin Pécsi. Future arrivals Jérémy Jacquet &amp; Ifeanyi Ndukwe join for 26/27.</p>
              </div>
            </div>
          </section>
        )}

        {/* ====================== TRANSFERS ====================== */}
        {active === 'transfers' && (
          <section role="tabpanel" id="lv-panel-transfers" aria-labelledby="lv-tab-transfers" tabIndex={0}>
            <div className={`${styles.eyebrow} ${styles.eyebrowFirst}`}>A £417m gamble</div>
            <h2 className={styles.section} data-reveal>Transfers In — 25/26</h2>
            <p className={styles.lede} data-reveal>The biggest single-window spend in the club&apos;s history. It didn&apos;t deliver a trophy.</p>
            <div className={styles.rows}>
              {in2526.map((t) => (
                <TransferRow key={t.p} name={t.p} pos={t.pos} sub={`from ${t.from} · ${t.when}`} fee={t.fee} tag={styles.tagIn} tagLabel="In" />
              ))}
            </div>

            <div className={styles.eyebrow}>Out the door — 25/26</div>
            <h2 className={styles.section} data-reveal>Departures</h2>
            <p className={styles.lede} data-reveal>£190m+ recouped, but losing Trent, Díaz and Núñez reshaped the spine.</p>
            <div className={styles.rows}>
              {out2526.map((t) => (
                <TransferRow key={t.p} name={t.p} pos={t.pos} sub={`to ${t.to} · ${t.when}`} fee={t.fee} tag={styles.tagOut} tagLabel="Out" />
              ))}
            </div>

            <div className={styles.eyebrow}>The Iraola rebuild begins</div>
            <h2 className={styles.section} data-reveal>Summer 2026 — Done &amp; Rumored</h2>
            <p className={styles.lede} data-reveal>Window opened 15 June, closes 1 September. The new manager wants pace and pressing. Rumors below are not confirmed — treat them as live links, not done deals.</p>
            <div className={styles.rows}>
              {summer26.map((t) => (
                <TransferRow
                  key={t.p}
                  name={t.p}
                  pos={t.pos}
                  sub={`${t.mv} · ${t.when}`}
                  fee={t.fee}
                  tag={t.type === 'in' ? styles.tagIn : t.type === 'out' ? styles.tagOut : t.type === 'miss' ? styles.tagMiss : styles.tagRumor}
                  tagLabel={t.type === 'in' ? 'In' : t.type === 'out' ? 'Out' : t.type === 'miss' ? 'Missed' : 'Rumor'}
                />
              ))}
            </div>

            <div className={`${styles.card} ${styles.cardGoldAccent}`} style={{ marginTop: 18 }} data-reveal>
              <h3>The Barcola situation, explained</h3>
              <p><b>Bradley Barcola</b> (23, PSG winger) is the marquee name. Per Fabrizio Romano he was on Liverpool&apos;s shortlist in 2025 and remains there in 2026, with his PSG contract talks &quot;completely on standby.&quot; He&apos;s stuck behind Kvaratskhelia in Luis Enrique&apos;s biggest games. <b>Arsenal</b> are reportedly in too with an opening ~€80m bid. French reports say Barcola is &quot;thrilled&quot; by an Anfield move — but PSG rate him highly and it&apos;s &quot;absolutely open.&quot; He was viewed partly as an alternative to top target <b>Yan Diomande</b> — but with Diomande now signed by PSG, Barcola moves to the front of the wing queue. Ironically, PSG&apos;s own wing logjam could make him easier to prise away.</p>
            </div>
          </section>
        )}

        {/* ====================== CLUB ====================== */}
        {active === 'club' && (
          <section role="tabpanel" id="lv-panel-club" aria-labelledby="lv-tab-club" tabIndex={0}>
            <div className={`${styles.eyebrow} ${styles.eyebrowFirst}`}>Who&apos;s who</div>
            <h2 className={styles.section} data-reveal>The Spine of the Club</h2>
            <div className={`${styles.grid} ${styles.g3}`} style={{ marginTop: 16 }}>
              <div className={styles.card} data-reveal>
                <h3 className={styles.spineRole}>Captain</h3>
                <p className={styles.spineName}>Virgil van Dijk <span>· #4</span></p>
                <p style={{ marginTop: 6 }}>Centre-back, Netherlands. The on-pitch leader and defensive cornerstone since 2018.</p>
              </div>
              <div className={styles.card} data-reveal>
                <h3 className={styles.spineRole}>Vice-captain (25/26)</h3>
                <p className={styles.spineName}>Andy Robertson <span>· #26</span></p>
                <p style={{ marginTop: 6 }}>Left-back, Scotland — though he&apos;s expected to leave in the summer 2026 rebuild.</p>
              </div>
              <div className={styles.card} data-reveal>
                <h3 className={styles.spineRole}>Head coach</h3>
                <p className={styles.spineName}>Andoni Iraola</p>
                <p style={{ marginTop: 6 }}>Basque, 43. Two-year deal from June 2026, replacing Arne Slot. Built his name pressing-mad Bournemouth into Europe.</p>
              </div>
            </div>
            <div className={styles.card} style={{ marginTop: 14 }} data-reveal>
              <h3>Leadership group &amp; ownership</h3>
              <p>The wider captaincy order in 25/26 ran <b>Van Dijk → Robertson → Alisson (3rd) → Salah (4th) → Gomez (5th)</b>. The club is owned by <b>Fenway Sports Group (FSG)</b>, chaired by <b>Tom Werner</b>, with <b>Richard Hughes</b> as sporting director — the man who brought Iraola to Anfield, having hired him at Bournemouth.</p>
            </div>

            <div className={styles.eyebrow}>Three derbies that define the season</div>
            <h2 className={styles.section} data-reveal>The Rivalries</h2>
            <div className={`${styles.grid} ${styles.g3}`} style={{ marginTop: 16 }}>
              <div className={`${styles.card} ${styles.rivalCard}`} data-reveal>
                <h3>Everton — Merseyside Derby</h3>
                <p>The local one, and the most-played top-flight fixture in English football. Everton moved to the new <b>Hill Dickinson Stadium</b> in 2025 after leaving Goodison Park. Fierce, family-splitting, and never short of red cards.</p>
              </div>
              <div className={`${styles.card} ${styles.rivalCard}`} data-reveal>
                <h3>Manchester United — North West Derby</h3>
                <p>The biggest rivalry in English football: the two most successful clubs, <b>20 league titles each</b>. Decades of bragging rights over who&apos;s England&apos;s No. 1. Carrick&apos;s United are rebuilding too.</p>
              </div>
              <div className={`${styles.card} ${styles.rivalCard}`} data-reveal>
                <h3>Manchester City — Modern Title Rivals</h3>
                <p>Forged in the Klopp-vs-Guardiola years when the two traded record points totals. With Pep gone from City and a new era at both clubs, the next chapter is wide open.</p>
              </div>
            </div>

            <div className={styles.eyebrow}>The cathedral</div>
            <h2 className={styles.section} data-reveal>Anfield &amp; The Culture</h2>
            <div className={`${styles.grid} ${styles.g2}`} style={{ marginTop: 16 }}>
              <div className={styles.card} data-reveal>
                <h3>Anfield &amp; The Kop</h3>
                <p>Home since 1892, now ~61,000 after the Anfield Road End expansion. The famous <b>Spion Kop</b> stand is the spiritual heart. Average home league crowd in 25/26: 60,390.</p>
              </div>
              <div className={styles.card} data-reveal>
                <h3>You&apos;ll Never Walk Alone</h3>
                <p>The Rodgers &amp; Hammerstein anthem, adopted via Gerry &amp; The Pacemakers in the &apos;60s, sung before every home game. The <b>Shankly Gates</b> bear its name; it&apos;s printed on the crest.</p>
              </div>
              <div className={styles.card} data-reveal>
                <h3>Nicknames &amp; colours</h3>
                <p><b>The Reds.</b> All-red kit since 1964 (Shankly&apos;s idea), with the <b>Liver bird</b> crest. Fans are &quot;Kopites.&quot; The badge carries the <b>97</b> and an eternal flame for those lost at Hillsborough.</p>
              </div>
              <div className={styles.card} data-reveal>
                <h3>The managers&apos; lineage</h3>
                <p>Shankly built it; Paisley &amp; Fagan conquered Europe; Dalglish, Benítez (Istanbul 2005), then <b>Klopp</b> (2019 CL, 2020 league) restored the dynasty. Slot won 2025. Now Iraola.</p>
              </div>
            </div>
          </section>
        )}

        {/* ====================== STUDY ====================== */}
        {active === 'study' && (
          <section role="tabpanel" id="lv-panel-study" aria-labelledby="lv-tab-study" tabIndex={0}>
            <div className={`${styles.eyebrow} ${styles.eyebrowFirst}`}>Learn the squad cold</div>
            <h2 className={styles.section} data-reveal>Study Mode</h2>
            <p className={styles.lede} data-reveal>Quizlet-style. Flip cards to drill each player&apos;s position and details, then test yourself.</p>

            <div className={styles.studySwitch} data-reveal>
              <button
                className={`${styles.sbtn} ${studyMode === 'cards' ? styles.sbtnActive : ''}`}
                onClick={() => setStudyMode('cards')}
                data-cursor-grow
              >
                Flashcards
              </button>
              <button
                className={`${styles.sbtn} ${studyMode === 'quiz' ? styles.sbtnActive : ''}`}
                onClick={() => setStudyMode('quiz')}
                data-cursor-grow
              >
                Quiz
              </button>
            </div>

            <div data-reveal>
              {studyMode === 'cards' ? <Flashcards /> : <Quiz />}
            </div>
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        <p className={styles.anthem}>⚽ You&apos;ll Never Walk Alone ⚽</p>
        <p style={{ marginTop: 8 }}>
          An unofficial fan catch-up hub · data current to <b>June 2026</b> (post-season, summer window open).
          <br />
          Stats &amp; transfers compiled from Liverpool FC, Wikipedia, ESPN, NBC Sports &amp; Fabrizio Romano reporting. Rumors are unconfirmed.
        </p>
      </footer>

      <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
    </div>
  );
}
