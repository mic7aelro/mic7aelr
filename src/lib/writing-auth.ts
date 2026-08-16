import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { Resend } from 'resend';
import { getWritingDatabase } from './mongodb';

const COOKIE_NAME = 'writing_admin';
const SESSION_DURATION = 60 * 60 * 24 * 7;

// The only address that can sign in as the author.
const ADMIN_EMAIL = 'mic7aelro@gmail.com';
const OTP_TTL_SECONDS = 10 * 60;
const OTP_RESEND_COOLDOWN_SECONDS = 30;
const OTP_MAX_ATTEMPTS = 5;

type OtpRecord = { id: 'admin'; codeHash: string; expires: number; attempts: number; createdAt: number };

function getSecret() {
  return process.env.WRITING_SESSION_SECRET || '';
}

function sign(value: string) {
  return createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function hashCode(code: string) {
  return createHmac('sha256', getSecret()).update(`otp:${code}`).digest('base64url');
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function authIsConfigured() {
  return Boolean(process.env.RESEND_API_KEY && getSecret());
}

/** Send a one-time sign-in code to the author's email. */
export async function requestOtp() {
  if (!authIsConfigured()) throw new Error('Sign-in is not configured.');

  const database = await getWritingDatabase();
  const collection = database.collection<OtpRecord>('authOtp');
  const existing = await collection.findOne({ id: 'admin' });
  const now = Date.now();
  if (existing && now - existing.createdAt < OTP_RESEND_COOLDOWN_SECONDS * 1000) {
    throw new Error('Wait a moment before you request another code.');
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
  await collection.updateOne(
    { id: 'admin' },
    { $set: { codeHash: hashCode(code), expires: now + OTP_TTL_SECONDS * 1000, attempts: 0, createdAt: now } },
    { upsert: true },
  );

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign-In Code</title>
  <style>
    body { background: #000; color: #fff; font-family: 'DM Sans', ui-sans-serif, system-ui, -apple-system, sans-serif; margin: 0; padding: 0; }
    .wrap { max-width: 560px; margin: 0 auto; padding: 48px 32px; }
    h1 { font-size: 22px; font-weight: 300; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 32px; font-family: 'Cormorant Garamond', 'Cormorant', Georgia, serif; }
    p { font-size: 14px; line-height: 1.8; opacity: 0.8; margin: 0 0 20px; }
    .code { font-family: 'Cormorant Garamond', 'Cormorant', Georgia, serif; font-size: 48px; letter-spacing: 0.15em; margin: 8px 0 32px; }
    .label { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; opacity: 0.4; margin-bottom: 4px; margin-top: 32px; }
    .footer { margin-top: 48px; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.3; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Sign-In Code</h1>
    <p>Enter this code to sign in as the author. It expires in 10 minutes.</p>
    <div class="code">${code}</div>
    <p>If you did not request this, ignore this email.</p>
    <div class="footer">Michael Rodriguez - Software Engineer</div>
  </div>
</body>
</html>`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'Portfolio Sign-In <donotreply@mic7aelr.com>',
    to: ADMIN_EMAIL,
    subject: `Your sign-in code: ${code}`,
    html,
    text: `Your sign-in code is ${code}. The code expires in 10 minutes. If you did not request this, ignore this email.`,
  });
}

/** Check a submitted code against the stored one-time code. */
export async function verifyOtp(code: string) {
  if (!authIsConfigured()) return false;

  const database = await getWritingDatabase();
  const collection = database.collection<OtpRecord>('authOtp');
  const record = await collection.findOne({ id: 'admin' });
  if (!record) return false;

  if (Date.now() > record.expires || record.attempts >= OTP_MAX_ATTEMPTS) {
    await collection.deleteOne({ id: 'admin' });
    return false;
  }

  if (!safeEqual(hashCode(code), record.codeHash)) {
    await collection.updateOne({ id: 'admin' }, { $inc: { attempts: 1 } });
    return false;
  }

  await collection.deleteOne({ id: 'admin' });
  return true;
}

export async function createAdminSession() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_DURATION;
  const payload = Buffer.from(JSON.stringify({ role: 'author', expires })).toString('base64url');
  const value = `${payload}.${sign(payload)}`;
  const store = await cookies();
  store.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DURATION,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdmin() {
  if (!authIsConfigured()) return false;
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return false;
  const [payload, signature] = value.split('.');
  if (!payload || !signature || !safeEqual(sign(payload), signature)) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { role: string; expires: number };
    return session.role === 'author' && session.expires > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
