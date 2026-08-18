import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import styles from './Packages.module.css';

type Package = {
  number: string;
  name: string;
  pitch: string;
  includes: string[];
  bestFor: string;
  price: string;
  timeline: string;
};

const packages: Package[] = [
  {
    number: '01',
    name: 'The Static Site',
    pitch: 'A fast, focused site with no backend.',
    includes: [
      'Custom design, built in code',
      'A responsive layout for every screen',
      'One round of revisions',
      'Deploy to your domain',
    ],
    bestFor: 'A landing page, a portfolio, or an announcement site.',
    price: 'From $800',
    timeline: '1–2 weeks',
  },
  {
    number: '02',
    name: 'The Full Build',
    pitch: 'A web app with a real backend.',
    includes: [
      'A custom backend and database',
      'User accounts and authentication',
      'Admin tools to manage your content',
      'Integrations with the tools you already use',
    ],
    bestFor: 'A product that stores data and does more than display information.',
    price: 'From $3,000',
    timeline: '3–6 weeks',
  },
  {
    number: '03',
    name: 'The Partnership',
    pitch: 'Ongoing engineering, on call.',
    includes: [
      'Dedicated hours every month',
      'Direct access, no account managers',
      'Architecture, features, and fixes as you grow',
      'Priority turnaround on requests',
    ],
    bestFor: 'A founder who needs a technical partner, not a one-off project.',
    price: 'From $1,500/mo',
    timeline: 'Ongoing',
  },
];

export function Packages() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandGroup}>
          <Link className={styles.brand} href="/">mic7aelr</Link>
          <span className={styles.sectionLabel}>Packages</span>
        </div>
        <div className={styles.headerActions}>
          <ThemeToggle className={styles.themeToggle} />
          <Link href="/">Portfolio</Link>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Work with me</p>
            <h1>Three ways to build.</h1>
          </div>
          <div className={styles.heroAside}>
            <p>Every project starts as one of these three shapes. Pick the one closest to what you need, and we&apos;ll scope the details from there.</p>
            <p className={styles.quote}>Fixed scope. No surprises.</p>
          </div>
        </section>

        <section className={styles.grid}>
          {packages.map((pkg) => (
            <article className={styles.card} key={pkg.number}>
              <span className={styles.cardNumber}>{pkg.number}</span>
              <h2 className={styles.cardName}>{pkg.name}</h2>
              <p className={styles.cardPitch}>{pkg.pitch}</p>

              <div className={styles.cardBlock}>
                <h3>Includes</h3>
                <ul>{pkg.includes.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>

              <div className={styles.cardBlock}>
                <h3>Best for</h3>
                <p>{pkg.bestFor}</p>
              </div>

              <div className={styles.cardFooter}>
                <div>
                  <span className={styles.cardLabel}>Price</span>
                  <strong>{pkg.price}</strong>
                </div>
                <div>
                  <span className={styles.cardLabel}>Timeline</span>
                  <strong>{pkg.timeline}</strong>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className={styles.cta}>
          <h2>Not sure which one fits?</h2>
          <p>Tell me what you&apos;re building and I&apos;ll tell you what it takes.</p>
          <a className={styles.ctaLink} href="mailto:michael@mic7aelr.com">Email me</a>
        </section>
      </main>
    </div>
  );
}
