import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRateLimiter } from './rate-limit';

afterEach(() => vi.useRealTimers());

describe('createRateLimiter', () => {
  it('allows the limit, then blocks, then lets requests through after the window', () => {
    vi.useFakeTimers();
    const isLimited = createRateLimiter(3, 60_000);
    expect([1, 2, 3].map(() => isLimited('a'))).toEqual([false, false, false]);
    expect(isLimited('a')).toBe(true);
    // Blocked requests do not extend the lock.
    vi.advanceTimersByTime(30_000);
    expect(isLimited('a')).toBe(true);
    vi.advanceTimersByTime(31_000);
    expect(isLimited('a')).toBe(false);
  });

  it('counts each address on its own', () => {
    const isLimited = createRateLimiter(1, 60_000);
    expect(isLimited('a')).toBe(false);
    expect(isLimited('b')).toBe(false);
    expect(isLimited('a')).toBe(true);
  });
});
