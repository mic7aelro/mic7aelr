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
  note?: string;
  slug?: string;
};

const packages: Package[] = [
  {
    number: '01',
    name: 'The Static Site',
    pitch: 'A fast, focused site with no backend.',
    includes: [
      'Custom design, built in code',
      'A responsive layout for every screen',
      'Two rounds of revisions',
      'Deploy to your domain',
      'Hosting set up for you, billed to your own account',
      '30 days of free bug fixes after launch',
      'A 3-year domain registration included, if you need one',
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
      'Hosting set up for you, billed to your own account',
      '30 days of free bug fixes after launch',
      'A 3-year domain registration included, if you need one',
    ],
    bestFor: 'A product that stores data and does more than display information.',
    price: 'From $2,500',
    timeline: '2–4 weeks',
    note: 'Storage beyond standard use is scoped per project, typically under a Partnership plan.',
  },
  {
    number: '03',
    name: 'The Partnership',
    pitch: 'Support after launch, priced simply.',
    includes: [
      'Monthly maintenance and monitoring',
      'Small fixes and content updates included',
      'Extra feature work billed at $50/hr',
      'Priority response when something breaks',
    ],
    bestFor: 'A live site or app that needs someone watching it, not a full-time hire.',
    slug: 'partnership',
    price: 'From $99/mo',
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
            <article className={styles.card} key={pkg.number} id={pkg.slug}>
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
                {pkg.note && (
                  <p className={styles.cardNote}>
                    {pkg.note.split('Partnership').map((part, index, parts) => (
                      <span key={index}>
                        {part}
                        {index < parts.length - 1 && <a className={styles.cardNoteLink} href="#partnership">Partnership</a>}
                      </span>
                    ))}
                  </p>
                )}
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
