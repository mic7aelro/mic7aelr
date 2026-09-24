'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PONDER_CATEGORIES, PONDER_PROJECTS, type PonderThumb } from '@/data/ponder';
import styles from '@/app/ponder/Ponder.module.css';
import { PonderHeader } from './PonderHeader';

const CUBE_COLORS = ['#f5f5f0', '#d5352d', '#21a35d', '#f3c918', '#f27f1c', '#2c66d6'];
const CUBE_PATTERN = [0, 2, 1, 5, 3, 0, 4, 1, 2];

function Thumb({ kind }: { kind: PonderThumb }) {
  if (kind === 'cube') {
    return (
      <div className={styles.thumbCube} aria-hidden="true">
        {CUBE_PATTERN.map((color, index) => <span key={index} style={{ background: CUBE_COLORS[color] }} />)}
      </div>
    );
  }
  if (kind === 'table') {
    return (
      <div className={styles.thumbTable} aria-hidden="true">
        {['positive', 'negative', 'positive', 'mixed'].map((label, row) => (
          <div key={row}>
            <span className={styles.thumbLine} />
            <span className={styles.thumbChip}>{label}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={styles.thumbDial} aria-hidden="true">
      <div className={styles.thumbBar}>
        <span className={styles.thumbTarget} />
        <span className={styles.thumbPin}><b>Jev</b></span>
      </div>
    </div>
  );
}

export function PonderIndex() {
  // Only show tabs for categories that have a project.
  const categories = PONDER_CATEGORIES.filter((category) => PONDER_PROJECTS.some((project) => project.category === category.id));
  const [active, setActive] = useState(categories[0].id);
  const projects = PONDER_PROJECTS.filter((project) => project.category === active);

  return (
    <div className={styles.page}>
      <PonderHeader />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Experiments</p>
            <h1>Ponder.</h1>
          </div>
          <div className={styles.heroAside}>
            <p>Small projects built with Jev and other AI models. Each one runs live on this site.</p>
            <p className={styles.quote}>One question. One typed answer.</p>
          </div>
        </section>

        <div className={styles.tabs} role="tablist" aria-label="Categories">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={category.id === active}
              className={category.id === active ? styles.tabActive : styles.tab}
              onClick={() => setActive(category.id)}
            >
              {category.label}
              <span>{PONDER_PROJECTS.filter((project) => project.category === category.id).length}</span>
            </button>
          ))}
        </div>

        <section className={styles.cardGrid} aria-label={active}>
          {projects.map((project) => (
            <Link className={styles.card} href={`/ponder/${project.slug}`} key={project.slug}>
              <div className={styles.cardThumb}>
                <Thumb kind={project.thumb} />
              </div>
              <h2 className={styles.cardTitle}>{project.title}</h2>
              <p className={styles.cardText}>{project.pitch}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
