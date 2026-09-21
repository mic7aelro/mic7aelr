import type { Metadata } from 'next';
import { PonderHeader } from '@/components/ponder/PonderHeader';
import { WavelengthGame } from '@/components/ponder/WavelengthGame';
import { isPonderAuthenticated } from '@/lib/ponder-auth';
import styles from '../Ponder.module.css';

export const metadata: Metadata = {
  title: 'Wavelength with Jev — Ponder',
  description: 'A word game. Write a clue for a hidden target on a scale. Jev guesses where the clue lands.',
};

export default async function WavelengthPage() {
  if (!(await isPonderAuthenticated())) return null;

  return (
    <div className={styles.page}>
      <PonderHeader section="Wavelength" />
      <WavelengthGame />
    </div>
  );
}
