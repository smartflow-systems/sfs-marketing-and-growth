import { Request, Response, NextFunction } from 'express';

/**
 * Simple in-memory cache middleware
 * For production, use Redis or Memcached
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  etag: string;
}

class MemoryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 1000, ttl = 300000) {
    // 5 minutes default TTL
    this.maxSize = maxSize;
    this.ttl = ttl;

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  set(key: string, data: any, customTTL?: number): void {
    // Evict oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const etag = this.generateETag(data);

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      etag,
    });
  }

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private generateETag(data: any): string {
    // Simple ETag generation - in production use a proper hashing library
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `"${Math.abs(hash).toString(36)}"`;
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
    };
  }
}

// Singleton cache instance
export const memoryCache = new MemoryCache(1000, 300000); // 5 minutes TTL

/**
 * Cache middleware factory
 */
export function cacheMiddleware(options: {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
} = {}) {
  const { ttl, keyGenerator, condition } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check custom condition
    if (condition && !condition(req)) {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : `${req.method}:${req.originalUrl}`;

    // Check cache
    const cachedEntry = memoryCache.get(cacheKey);

    if (cachedEntry) {
      // Check ETag
      const clientETag = req.headers['if-none-match'];

      if (clientETag === cachedEntry.etag) {
        // Return 304 Not Modified
        return res.status(304).end();
      }

      // Return cached response
      res.set({
        'X-Cache': 'HIT',
        'Cache-Control': `public, max-age=${Math.floor((ttl || 300000) / 1000)}`,
        ETag: cachedEntry.etag,
      });

      return res.json(cachedEntry.data);
    }

    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json to cache response
    res.json = function (data: any) {
      memoryCache.set(cacheKey, data, ttl);

      const entry = memoryCache.get(cacheKey);
      if (entry) {
        res.set({
          'X-Cache': 'MISS',
          'Cache-Control': `public, max-age=${Math.floor((ttl || 300000) / 1000)}`,
          ETag: entry.etag,
        });
      }

      return originalJson(data);
    };

    next();
  };
}

/**
 * Cache invalidation middleware
 */
export function invalidateCache(pattern?: string | RegExp) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (pattern) {
      // Invalidate specific pattern (implement as needed)
      // For now, clear all cache on mutations
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        memoryCache.clear();
      }
    }
    next();
  };
}

/**
 * Cache stats endpoint
 */
export function getCacheStats() {
  return memoryCache.getStats();
}
