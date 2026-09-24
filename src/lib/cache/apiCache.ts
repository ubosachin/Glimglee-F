// High-performance In-Memory TTL Cache for Serverless & Edge API Routes

interface CacheItem<T> {
  data: T;
  expiry: number;
}

const cacheStore = new Map<string, CacheItem<any>>();

/**
 * Get or compute cached data
 */
export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const cached = cacheStore.get(key);

  if (cached && cached.expiry > now) {
    return cached.data as T;
  }

  const fresh = await fetcher();
  cacheStore.set(key, {
    data: fresh,
    expiry: now + ttlSeconds * 1000,
  });

  return fresh;
}

/**
 * Invalidate a specific cache key or prefix
 */
export function invalidateCacheKey(prefixOrKey: string) {
  for (const key of cacheStore.keys()) {
    if (key === prefixOrKey || key.startsWith(`${prefixOrKey}:`)) {
      cacheStore.delete(key);
    }
  }
}

/**
 * Clear all in-memory cache
 */
export function clearAllCache() {
  cacheStore.clear();
}
