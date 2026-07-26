import type { Metadata } from 'next';
import { ComicsLibrary } from '@/components/ComicsLibrary';

export const metadata: Metadata = {
  title: 'Comics | Michael Rodriguez',
  description: 'The comic books Michael Rodriguez has read, owns, and wants to collect.',
};

export default function ComicsPage() {
  return <ComicsLibrary />;
}
