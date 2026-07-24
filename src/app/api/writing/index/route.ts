import { NextResponse } from 'next/server';
import { getWritingIndex } from '@/lib/writing-data';
import { isAdmin } from '@/lib/writing-auth';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  return NextResponse.json(await getWritingIndex());
}
