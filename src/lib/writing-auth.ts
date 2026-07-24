import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'writing_admin';
const SESSION_DURATION = 60 * 60 * 24 * 7;

function getSecret() {
  return process.env.WRITING_SESSION_SECRET || '';
}

function sign(value: string) {
  return createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function authIsConfigured() {
  return Boolean(process.env.WRITING_ADMIN_USERNAME && process.env.WRITING_ADMIN_PASSWORD && getSecret());
}

export function verifyCredentials(username: string, password: string) {
  const expectedUsername = process.env.WRITING_ADMIN_USERNAME || '';
  const expectedPassword = process.env.WRITING_ADMIN_PASSWORD || '';
  return authIsConfigured() && safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword);
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
