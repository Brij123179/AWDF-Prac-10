import mongoose from 'mongoose';
import Task from '../models/taskModel.js';
import { cacheService } from '../services/cacheService.js';
import taskEvents from '../events/events.js';
import { inMemoryStore } from '../models/inMemoryStore.js';

export const taskController = {
  /**
   * GET /api/tasks
   * Retrieves all tasks belonging to the authenticated user.
   * Leverages Mongoose .lean() and projection for database query optimization.
   */
  getAllTasks: async (req, res, next) => {
    try {
      const { search, priority, completed, sortBy = 'createdAt', order = 'desc' } = req.query;

      if (mongoose.connection.readyState !== 1) {
        const tasks = inMemoryStore.getTasks(req.user._id, {
          search,
          priority: priority ? priority.toLowerCase() : undefined,
          completed: completed !== undefined && completed !== '' ? (completed === 'true' || completed === true) : undefined
        });
        const totalTasks = tasks.length;
        const completedCount = tasks.filter(t => t.completed).length;
        return res.status(200).json({
          success: true,
          count: tasks.length,
          stats: {
            total: totalTasks,
            completed: completedCount,
            pending: totalTasks - completedCount
          },
          data: tasks
        });
      }

      const query = { user: req.user._id };

      if (search && search.trim() !== '') {
        query.$or = [
          { title: { $regex: search.trim(), $options: 'i' } },
          { description: { $regex: search.trim(), $options: 'i' } }
        ];
      }

      if (priority && ['low', 'medium', 'high'].includes(priority.toLowerCase())) {
        query.priority = priority.toLowerCase();
      }

      if (completed !== undefined && completed !== '') {
        query.completed = completed === 'true' || completed === true;
      }

      const sortOptions = {};
      sortOptions[sortBy] = order === 'asc' ? 1 : -1;

      /* Query Optimization in action:
       * 1. .select() limits payload to needed fields (projection optimization)
       * 2. .lean() skips Mongoose model hydration, returning high-performance POJOs
       * 3. .sort() uses compound index { user: 1, createdAt: -1 }
       */
      const tasks = await Task.find(query)
        .select('title description completed priority createdAt user')
        .sort(sortOptions)
        .lean();

      const totalTasks = await Task.countDocuments({ user: req.user._id });
      const completedCount = await Task.countDocuments({ user: req.user._id, completed: true });
      const pendingCount = totalTasks - completedCount;

      res.status(200).json({
        success: true,
        count: tasks.length,
        stats: {
          total: totalTasks,
          completed: completedCount,
          pending: pendingCount
        },
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/tasks/:id
   * Retrieve a single task by ID
   */
  getTaskById: async (req, res, next) => {
    try {
      const task = await Task.findOne({ _id: req.params.id, user: req.user._id })
        .select('title description completed priority createdAt user')
        .lean();

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task Not Found',
          message: `No task found with ID: ${req.params.id}`
        });
      }

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/tasks
   * Creates a new task.
   * Responds immediately to the client (HTTP 201) and emits asynchronous background event ('task-created').
   */
  createTask: async (req, res, next) => {
    try {
      const { title, description, completed, priority } = req.body;

      let task;
      if (mongoose.connection.readyState !== 1) {
        task = inMemoryStore.createTask({
          user: req.user._id,
          title,
          description: description || '',
          completed: completed || false,
          priority: priority ? priority.toLowerCase() : 'medium'
        });
      } else {
        task = await Task.create({
          user: req.user._id,
          title,
          description: description || '',
          completed: completed || false,
          priority: priority ? priority.toLowerCase() : 'medium'
        });
      }

      // Cache Invalidation Strategy: Evict user's task queries immediately
      const invalidatedCount = cacheService.invalidateUserTasks(req.user._id);

      // Record exact API response timestamp (Lab session Step 3)
      const apiResponseTimestamp = new Date().toISOString();
      console.log(`[API] Response sent at ${apiResponseTimestamp}`);

      // Respond immediately before background listener finishes
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        cacheInvalidated: true,
        invalidatedEntries: invalidatedCount,
        apiResponseTimestamp,
        data: task
      });

      // Emit background event asynchronously (non-blocking)
      taskEvents.emit('task-created', {
        task,
        user: req.user,
        apiResponseTimestamp
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/tasks/:id
   * Updates an existing task.
   * INVALIDATES in-memory cache for the current user.
   */
  updateTask: async (req, res, next) => {
    try {
      const { title, description, completed, priority } = req.body;

      const updatePayload = {};
      if (title !== undefined) updatePayload.title = title;
      if (description !== undefined) updatePayload.description = description;
      if (completed !== undefined) updatePayload.completed = completed;
      if (priority !== undefined) updatePayload.priority = priority.toLowerCase();

      const task = await Task.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        updatePayload,
        { new: true, runValidators: true }
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task Not Found',
          message: `No task found with ID: ${req.params.id}`
        });
      }

      // Invalidate in-memory cache
      const invalidatedCount = cacheService.invalidateUserTasks(req.user._id);

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        cacheInvalidated: true,
        invalidatedEntries: invalidatedCount,
        data: task
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/tasks/:id
   * Deletes a task.
   * Responds immediately (HTTP 200) and emits asynchronous background event ('task-deleted').
   */
  deleteTask: async (req, res, next) => {
    try {
      let task;
      if (mongoose.connection.readyState !== 1) {
        task = inMemoryStore.deleteTask(req.params.id, req.user._id);
      } else {
        task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
      }

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task Not Found',
          message: `No task found with ID: ${req.params.id}`
        });
      }

      // Invalidate in-memory cache
      const invalidatedCount = cacheService.invalidateUserTasks(req.user._id);

      // Record exact API response timestamp
      const apiResponseTimestamp = new Date().toISOString();
      console.log(`[API] Delete response sent at ${apiResponseTimestamp}`);

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        cacheInvalidated: true,
        invalidatedEntries: invalidatedCount,
        apiResponseTimestamp,
        data: { id: req.params.id, title: task.title }
      });

      // Emit background event asynchronously (Supplementary Problem 1)
      taskEvents.emit('task-deleted', {
        task,
        user: req.user,
        apiResponseTimestamp
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/tasks/seed
   * Populates the database with starter tasks and invalidates existing cache.
   */
  seedTasks: async (req, res, next) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        const seeded = inMemoryStore.seedTasks(req.user._id);
        cacheService.invalidateUserTasks(req.user._id);
        return res.status(201).json({
          success: true,
          message: 'Seeded in-memory starter tasks',
          count: seeded.length,
          data: seeded
        });
      }

      await Task.deleteMany({ user: req.user._id });

      const starterTasks = [
        {
          user: req.user._id,
          title: 'Implement React.lazy for Route Chunks',
          description: 'Split Home, Projects, and Contact pages into dynamic modules.',
          priority: 'high',
          completed: true
        },
        {
          user: req.user._id,
          title: 'Design Skeleton Fallback in Suspense',
          description: 'Provide an engaging shimmer placeholder during dynamic imports.',
          priority: 'high',
          completed: true
        },
        {
          user: req.user._id,
          title: 'Implement node-cache In-Memory Service',
          description: 'Initialize NodeCache with 60s TTL and checkperiod 120s to optimize GET /tasks.',
          priority: 'high',
          completed: true
        },
        {
          user: req.user._id,
          title: 'Configure Compound Indexes on Task Schema',
          description: 'Add { user: 1, createdAt: -1 } and { user: 1, completed: 1 } compound indexes.',
          priority: 'high',
          completed: true
        },
        {
          user: req.user._id,
          title: 'Apply Mongoose .lean() Query Optimization',
          description: 'Bypass Mongoose document hydration to reduce AST memory overhead.',
          priority: 'medium',
          completed: true
        },
        {
          user: req.user._id,
          title: 'Verify Cache Invalidation on Writes',
          description: 'Ensure POST, PUT, and DELETE operations immediately evict user cache keys.',
          priority: 'high',
          completed: false
        },
        {
          user: req.user._id,
          title: 'Profile Bundle Sizes in Chrome DevTools',
          description: 'Measure transferred KB before vs after code splitting.',
          priority: 'medium',
          completed: false
        },
        {
          user: req.user._id,
          title: 'Record Uncached vs Cached API Latencies',
          description: 'Collect empirical readings comparing database reads vs RAM cache hits.',
          priority: 'high',
          completed: false
        },
        {
          user: req.user._id,
          title: 'Analyze MongoDB Query Execution Plan',
          description: 'Execute .explain("executionStats") to prove index scan (IXSCAN) efficiency.',
          priority: 'medium',
          completed: false
        },
        {
          user: req.user._id,
          title: 'Review IBM Coursera Week 9 Module 5',
          description: 'Study backend performance optimization, scaling, and load balancing.',
          priority: 'low',
          completed: true
        }
      ];

      const inserted = await Task.insertMany(starterTasks);

      // Invalidate existing cache
      cacheService.invalidateUserTasks(req.user._id);

      res.status(201).json({
        success: true,
        message: `Seeded ${inserted.length} starter tasks`,
        count: inserted.length,
        cacheInvalidated: true,
        data: inserted
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/tasks/explain
   * Runs MongoDB .explain('executionStats') to demonstrate query optimization,
   * showing IXSCAN vs COLLSCAN and performance statistics.
   */
  explainQuery: async (req, res, next) => {
    try {
      const explanation = await Task.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .explain('executionStats');

      const stats = explanation.executionStats || {};
      const winningPlan = explanation.queryPlanner?.winningPlan || {};

      // Determine index name and scan stage
      const inputStage = winningPlan.inputStage || winningPlan;
      const stage = winningPlan.stage || 'UNKNOWN';
      const indexName = inputStage.indexName || 'NONE (Collection Scan)';

      res.status(200).json({
        success: true,
        message: 'MongoDB Query Execution Plan analyzed successfully',
        summary: {
          executionTimeMillis: stats.executionTimeMillis,
          totalDocsExamined: stats.totalDocsExamined,
          totalKeysExamined: stats.totalKeysExamined,
          nReturned: stats.nReturned,
          scanStage: stage,
          indexUsed: indexName,
          isIndexScan: stage === 'IXSCAN' || inputStage.stage === 'IXSCAN',
          efficiencyRatio: stats.totalDocsExamined > 0 ? (stats.nReturned / stats.totalDocsExamined).toFixed(2) : '1.00'
        },
        fullExplanation: explanation
      });
    } catch (error) {
      next(error);
    }
  }
};

export default taskController;
