/**
 * TTL cache — simple in-memory cache with per-entry expiry and hit/miss logging.
 *
 * Default TTLs (ms):
 *   odds           60s
 *   weather        10min
 *   stats          15min
 *   hitting        30min
 *   pitcherSplits  30min
 *   statcast       60min
 *   standings      60min
 *   schedule       30min
 *   lineups        15min
 */

export const TTL = {
  odds: 60 * 1000,
  weather: 10 * 60 * 1000,
  stats: 15 * 60 * 1000,
  hitting: 30 * 60 * 1000,
  pitcherSplits: 30 * 60 * 1000,
  statcast: 60 * 60 * 1000,
  standings: 60 * 60 * 1000,
  schedule: 30 * 60 * 1000,
  lineups: 15 * 60 * 1000,
} as const;

interface Entry<T> {
  value: T;
  expiresAt: number;
}

class TTLCache {
  private store = new Map<string, Entry<unknown>>();
  private hits = 0;
  private misses = 0;

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

  stats(): { hits: number; misses: number; size: number } {
    return { hits: this.hits, misses: this.misses, size: this.store.size };
  }

  /** Returns the cached value if fresh, otherwise runs loader, caches, returns. */
  async wrap<T>(key: string, ttl: number, loader: () => Promise<T>): Promise<T> {
    const hit = this.get<T>(key);
    if (hit !== undefined) {
      this.hits += 1;
      // eslint-disable-next-line no-console
      console.log(`[cache] HIT  ${key} (hits=${this.hits} misses=${this.misses})`);
      return hit;
    }
    this.misses += 1;
    // eslint-disable-next-line no-console
    console.log(`[cache] MISS ${key} (hits=${this.hits} misses=${this.misses})`);
    const value = await loader();
    this.set(key, value, ttl);
    return value;
  }
}

export const cache = new TTLCache();
export default cache;
