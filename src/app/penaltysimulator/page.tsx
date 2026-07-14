import type { Metadata } from 'next';
import { Anton, Oswald, Inter } from 'next/font/google';
import { PenaltySimulator } from '@/components/penalty/PenaltySimulator';

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
  display: 'swap',
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Penalty Simulator — Liverpool Shootout',
  description:
    'Set your penalty order from the active Liverpool FC roster, then drag to aim, time the power bar, and beat the keeper — five kicks, one scoreline.',
};

export default function PenaltySimulatorPage() {
  return (
    <main className={`${anton.variable} ${oswald.variable} ${inter.variable}`}>
      <PenaltySimulator />
    </main>
  );
}
