import { FantasyApp } from '@/components/fantasyfootball/FantasyApp';
import { isSiteAuthenticated } from '@/lib/fantasy-auth';

export const dynamic = 'force-dynamic';

export default async function FantasyFootballPage() {
  return <FantasyApp initialAuthenticated={await isSiteAuthenticated()} />;
}
