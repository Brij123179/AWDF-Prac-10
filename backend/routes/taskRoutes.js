import express from 'express';
import { taskController } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateTaskInput } from '../middleware/validationMiddleware.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = express.Router();

// All task routes require JWT authentication
router.use(protect);

// GET /api/tasks/explain - MongoDB execution stats & index scan verification
router.get('/explain', taskController.explainQuery);

// GET /api/tasks - In-Memory Cached retrieval with 60-second TTL
router.get('/', cacheMiddleware(60), taskController.getAllTasks);

// POST /api/tasks - Create task (invalidates cache)
router.post('/', validateTaskInput, taskController.createTask);

// POST /api/tasks/seed - Seed sample tasks (invalidates cache)
router.post('/seed', taskController.seedTasks);

// GET /api/tasks/:id - Supplementary Problem 1: Cached single-task retrieval (TTL: 60s)
router.get('/:id', cacheMiddleware(60), taskController.getTaskById);

// PUT /api/tasks/:id - Update task (invalidates cache)
router.put('/:id', validateTaskInput, taskController.updateTask);

// DELETE /api/tasks/:id - Delete task (invalidates cache)
router.delete('/:id', taskController.deleteTask);

export default router;
