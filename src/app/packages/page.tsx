import type { Metadata } from 'next';
import { Packages } from '@/components/Packages';

export const metadata: Metadata = {
  title: 'Packages — Michael Rodriguez',
  description: 'Fixed-scope ways to work together, from a static site to an ongoing partnership.',
  robots: { index: false, follow: false },
};

export default function PackagesPage() {
  return (
    <main>
      <Packages />
    </main>
  );
}
