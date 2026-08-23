'use client';

import { useState, type FormEvent } from 'react';
import styles from '@/app/fantasyfootball/FantasyFootball.module.css';

export function UnlockDialog({ slug, boardName, onClose, onUnlocked }: {
  slug: string;
  boardName: string;
  onClose: () => void;
  onUnlocked: () => void;
}) {
  const [pin, setPin] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError('');
    const response = await fetch(`/api/fantasyfootball/boards/${slug}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) { setError(data.error || 'That PIN is not correct.'); return; }
    onUnlocked();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(event) => event.stopPropagation()}>
        <h2>Enter PIN</h2>
        <p>Enter the PIN for &ldquo;{boardName}&rdquo; to move players or connect a Sleeper league.</p>
        <form className={styles.form} onSubmit={submit}>
          <label>
            PIN
            <input
              className={styles.field}
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))}
              autoFocus
              required
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.dialogActions}>
            <button type="button" className={styles.secondaryButton} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.button} disabled={pending}>
              {pending ? 'Checking…' : 'Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
