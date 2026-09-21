'use client';

import { Lock } from '@phosphor-icons/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import styles from '@/app/ponder/Ponder.module.css';

export function PonderGate({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !password) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/ponder/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Could not unlock.');
      router.refresh();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not unlock.');
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandGroup}>
          <Link className={styles.brand} href="/">mic7aelr</Link>
          <span className={styles.sectionLabel}>Ponder</span>
        </div>
        <div className={styles.headerActions}>
          <ThemeToggle className={styles.themeToggle} />
          <Link href="/">Portfolio</Link>
        </div>
      </header>

      <main className={styles.gateMain}>
        <div className={styles.gatePanel}>
          <span className={styles.gateIcon} aria-hidden="true"><Lock weight="regular" /></span>
          <h1>Ponder</h1>
          {configured ? (
            <>
              <p className={styles.gateText}>This page is private. Enter the password to continue.</p>
              <form className={styles.gateForm} onSubmit={(event) => void submit(event)}>
                <label className={styles.fieldLabel} htmlFor="ponder-password">Password</label>
                <input
                  id="ponder-password"
                  className={styles.wlInput}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  autoFocus
                  disabled={busy}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'ponder-password-error' : undefined}
                />
                {error && <p id="ponder-password-error" className={styles.fieldError} role="alert">{error}</p>}
                <button className={styles.solveButton} type="submit" disabled={busy || password.length === 0}>
                  {busy ? 'Checking…' : 'Unlock'}
                </button>
              </form>
            </>
          ) : (
            <p className={styles.fieldError} role="alert">Ponder is locked. The server has no PONDER_PASSWORD.</p>
          )}
        </div>
      </main>
    </div>
  );
}
