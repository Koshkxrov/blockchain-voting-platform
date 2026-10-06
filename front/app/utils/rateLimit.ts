interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private limits: Map<string, RateLimitEntry>;
  private windowMs: number;
  private maxRequests: number;

  private constructor() {
    this.limits = new Map();
    this.windowMs = 60 * 1000; // 1 minute
    this.maxRequests = 100; // 100 requests per minute
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  public check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Create new entry
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs,
      };
    }

    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    this.limits.set(identifier, entry);

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  public setWindowMs(windowMs: number): void {
    this.windowMs = windowMs;
  }

  public setMaxRequests(maxRequests: number): void {
    this.maxRequests = maxRequests;
  }
}

export const rateLimiter = RateLimiter.getInstance();
