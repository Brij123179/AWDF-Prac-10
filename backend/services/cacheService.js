import NodeCache from 'node-cache';
import dotenv from 'dotenv';

dotenv.config();

let defaultTTL = parseInt(process.env.CACHE_TTL_SECONDS, 10) || 60;
const checkPeriod = 120; // purge expired keys every 120 seconds

// Initialize node-cache instance
const cache = new NodeCache({
  stdTTL: defaultTTL,
  checkperiod: checkPeriod,
  useClones: false // performance optimization: avoid cloning objects in memory
});

// Custom statistics tracker
let statsMeta = {
  totalHits: 0,
  totalMisses: 0,
  totalInvalidations: 0,
  lastInvalidationTime: null,
  lastInvalidatedKeyPrefix: null
};

// Event listeners for cache lifecycle observability
cache.on('set', (key) => {
  console.log(`[CacheService] 📥 SET: Key "${key}" stored (TTL: ${defaultTTL}s)`);
});

cache.on('del', (key) => {
  console.log(`[CacheService] 🗑️ DEL: Key "${key}" invalidated`);
});

cache.on('expired', (key) => {
  console.log(`[CacheService] ⌛ EXPIRED: Key "${key}" expired by TTL policy`);
});

cache.on('flush', () => {
  console.log('[CacheService] 🧹 FLUSH: All in-memory cache keys cleared');
});

export const cacheService = {
  /**
   * Get cached data by key
   */
  get: (key) => {
    const data = cache.get(key);
    if (data !== undefined) {
      statsMeta.totalHits += 1;
      return data;
    }
    statsMeta.totalMisses += 1;
    return null;
  },

  /**
   * Set cached data with optional custom TTL
   */
  set: (key, value, ttl = defaultTTL) => {
    return cache.set(key, value, ttl);
  },

  /**
   * Delete a specific cache key
   */
  del: (key) => {
    return cache.del(key);
  },

  /**
   * Check if a key exists
   */
  has: (key) => {
    return cache.has(key);
  },

  /**
   * Get remaining TTL in seconds for a key
   */
  getRemainingTTL: (key) => {
    const expireTimestamp = cache.getTtl(key);
    if (!expireTimestamp) return 0;
    const remainingMs = expireTimestamp - Date.now();
    return remainingMs > 0 ? Math.round(remainingMs / 1000) : 0;
  },

  /**
   * Invalidate all cache keys starting with a prefix
   */
  delPrefix: (prefix) => {
    const allKeys = cache.keys();
    const matchedKeys = allKeys.filter((k) => k.startsWith(prefix));
    if (matchedKeys.length > 0) {
      const deletedCount = cache.del(matchedKeys);
      statsMeta.totalInvalidations += deletedCount;
      statsMeta.lastInvalidationTime = new Date().toISOString();
      statsMeta.lastInvalidatedKeyPrefix = prefix;
      console.log(`[CacheService] ⚡ Invalidated ${deletedCount} cache key(s) matching prefix: "${prefix}"`);
      return deletedCount;
    }
    return 0;
  },

  /**
   * Invalidate all task cache entries for a specific user
   * Call on POST, PUT, DELETE operations to prevent stale reads
   */
  invalidateUserTasks: (userId) => {
    const prefix = `tasks:${userId}`;
    return cacheService.delPrefix(prefix);
  },

  /**
   * Clear entire cache
   */
  flushAll: () => {
    cache.flushAll();
    statsMeta.totalInvalidations += 1;
    statsMeta.lastInvalidationTime = new Date().toISOString();
    statsMeta.lastInvalidatedKeyPrefix = '*';
  },

  /**
   * Return real-time cache metrics and operational statistics
   */
  getStats: () => {
    const internalStats = cache.getStats();
    const allKeys = cache.keys();
    const totalRequests = statsMeta.totalHits + statsMeta.totalMisses;
    const hitRate = totalRequests > 0 ? ((statsMeta.totalHits / totalRequests) * 100).toFixed(1) : '0.0';

    return {
      stdTTL: defaultTTL,
      checkPeriod,
      activeKeysCount: allKeys.length,
      keys: allKeys,
      hits: statsMeta.totalHits,
      misses: statsMeta.totalMisses,
      totalRequests,
      hitRatePercent: parseFloat(hitRate),
      totalInvalidations: statsMeta.totalInvalidations,
      lastInvalidationTime: statsMeta.lastInvalidationTime,
      lastInvalidatedKeyPrefix: statsMeta.lastInvalidatedKeyPrefix,
      nodeCacheInternals: {
        ksize: internalStats.ksize,
        vsize: internalStats.vsize
      }
    };
  },

  /**
   * Reset stats counters
   */
  resetStats: () => {
    statsMeta = {
      totalHits: 0,
      totalMisses: 0,
      totalInvalidations: 0,
      lastInvalidationTime: null,
      lastInvalidatedKeyPrefix: null
    };
  },

  /**
   * Set custom default TTL (Supplementary Problem 3)
   */
  setDefaultTTL: (newTTL) => {
    const parsed = parseInt(newTTL, 10);
    if (!isNaN(parsed) && parsed > 0) {
      defaultTTL = parsed;
    }
    return defaultTTL;
  },

  /**
   * Get current default TTL
   */
  getDefaultTTL: () => defaultTTL
};

export default cacheService;
