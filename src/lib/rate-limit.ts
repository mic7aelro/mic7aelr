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

export const clientAddress = (request: Request) => request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
