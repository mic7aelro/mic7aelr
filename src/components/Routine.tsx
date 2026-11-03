'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getLenis } from '@/components/SmoothScroll';
import {
  DAYS,
  HISMILE_DAYS,
  HOW,
  NIGHT_FOCUS,
  NIGHT_FOCUS_TEXT,
  PRODUCTS,
  WHY,
  byDay,
  stepsFor,
  type Period,
} from '@/data/routine';
import styles from './Routine.module.css';

type Tab = 'routine' | 'products';
type Checks = Record<string, boolean>;

const pad = (n: number) => String(n).padStart(2, '0');

// Date of the selected weekday in the current week (Sunday to Saturday).
function storageKey(day: number) {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (day - now.getDay()));
  return `routine-checks-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function readChecks(day: number): Checks {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey(day)) ?? '{}') as Checks;
  } catch {
    return {};
  }
}

function writeChecks(day: number, checks: Checks) {
  try {
    window.localStorage.setItem(storageKey(day), JSON.stringify(checks));
  } catch {}
}

export function Routine() {
  const [tab, setTab] = useState<Tab>('routine');
  const [today, setToday] = useState<number | null>(null);
  const [day, setDay] = useState(0);
  const [period, setPeriod] = useState<Period>('AM');
  const [checks, setChecks] = useState<Checks>({});
  const weekRef = useRef<HTMLDivElement>(null);

  // The day and time come from the visitor's clock, so set them after hydration.
  useEffect(() => {
    const now = new Date();
    setToday(now.getDay());
    setDay(now.getDay());
    setPeriod(now.getHours() < 15 ? 'AM' : 'PM');
    if (window.location.hash === '#products') setTab('products');
  }, []);

  useEffect(() => {
    setChecks(readChecks(day));
    const week = weekRef.current;
    const selected = week?.children[day] as HTMLElement | undefined;
    if (week && selected && week.scrollWidth > week.clientWidth) {
      week.scrollLeft = selected.offsetLeft - (week.clientWidth - selected.offsetWidth) / 2;
    }
  }, [day, today]);

  function toggle(id: string, value: boolean) {
    const next = { ...checks, [id]: value };
    setChecks(next);
    writeChecks(day, next);
  }

  function clearDay() {
    setChecks({});
    writeChecks(day, {});
  }

  function selectTab(next: Tab) {
    setTab(next);
    window.history.replaceState(null, '', next === 'products' ? '#products' : window.location.pathname);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }

  // "How to" opens without ticking the step.
  function onDetailsClick(event: MouseEvent<HTMLDetailsElement>) {
    event.preventDefault();
    if ((event.target as HTMLElement).closest('summary')) event.currentTarget.toggleAttribute('open');
  }

  const ready = today !== null;
  const counts = (['AM', 'PM'] as Period[]).map((p) => {
    const steps = stepsFor(p, day);
    return { period: p, steps, done: steps.filter((step) => checks[step.id]).length };
  });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandGroup}>
          <Link className={styles.brand} href="/">mic7aelr</Link>
          <span className={styles.sectionLabel}>Routine</span>
        </div>
        <nav className={styles.headerNav} aria-label="Routine navigation">
          <Link href="/discovery">Discovery</Link>
          <Link href="/comics">Comics</Link>
          <Link href="/writing">Writing</Link>
        </nav>
        <div className={styles.headerActions}>
          <ThemeToggle className={styles.themeToggle} />
          <Link href="/">Portfolio</Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.tabs} role="tablist" aria-label="Routine sections">
          {(['routine', 'products'] as Tab[]).map((name) => (
            <button
              key={name}
              className={styles.tab}
              type="button"
              role="tab"
              aria-selected={tab === name}
              onClick={() => selectTab(name)}
            >
              {name === 'routine' ? 'Routine' : 'Products'}
            </button>
          ))}
        </div>

        {tab === 'routine' ? (
          <section role="tabpanel" aria-label="Routine">
            <div className={styles.hero}>
              <div>
                <p className={styles.eyebrow}>Daily care · 20 products</p>
                <h1>Morning <em>&amp;</em> night</h1>
              </div>
              <div className={styles.heroAside}>
                <p>
                  <strong>{DAYS[day]}.</strong> {NIGHT_FOCUS_TEXT[day]}
                  {HISMILE_DAYS.includes(day) ? ' HiSmile in the morning.' : ''}
                </p>
                <p className={styles.hint}>Select a day to see its steps. Checks save in this browser only.</p>
              </div>
            </div>

            <div className={styles.toolbar}>
              <span className={styles.label}>The week</span>
              <button className={styles.clear} type="button" onClick={clearDay}>Clear this day</button>
            </div>
            <div className={styles.week} ref={weekRef} aria-label="Select a day">
              {DAYS.map((name, index) => (
                <button
                  key={name}
                  className={styles.day}
                  type="button"
                  aria-pressed={index === day}
                  onClick={() => setDay(index)}
                >
                  <span className={styles.dayName}>{name.slice(0, 3)}</span>
                  <span className={styles.dayFocus}>{NIGHT_FOCUS[index]}</span>
                  {index === today ? <span className={styles.today}>Today</span> : null}
                </button>
              ))}
            </div>

            <div className={styles.seg} aria-label="Morning or night">
              {counts.map(({ period: p, steps, done }) => (
                <button key={p} type="button" aria-pressed={p === period} onClick={() => setPeriod(p)}>
                  {p === 'AM' ? 'Morning' : 'Night'}
                  <span>{pad(done)}/{pad(steps.length)}</span>
                </button>
              ))}
            </div>

            <div className={styles.periods} data-show={period} data-ready={ready}>
              {counts.map(({ period: p, steps, done }) => {
                const phases = steps.reduce<{ phase: string; steps: typeof steps }[]>((groups, step) => {
                  const last = groups[groups.length - 1];
                  if (last?.phase === step.phase) last.steps.push(step);
                  else groups.push({ phase: step.phase, steps: [step] });
                  return groups;
                }, []);
                let n = 0;
                return (
                  <div className={styles.period} data-period={p} key={p}>
                    <div className={styles.periodHead}>
                      <h2>{p === 'AM' ? 'Morning' : 'Night'}</h2>
                      <span className={styles.count}>{pad(done)} / {pad(steps.length)}</span>
                    </div>
                    {phases.map((group) => (
                      <div className={styles.phase} key={group.phase}>
                        <span className={styles.label}>{group.phase}</span>
                        <ol className={styles.steps}>
                          {group.steps.map((step) => {
                            n += 1;
                            const tag = step.tag ? byDay(step.tag, day) : '';
                            const on = Boolean(checks[step.id]);
                            return (
                              <li key={step.id}>
                                <label className={`${styles.step} ${on ? styles.checked : ''} ${step.slot ? styles.slot : ''}`}>
                                  <span className={styles.n}>{pad(n)}</span>
                                  <span className={styles.body}>
                                    <span className={styles.what}>
                                      <span className={styles.label}>{step.name}</span>
                                      {tag ? <span className={styles.tag}>{tag}</span> : null}
                                    </span>
                                    <span className={styles.product}>{byDay(step.product, day)}</span>
                                    {step.how ? (
                                      <details className={styles.how} onClick={onDetailsClick}>
                                        <summary>How to</summary>
                                        <ol>
                                          {HOW[step.how].map((line) => <li key={line}>{line}</li>)}
                                        </ol>
                                      </details>
                                    ) : null}
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={on}
                                    onChange={(event) => toggle(step.id, event.target.checked)}
                                    aria-label={step.name}
                                  />
                                </label>
                              </li>
                            );
                          })}
                        </ol>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            <div className={styles.why}>
              <span className={styles.label}>Why this order</span>
              <ul>
                {WHY.map(([title, text]) => (
                  <li key={title}><strong>{title}</strong>{text}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : (
          <section role="tabpanel" aria-label="Products">
            <div className={styles.hero}>
              <div>
                <p className={styles.eyebrow}>The shelf</p>
                <h1>What each <em>product</em> does</h1>
              </div>
              <div className={styles.heroAside}>
                <p>18 products are in the rotation. 2 products are backups.</p>
                <p>Niacinamide and retinal have steps in the routine, but no product yet.</p>
              </div>
            </div>
            {PRODUCTS.map((group) => (
              <div className={styles.group} key={group.group}>
                <span className={styles.label}>{group.group}</span>
                <div className={styles.rows}>
                  {group.items.map((product) => (
                    <article className={styles.row} key={product.name}>
                      <div>
                        <span className={`${styles.label} ${styles.role}`}>{product.role}</span>
                        <h3>{product.name}</h3>
                        <p>{product.text}</p>
                      </div>
                      <div className={styles.when}>
                        <span className={styles.label}>{product.when}</span>
                        {product.days ? <span>{product.days}</span> : null}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
