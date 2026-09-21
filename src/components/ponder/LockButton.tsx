'use client';

import { useRouter } from 'next/navigation';

export function LockButton({ className }: { className?: string }) {
  const router = useRouter();

  async function lock() {
    await fetch('/api/ponder/auth', { method: 'DELETE' });
    router.refresh();
  }

  return <button className={className} type="button" onClick={() => void lock()}>Lock</button>;
}
