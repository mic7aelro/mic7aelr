import type { Metadata } from 'next';
import Link from 'next/link';
import { WritingSignOut } from '@/components/WritingSignOut';
import { ThemeToggle } from '@/components/ThemeToggle';
import { isAdmin } from '@/lib/writing-auth';
import styles from './Writing.module.css';

export const metadata: Metadata = {
  title: 'Writing | Michael Rodriguez',
  description: 'Writing and discussion by Michael Rodriguez.',
};

export default async function WritingLayout({ children }: { children: React.ReactNode }) {
  const authenticated = await isAdmin();
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brandGroup}><Link className={styles.brand} href="/">mic7aelr</Link><Link className={styles.writingHome} href="/writing">Writing</Link></div>
        <nav className={styles.nav} aria-label="Writing navigation">
          <Link href="/#work">Work</Link>
        </nav>
        <div className={styles.headerActions}>
          <ThemeToggle className={styles.themeToggle} />
          {authenticated ? <WritingSignOut /> : <Link className={styles.adminLink} href="/writing/admin">Author login</Link>}
        </div>
      </header>
      {children}
    </div>
  );
}
