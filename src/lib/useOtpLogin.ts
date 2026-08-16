'use client';

import { useState } from 'react';

export function useOtpLogin(onSignedIn: () => void) {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const requestCode = async () => {
    setPending(true);
    setError('');
    const response = await fetch('/api/writing/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'request' }),
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) { setError(data.error || 'The code could not be sent.'); return; }
    setStep('verify');
  };

  const verifyCode = async (code: string) => {
    setPending(true);
    setError('');
    const response = await fetch('/api/writing/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'verify', code }),
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) { setError(data.error || 'That code is not correct.'); return; }
    onSignedIn();
  };

  return { step, pending, error, requestCode, verifyCode };
}
