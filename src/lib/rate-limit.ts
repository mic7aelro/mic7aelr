/**
 * Small in-memory rate limiter. Each server instance keeps its own count, so the limit is
 * approximate. It protects routes that call a paid API.
 */
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const log = new Map<string, number[]>();

  return function isLimited(address: string): boolean {
    const now = Date.now();
    const recent = (log.get(address) ?? []).filter((time) => now - time < windowMs);
    // A blocked request does not count, so the limit lifts when the window passes.
    const limited = recent.length >= maxRequests;
    if (!limited) recent.push(now);
    log.set(address, recent);
    if (log.size > 500) {
      for (const [key, times] of log) if (times.every((time) => now - time >= windowMs)) log.delete(key);
    }
    return limited;
  };
}

/**
 * Limit how many units, such as rows, one address can spend in a window. A refused request
 * spends nothing, so the budget comes back when old spending leaves the window.
 */
export function createBudget(maxUnits: number, windowMs: number) {
  const log = new Map<string, { time: number; units: number }[]>();

  return function spend(address: string, units: number): boolean {
    const now = Date.now();
    const recent = (log.get(address) ?? []).filter((entry) => now - entry.time < windowMs);
    const used = recent.reduce((sum, entry) => sum + entry.units, 0);
    const allowed = used + units <= maxUnits;
    if (allowed) recent.push({ time: now, units });
    log.set(address, recent);
    if (log.size > 500) {
      for (const [key, entries] of log) if (entries.every((entry) => now - entry.time >= windowMs)) log.delete(key);
    }
    return allowed;
  };
}

export const clientAddress = (request: Request) => request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
