'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TREES, type TreeId } from '@/components/Discovery';
import styles from './Discovery.module.css';

export function DiscoveryRedesign() {
  const [activeTreeId, setActiveTreeId] = useState<TreeId>('ml');
  const [selected, setSelected] = useState(0);
  const activeTree = TREES.find((tree) => tree.id === activeTreeId) ?? TREES[0];
  const selectedPhase = activeTree.phases[selected] ?? activeTree.phases[0];

  function selectTree(id: TreeId) {
    setActiveTreeId(id);
    setSelected(0);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandGroup}>
          <Link className={styles.brand} href="/">mic7aelr</Link>
          <span className={styles.sectionLabel}>Discovery</span>
        </div>
        <nav className={styles.headerNav} aria-label="Discovery navigation">
          <Link href="/comics">Comics</Link>
          <Link href="/writing">Writing</Link>
        </nav>
        <div className={styles.headerActions}>
          <ThemeToggle className={styles.themeToggle} />
          <Link href="/">Portfolio</Link>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>A personal curriculum</p>
            <h1>A map for what comes next.</h1>
          </div>
          <div className={styles.heroAside}>
            <p>Three paths through mathematics, physics, and cloud engineering. Each path starts with first principles and ends with practical fluency.</p>
            <p className={styles.quote}>Learn the system. Then build with it.</p>
          </div>
        </section>

        <nav className={styles.trackNav} aria-label="Learning paths">
          {TREES.map((tree, index) => (
            <button
              className={`${styles.trackButton} ${activeTreeId === tree.id ? styles.trackButtonActive : ''}`}
              key={tree.id}
              type="button"
              onClick={() => selectTree(tree.id)}
              aria-pressed={activeTreeId === tree.id}
            >
              <span className={styles.trackNumber}>{String(index + 1).padStart(2, '0')}</span>
              <strong>{tree.label}</strong>
            </button>
          ))}
        </nav>

        <section className={styles.path}>
          <div className={styles.pathHeader}>
            <h2>{activeTree.label}</h2>
            <div className={styles.pathCopy}>
              <p>{activeTree.description}</p>
              <span className={styles.trackMeta}>{activeTree.phases.length} phases · Self-directed</span>
            </div>
          </div>

          <div className={styles.phases}>
            {activeTree.phases.map((phase, index) => (
              <button
                className={`${styles.phase} ${selected === index ? styles.phaseActive : ''}`}
                key={phase.id}
                type="button"
                onClick={() => setSelected(index)}
                aria-expanded={selected === index}
              >
                <span className={styles.phaseIndex}>{String(index + 1).padStart(2, '0')}</span>
                <span>
                  <span className={styles.phaseTitle}>{phase.name}</span>
                  <span className={styles.phaseSubtitle}>{phase.subtitle}</span>
                </span>
                <span className={styles.phaseDescription}>{phase.description}</span>
                <span className={styles.phaseDuration}>{phase.duration}</span>
              </button>
            ))}
          </div>

          <article className={styles.detail} aria-live="polite">
            <div className={styles.detailHeading}>
              <span className={styles.detailLabel}>Phase {String(selected + 1).padStart(2, '0')}</span>
              <h3>{selectedPhase.name}</h3>
            </div>
            <div className={styles.detailGrid}>
              <section className={styles.detailBlock}>
                <h4>Purpose</h4>
                <p>{selectedPhase.goal}</p>
              </section>
              <section className={styles.detailBlock}>
                <h4>Duration</h4>
                <p>{selectedPhase.duration}</p>
              </section>
              <section className={styles.detailBlock}>
                <h4>Topics</h4>
                <ul>{selectedPhase.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
              </section>
              <section className={styles.detailBlock}>
                <h4>Resources</h4>
                <ul>{selectedPhase.resources.map((resource) => <li key={resource}>{resource}</li>)}</ul>
              </section>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
