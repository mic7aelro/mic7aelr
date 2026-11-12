import type { Metadata } from 'next';
import { BulkLabeler } from '@/components/ponder/BulkLabeler';
import { PonderHeader } from '@/components/ponder/PonderHeader';
import { isPonderAuthenticated } from '@/lib/ponder-auth';
import styles from '../Ponder.module.css';

export const metadata: Metadata = {
  title: 'Bulk Labeler — Ponder',
  description: 'Upload a spreadsheet. Jev labels every row with your categories and checks its own accuracy.',
};

export default async function BulkLabelerPage() {
  if (!(await isPonderAuthenticated())) return null;

  return (
    <div className={styles.page}>
      <PonderHeader section="Bulk Labeler" />
      <BulkLabeler />
    </div>
  );
}
