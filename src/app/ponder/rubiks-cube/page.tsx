import type { Metadata } from 'next';
import { CubeSolver } from '@/components/ponder/CubeSolver';
import { PonderHeader } from '@/components/ponder/PonderHeader';
import { ALG_SETS, type AlgSet } from '@/lib/cfop-algs';
import { buildTables } from '@/lib/cfop-tables';
import { isPonderAuthenticated } from '@/lib/ponder-auth';
import styles from '../Ponder.module.css';

export const metadata: Metadata = {
  title: 'CFOP with Jev — Ponder',
  description: 'A Rubik’s Cube solver. Code applies CFOP. Jev, a System One model from TypeSafe AI, makes the decisions.',
};

const SET_INFO: Record<AlgSet, { label: string; description: string }> = {
  F2L: { label: 'F2L', description: 'Insert a corner and edge pair into its slot.' },
  OLL: { label: 'OLL', description: 'Orient the last layer. All 57 cases.' },
  PLL: { label: 'PLL', description: 'Permute the last layer. All 21 cases, with alternate algorithms.' },
  COLL: { label: 'COLL', description: 'Solve the last-layer corners when the edges are oriented.' },
  WV: { label: 'Winter Variation', description: 'Insert the last pair and orient the corners in one algorithm.' },
};

export default async function RubiksCubePage() {
  // The layout shows the password form. Send no page data to a visitor who has not signed in.
  if (!(await isPonderAuthenticated())) return null;

  const { accepted, rejections } = buildTables();
  const catalog = (Object.keys(ALG_SETS) as AlgSet[]).map((set) => ({
    id: set,
    ...SET_INFO[set],
    verified: accepted[set],
    cases: ALG_SETS[set].map((entry) => ({ name: entry.name, algs: entry.algs })),
  }));

  return (
    <div className={styles.page}>
      <PonderHeader section="CFOP with Jev" />
      <CubeSolver catalog={catalog} rejected={rejections.length} />
    </div>
  );
}
