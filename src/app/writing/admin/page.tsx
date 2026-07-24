import { WritingAdmin } from '@/components/WritingAdmin';
import { isAdmin } from '@/lib/writing-auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function WritingAdminPage() {
  if (await isAdmin()) redirect('/writing');
  return <WritingAdmin initialAuthenticated={false} />;
}
