import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBudget, createRateLimiter } from './rate-limit';

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

describe('createBudget', () => {
  it('lets an address spend up to the budget, then refuses, then recovers', () => {
    vi.useFakeTimers();
    const spend = createBudget(100, 60_000);
    expect(spend('a', 60)).toBe(true);
    expect(spend('a', 40)).toBe(true);
    expect(spend('a', 1)).toBe(false);
    // A refused request spends nothing.
    vi.advanceTimersByTime(61_000);
    expect(spend('a', 100)).toBe(true);
  });

  it('refuses one big request that is over the budget and counts each address on its own', () => {
    const spend = createBudget(100, 60_000);
    expect(spend('a', 101)).toBe(false);
    expect(spend('a', 100)).toBe(true);
    expect(spend('b', 100)).toBe(true);
  });
});
