import type { Metadata } from 'next';
import { DiscoveryRedesign } from '@/components/DiscoveryRedesign';

export const metadata: Metadata = {
  title: 'Discovery — Michael Rodriguez',
  description: 'A self-study pathway through mathematics, machine learning, and astrophysics — learned from first principles.',
};

export default function DiscoveryPage() {
  return (
    <main>
      <DiscoveryRedesign />
    </main>
  );
}
