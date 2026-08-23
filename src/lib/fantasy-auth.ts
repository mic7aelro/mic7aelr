import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const SITE_COOKIE_NAME = 'ff_session';
const UNLOCK_COOKIE_NAME = 'ff_unlocked';
const SITE_SESSION_SECONDS = 60 * 60 * 24 * 30;
const UNLOCK_SESSION_SECONDS = 60 * 60 * 12;
const MAX_UNLOCKED_BOARDS = 30;

function getSecret() {
  return process.env.FANTASY_SESSION_SECRET || '';
}

function sign(value: string) {
  return createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

/** True when the server has the password and signing secret needed to gate the page. */
export function fantasyAuthIsConfigured() {
  return Boolean(process.env.FANTASY_FOOTBALL_PASSWORD && getSecret());
}

/** Check a submitted password against the shared site password. */
export function verifySitePassword(password: string) {
  const expected = process.env.FANTASY_FOOTBALL_PASSWORD || '';
  if (!expected || !password) return false;
  return safeEqual(password, expected);
}

function signedValue(payload: object) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

function readSignedValue<T>(value: string | undefined): T | null {
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature || !safeEqual(sign(payload), signature)) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()) as T;
  } catch {
    return null;
  }
}

export async function createSiteSession() {
  const expires = Math.floor(Date.now() / 1000) + SITE_SESSION_SECONDS;
  const store = await cookies();
  store.set(SITE_COOKIE_NAME, signedValue({ role: 'guest', expires }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SITE_SESSION_SECONDS,
  });
}

export async function clearSiteSession() {
  const store = await cookies();
  store.delete(SITE_COOKIE_NAME);
}

/** True when the visitor has entered the shared site password this session. */
export async function isSiteAuthenticated() {
  if (!fantasyAuthIsConfigured()) return false;
  const value = (await cookies()).get(SITE_COOKIE_NAME)?.value;
  const session = readSignedValue<{ role: string; expires: number }>(value);
  return Boolean(session && session.role === 'guest' && session.expires > Math.floor(Date.now() / 1000));
}

/** Hash a board PIN for storage. Never store a PIN in plain text. */
export function hashBoardPin(pin: string) {
  return createHmac('sha256', getSecret()).update(`pin:${pin}`).digest('base64url');
}

export function pinMatchesHash(pin: string, pinHash: string) {
  return safeEqual(hashBoardPin(pin), pinHash);
}

async function getUnlockedBoardIds(): Promise<string[]> {
  const value = (await cookies()).get(UNLOCK_COOKIE_NAME)?.value;
  const session = readSignedValue<{ boardIds: string[]; expires: number }>(value);
  if (!session || session.expires <= Math.floor(Date.now() / 1000)) return [];
  return session.boardIds;
}

export async function isBoardUnlocked(boardId: string) {
  return (await getUnlockedBoardIds()).includes(boardId);
}

/** Remember that this session entered the correct PIN for a board, so it can drag and edit it. */
export async function markBoardUnlocked(boardId: string) {
  const current = await getUnlockedBoardIds();
  const boardIds = [boardId, ...current.filter((id) => id !== boardId)].slice(0, MAX_UNLOCKED_BOARDS);
  const expires = Math.floor(Date.now() / 1000) + UNLOCK_SESSION_SECONDS;
  const store = await cookies();
  store.set(UNLOCK_COOKIE_NAME, signedValue({ boardIds, expires }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: UNLOCK_SESSION_SECONDS,
  });
}
