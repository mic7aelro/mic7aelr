/**
 * Password gate for /ponder. The server holds one shared password in PONDER_PASSWORD.
 * A correct password sets a signed cookie. The cookie key comes from the password, so changing
 * the password ends every session. Use this file on the server only.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'ponder_session';
const SESSION_SECONDS = 60 * 60 * 24 * 30;

const getPassword = () => process.env.PONDER_PASSWORD || '';
const sign = (value: string, key: string) => createHmac('sha256', key).update(value).digest('base64url');

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

/** True when the server has a password. Without one, Ponder stays locked. */
export const ponderAuthIsConfigured = () => getPassword().length > 0;

/** Compare a submitted password with the real one. Both go through a hash, so their lengths do not leak. */
export function verifyPonderPassword(submitted: string, expected = getPassword()): boolean {
  if (!expected || !submitted) return false;
  return safeEqual(sign(submitted, 'ponder-compare'), sign(expected, 'ponder-compare'));
}

/** The cookie value: an expiry time and a signature of that time. */
export function createSessionValue(expiresAt: number, password = getPassword()): string {
  return `${expiresAt}.${sign(String(expiresAt), password)}`;
}

export function isSessionValueValid(value: string | undefined, now = Date.now() / 1000, password = getPassword()): boolean {
  if (!value || !password) return false;
  const [expires, signature] = value.split('.');
  if (!expires || !signature || !/^\d+$/.test(expires)) return false;
  return Number(expires) > now && safeEqual(sign(expires, password), signature);
}

export async function createPonderSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  (await cookies()).set(COOKIE_NAME, createSessionValue(expiresAt), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
}

export async function clearPonderSession() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function isPonderAuthenticated(): Promise<boolean> {
  return isSessionValueValid((await cookies()).get(COOKIE_NAME)?.value);
}
