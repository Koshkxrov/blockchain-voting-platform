interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class Cache {
  private static instance: Cache;
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  private constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
  }

  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  public set<T>(key: string, data: T, ttl?: number): void {
    const timestamp = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp,
    };
    this.cache.set(key, entry);

    // Set timeout to remove the entry
    setTimeout(() => {
      this.cache.delete(key);
    }, ttl || this.defaultTTL);
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T>;
    if (!entry) return null;

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const cache = Cache.getInstance();
