import { NextResponse } from 'next/server';
import {
  authIsConfigured, clearAdminSession, createAdminSession, isAdmin, requestOtp, verifyOtp,
} from '@/lib/writing-auth';
import { cleanText } from '@/lib/writing-utils';

export async function GET() {
  return NextResponse.json({ authenticated: await isAdmin() });
}

export async function POST(request: Request) {
  if (!authIsConfigured()) {
    return NextResponse.json({
      error: 'Sign-in is not configured. Set RESEND_API_KEY and WRITING_SESSION_SECRET on the server.',
    }, { status: 503 });
  }

  const body = await request.json();

  if (body.step === 'verify') {
    const code = cleanText(body.code, 6);
    if (!code) return NextResponse.json({ error: 'Enter the 6-digit code.' }, { status: 400 });
    if (!(await verifyOtp(code))) {
      return NextResponse.json({ error: 'That code is not correct or has expired.' }, { status: 401 });
    }
    await createAdminSession();
    return NextResponse.json({ authenticated: true });
  }

  try {
    await requestOtp();
    return NextResponse.json({ sent: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'The code could not be sent.' }, { status: 429 });
  }
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ authenticated: false });
}
