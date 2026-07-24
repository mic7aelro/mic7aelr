'use client';

import styles from '@/app/writing/Writing.module.css';

export function WritingSignOut() {
  return (
    <button
      className={styles.adminLink}
      type="button"
      onClick={async () => {
        await fetch('/api/writing/auth', { method: 'DELETE' });
        window.location.assign('/writing');
      }}
    >
      Sign out
    </button>
  );
}
