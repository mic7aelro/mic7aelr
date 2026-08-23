'use client';

import { useState, type FormEvent } from 'react';
import styles from '@/app/fantasyfootball/FantasyFootball.module.css';

export function PasswordGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError('');
    const response = await fetch('/api/fantasyfootball/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) { setError(data.error || 'That password is not correct.'); return; }
    onAuthenticated();
  };

  return (
    <div className={styles.gate}>
      <h1>Fantasy Football</h1>
      <p>Enter the site password to see draft boards.</p>
      <form className={styles.form} onSubmit={submit}>
        <label>
          Password
          <input
            className={styles.field}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
            required
          />
        </label>
        <button className={styles.button} type="submit" disabled={pending}>
          {pending ? 'Checking…' : 'Enter'}
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
}
