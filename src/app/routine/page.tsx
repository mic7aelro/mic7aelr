import type { Metadata } from 'next';
import { Routine } from '@/components/Routine';

export const metadata: Metadata = {
  title: 'Routine | Michael Rodriguez',
  description: 'The daily care routine of Michael Rodriguez: every product, what it does, and the morning and night order.',
};

export default function RoutinePage() {
  return <Routine />;
}
