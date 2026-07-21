import type { Metadata } from 'next';
import { PortfolioPresentation } from '@/components/PortfolioPresentation';

export const metadata: Metadata = {
  title: 'Michael Rodriguez | Software Engineer',
  description: 'Portfolio of Michael Rodriguez, a software engineer building fast, stable digital products.',
};

export default function Home() {
  return <PortfolioPresentation />;
}
