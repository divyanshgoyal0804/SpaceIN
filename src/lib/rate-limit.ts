/**
 * Simple in-memory rate limiter for API routes.
 * Uses a Map<IP, { count, resetTime }> pattern.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimiterOptions {
  /** Maximum number of requests allowed within the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

const limiters = new Map<string, Map<string, RateLimitEntry>>();

/**
 * Creates a named rate limiter instance. Calling with the same name reuses the same store.
 */
export function createRateLimiter(name: string, options: RateLimiterOptions) {
  if (!limiters.has(name)) {
    limiters.set(name, new Map());
  }

  const store = limiters.get(name)!;

  return {
    /**
     * Check if a given identifier (usually IP) is rate-limited.
     * Returns { success: true } if allowed, or { success: false, retryAfterMs } if limited.
     */
    check(identifier: string): { success: boolean; retryAfterMs?: number } {
      const now = Date.now();
      const entry = store.get(identifier);

      // Clean up expired entries periodically (every 100th call)
      if (Math.random() < 0.01) {
        for (const [key, val] of store) {
          if (now > val.resetTime) store.delete(key);
        }
      }

      if (!entry || now > entry.resetTime) {
        store.set(identifier, { count: 1, resetTime: now + options.windowMs });
        return { success: true };
      }

      if (entry.count >= options.maxRequests) {
        return { success: false, retryAfterMs: entry.resetTime - now };
      }

      entry.count++;
      return { success: true };
    },
  };
}

/**
 * Extract client IP from request headers.
 * Falls back to 'unknown' if no IP can be determined.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}
