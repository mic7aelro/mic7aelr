import type { Metadata } from 'next';
import { Anton, Oswald, Inter } from 'next/font/google';
import { LiverpoolHub } from '@/components/liverpool/LiverpoolHub';

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
  display: 'swap',
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'This Is Anfield — Liverpool FC 25/26 Catch-Up Hub',
  description:
    'An unofficial fan catch-up hub for Liverpool FC, season 2025/26 — the verdict, history, squad, transfers, club culture and a study mode. Data current to June 2026.',
};

export default function LiverpoolPage() {
  return (
    <main className={`${anton.variable} ${oswald.variable} ${inter.variable}`}>
      <LiverpoolHub />
    </main>
  );
}
