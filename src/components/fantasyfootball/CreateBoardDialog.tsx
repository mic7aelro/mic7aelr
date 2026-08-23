'use client';

import { useState, type FormEvent } from 'react';
import type { FantasyBoard, FantasyTemplate } from '@/types/fantasy';
import styles from '@/app/fantasyfootball/FantasyFootball.module.css';

const TEMPLATES: Array<{ value: FantasyTemplate; label: string }> = [
  { value: 'sleeper', label: 'Sleeper' },
  { value: 'espn', label: 'ESPN' },
  { value: 'cbs', label: 'CBS' },
];

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function CreateBoardDialog({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: (board: FantasyBoard) => void;
}) {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState<FantasyTemplate>('sleeper');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pin !== confirmPin) { setError('The PINs do not match.'); return; }

    setPending(true);
    setError('');
    const response = await fetch('/api/fantasyfootball/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, template, pin }),
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) { setError(data.error || 'The board could not be created.'); return; }
    onCreated(data.board as FantasyBoard);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(event) => event.stopPropagation()}>
        <h2>Create a board</h2>
        <p>Choose a starting template. Every template begins with the same current player pool, sorted a little differently. Drag players to match your own rankings once the board is open.</p>
        <form className={styles.form} onSubmit={submit}>
          <label>
            Name
            <input className={styles.field} value={name} onChange={(event) => setName(event.target.value)} maxLength={60} required autoFocus />
          </label>
          <label>
            Starting template
            <div className={styles.templateOptions}>
              {TEMPLATES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={classNames(styles.templateOption, template === option.value && styles.templateOptionActive)}
                  onClick={() => setTemplate(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </label>
          <label>
            PIN (4 to 8 digits)
            <input
              className={styles.field}
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))}
              minLength={4}
              maxLength={8}
              required
            />
          </label>
          <label>
            Confirm PIN
            <input
              className={styles.field}
              inputMode="numeric"
              pattern="[0-9]*"
              value={confirmPin}
              onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, ''))}
              minLength={4}
              maxLength={8}
              required
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.dialogActions}>
            <button type="button" className={styles.secondaryButton} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.button} disabled={pending}>
              {pending ? 'Creating…' : 'Create board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
