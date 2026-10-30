import { cacheService } from '../services/cacheService.js';

export const cacheController = {
  /**
   * GET /api/cache/stats
   * Returns live operational metrics for node-cache
   */
  getStats: (req, res) => {
    const stats = cacheService.getStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  },

  /**
   * DELETE /api/cache/user
   * Clear cache for the authenticated user only
   */
  clearUserCache: (req, res) => {
    const count = cacheService.invalidateUserTasks(req.user._id);
    res.status(200).json({
      success: true,
      message: `Invalidated ${count} cache key(s) for user ${req.user.name || req.user._id}`,
      invalidatedCount: count
    });
  },

  /**
   * DELETE /api/cache/flush
   * Flushes all keys in the memory cache
   */
  flushAll: (req, res) => {
    cacheService.flushAll();
    res.status(200).json({
      success: true,
      message: 'All in-memory cache entries have been flushed successfully'
    });
  },

  /**
   * POST /api/cache/reset-stats
   * Reset hit/miss telemetry counters
   */
  resetStats: (req, res) => {
    cacheService.resetStats();
    res.status(200).json({
      success: true,
      message: 'Cache telemetry counters have been reset to zero'
    });
  },

  /**
   * GET /api/cache/debug
   * Supplementary Problem 2: Expose cache-hit / cache-miss counter via dedicated debug endpoint
   */
  getDebug: (req, res) => {
    const stats = cacheService.getStats();
    res.status(200).json({
      debug: true,
      endpoint: '/api/cache/debug',
      cacheMetrics: {
        cacheHits: stats.hits,
        cacheMisses: stats.misses,
        totalRequests: stats.totalRequests,
        hitRatePercentage: `${stats.hitRatePercent}%`,
        activeKeys: stats.activeKeysCount,
        allKeysList: stats.keys
      },
      configuration: {
        currentTTLSeconds: stats.stdTTL,
        checkPeriodSeconds: stats.checkPeriod
      },
      invalidations: {
        totalInvalidations: stats.totalInvalidations,
        lastInvalidationTime: stats.lastInvalidationTime,
        lastInvalidatedKeyPrefix: stats.lastInvalidatedKeyPrefix
      },
      v8MemoryUsage: stats.nodeCacheInternals,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * POST /api/cache/ttl
   * Supplementary Problem 3: Dynamically adjust TTL for experimentation
   */
  updateTTL: (req, res) => {
    const { ttl } = req.body;
    const newTTL = cacheService.setDefaultTTL(ttl);
    res.status(200).json({
      success: true,
      message: `Default cache TTL updated to ${newTTL} seconds`,
      currentTTL: newTTL
    });
  }
};

export default cacheController;
