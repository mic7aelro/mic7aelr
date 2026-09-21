'use client';

import { useState } from 'react';
import styles from '@/app/ponder/Ponder.module.css';

export interface CatalogSet {
  id: string;
  label: string;
  description: string;
  verified: number;
  cases: { name: string; algs: string[] }[];
}

export function AlgCatalog({ catalog, rejected }: { catalog: CatalogSet[]; rejected: number }) {
  const [active, setActive] = useState(catalog[0].id);
  const set = catalog.find((entry) => entry.id === active) ?? catalog[0];
  const total = set.cases.reduce((sum, entry) => sum + entry.algs.length, 0);

  return (
    <section className={styles.section} aria-labelledby="catalog-title">
      <div className={styles.sectionHead}>
        <h2 id="catalog-title">Algorithm catalog</h2>
        <p>
          The solver knows {catalog.reduce((sum, entry) => sum + entry.cases.length, 0)} cases.
          The simulator checked every algorithm before the solver used it.
          {rejected === 0 ? ' No algorithm failed the check.' : ` ${rejected} algorithms failed the check and the solver skips them.`}
        </p>
      </div>

      <div className={styles.tabs} role="tablist">
        {catalog.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={entry.id === active}
            className={entry.id === active ? styles.tabActive : styles.tab}
            onClick={() => setActive(entry.id)}
          >
            {entry.label}
            <span>{entry.cases.length}</span>
          </button>
        ))}
      </div>

      <p className={styles.catalogNote}>
        {set.description} {set.verified} of {total} algorithms passed the check.
      </p>

      <ul className={styles.catalogList}>
        {set.cases.map((entry) => (
          <li key={entry.name}>
            <span className={styles.caseName}>{entry.name}</span>
            <span className={styles.caseAlgs}>
              {entry.algs.map((alg) => <code key={alg}>{alg}</code>)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
