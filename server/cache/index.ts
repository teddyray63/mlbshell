/**
 * TTL cache — simple in-memory cache with per-entry expiry.
 *
 * Default TTLs (ms):
 *   odds      60s
 *   weather   5min
 *   stats     15min
 *   schedule  30min
 */

export const TTL = {
  odds: 60 * 1000,
  weather: 5 * 60 * 1000,
  stats: 15 * 60 * 1000,
  schedule: 30 * 60 * 1000,
} as const;

interface Entry<T> {
  value: T;
  expiresAt: number;
}

class TTLCache {
  private store = new Map<string, Entry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttl: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttl });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  /** Returns the cached value if fresh, otherwise runs loader, caches, returns. */
  async wrap<T>(key: string, ttl: number, loader: () => Promise<T>): Promise<T> {
    const hit = this.get<T>(key);
    if (hit !== undefined) return hit;
    const value = await loader();
    this.set(key, value, ttl);
    return value;
  }
}

export const cache = new TTLCache();
export default cache;
