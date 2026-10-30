import { cacheService } from '../services/cacheService.js';

/**
 * Express middleware for declarative in-memory caching of GET requests
 * Supports bypass queries, remaining TTL headers, and sub-millisecond telemetry
 */
export const cacheMiddleware = (customTTL) => {
  return (req, res, next) => {
    // Only cache safe GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const startTime = process.hrtime.bigint();

    // Check if client requested cache bypass
    const isBypass =
      req.query.nocache === 'true' ||
      req.headers['cache-control'] === 'no-cache' ||
      req.headers['x-bypass-cache'] === 'true';

    // Unique user-scoped cache key including route and normalized query parameters
    const userId = req.user ? req.user._id.toString() : 'public';
    const cacheKey = `tasks:${userId}:${req.originalUrl}`;

    if (!isBypass) {
      const cachedResponse = cacheService.get(cacheKey);

      if (cachedResponse !== null) {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000;
        const remainingTTL = cacheService.getRemainingTTL(cacheKey);

        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        res.setHeader('X-Cache-TTL', `${remainingTTL}s`);
        res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);

        // Return cached payload with fresh execution telemetry
        return res.status(200).json({
          ...cachedResponse,
          cached: true,
          cacheStatus: 'HIT',
          cacheKey,
          remainingTTL,
          executionTimeMs: parseFloat(durationMs.toFixed(2))
        });
      }
    }

    // Cache MISS or BYPASS: Intercept res.json to store fresh database response
    res.setHeader('X-Cache', isBypass ? 'BYPASS' : 'MISS');
    res.setHeader('X-Cache-Key', cacheKey);

    const originalJson = res.json.bind(res);

    res.json = (body) => {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;

      res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);

      // Only cache successful 200 OK responses and when not bypassing
      if (res.statusCode === 200 && !isBypass && body && body.success !== false) {
        cacheService.set(cacheKey, body, customTTL);
      }

      // Attach telemetry to response body for client-side inspector
      if (body && typeof body === 'object' && !Array.isArray(body)) {
        body.cached = false;
        body.cacheStatus = isBypass ? 'BYPASS' : 'MISS';
        body.cacheKey = cacheKey;
        body.executionTimeMs = parseFloat(durationMs.toFixed(2));
      }

      return originalJson(body);
    };

    next();
  };
};

export default cacheMiddleware;
