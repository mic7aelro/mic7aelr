import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { PonderGate } from '@/components/ponder/PonderGate';
import { isPonderAuthenticated, ponderAuthIsConfigured } from '@/lib/ponder-auth';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Every page under /ponder needs the password. */
export default async function PonderLayout({ children }: { children: ReactNode }) {
  if (!(await isPonderAuthenticated())) return <PonderGate configured={ponderAuthIsConfigured()} />;
  return children;
}
