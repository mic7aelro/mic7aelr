import type { Metadata } from 'next';
import { PonderIndex } from '@/components/ponder/PonderIndex';
import { isPonderAuthenticated } from '@/lib/ponder-auth';

export const metadata: Metadata = {
  title: 'Ponder — Michael Rodriguez',
  description: 'Small experiments with Jev and other AI models.',
};

export default async function PonderPage() {
  if (!(await isPonderAuthenticated())) return null;

  return <PonderIndex />;
}
