import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import styles from '@/app/ponder/Ponder.module.css';
import { LockButton } from './LockButton';

export function PonderHeader({ section }: { section?: string }) {
  return (
    <header className={styles.header}>
      <div className={styles.brandGroup}>
        <Link className={styles.brand} href="/">mic7aelr</Link>
        <Link className={styles.sectionLabel} href="/ponder">Ponder</Link>
        {section && <span className={styles.subLabel}>{section}</span>}
      </div>
      <div className={styles.headerActions}>
        <ThemeToggle className={styles.themeToggle} />
        <LockButton className={styles.lockButton} />
        <Link href="/">Portfolio</Link>
      </div>
    </header>
  );
}
