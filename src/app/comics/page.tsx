import type { Metadata } from 'next';
import { ComicsLibrary } from '@/components/ComicsLibrary';
import { getComics } from '@/lib/comics-data';
import { isAdmin } from '@/lib/writing-auth';

export const metadata: Metadata = {
  title: 'Comics | Michael Rodriguez',
  description: 'The comic books Michael Rodriguez has read, owns, and wants to collect.',
};

export const dynamic = 'force-dynamic';

export default async function ComicsPage() {
  const [initialComics, authenticated] = await Promise.all([getComics(), isAdmin()]);
  return <ComicsLibrary initialComics={initialComics} authenticated={authenticated} />;
}
