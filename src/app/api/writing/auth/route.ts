import { NextResponse } from 'next/server';
import { authIsConfigured, clearAdminSession, createAdminSession, isAdmin, verifyCredentials } from '@/lib/writing-auth';
import { cleanText } from '@/lib/writing-utils';

export async function GET() {
  return NextResponse.json({ authenticated: await isAdmin() });
}

export async function POST(request: Request) {
  if (!authIsConfigured()) {
    return NextResponse.json({
      error: 'Login is not configured. Set WRITING_ADMIN_USERNAME, WRITING_ADMIN_PASSWORD, and WRITING_SESSION_SECRET on the server.',
    }, { status: 503 });
  }

  const body = await request.json();
  const username = cleanText(body.username, 100);
  const password = cleanText(body.password, 300);
  if (!verifyCredentials(username, password)) {
    return NextResponse.json({ error: 'The username or password is not correct.' }, { status: 401 });
  }
  await createAdminSession();
  return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ authenticated: false });
}
