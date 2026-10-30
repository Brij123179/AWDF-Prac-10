import express from 'express';
import { cacheController } from '../controllers/cacheController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/cache/stats - Retrieve real-time cache telemetry
router.get('/stats', cacheController.getStats);

// GET /api/cache/debug - Supplementary Problem 2: Debug endpoint with hit/miss counters
router.get('/debug', cacheController.getDebug);

// POST /api/cache/ttl - Supplementary Problem 3: Update TTL dynamically
router.post('/ttl', cacheController.updateTTL);

// DELETE /api/cache/flush - Clear entire in-memory cache
router.delete('/flush', cacheController.flushAll);

// POST /api/cache/reset-stats - Reset hit/miss counters
router.post('/reset-stats', cacheController.resetStats);

// DELETE /api/cache/user - Clear user specific cache entries
router.delete('/user', protect, cacheController.clearUserCache);

export default router;
