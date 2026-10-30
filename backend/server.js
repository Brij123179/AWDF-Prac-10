import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { requestLogger } from './middleware/logger.js';
import { validateContentType } from './middleware/validateContentType.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import cacheRoutes from './routes/cacheRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import { registerEventListeners } from './events/listeners.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Event Listeners (Lab session Step 2)
registerEventListeners();

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(validateContentType);
app.use(requestLogger);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'Practical 10 Asynchronous Processing with Event-Driven Architecture (Node.js EventEmitter)',
    database: 'MongoDB (taskdb_p10)',
    architecture: 'Event-Driven Asynchronous Non-Blocking Processing',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/cache', cacheRoutes);
app.use('/api/events', eventRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(globalErrorHandler);

const server = app.listen(PORT, () => {
  console.log(`
🚀 Practical 10 Server running on http://localhost:${PORT}
🍃 Connected to MongoDB 'taskdb_p10' via Mongoose ODM
⚡ Architecture: Asynchronous Processing via native Node.js EventEmitter
📡 Event Listeners: [task-created, task-deleted, error]
🔐 Auth REST:    http://localhost:${PORT}/api/auth
📋 Tasks REST:   http://localhost:${PORT}/api/tasks (Emits task-created & task-deleted)
📨 Events REST:  http://localhost:${PORT}/api/events/logs
📊 Cache REST:   http://localhost:${PORT}/api/cache/stats
  `);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
    const fallbackPort = Number(PORT) + 1;
    console.warn(`⚠️ Port ${PORT} is busy or restricted by OS (${err.code}). Falling back to port ${fallbackPort}...`);
    app.listen(fallbackPort, () => {
      console.log(`🚀 Practical 10 Server running on http://localhost:${fallbackPort}`);
    });
  } else {
    console.error('Server error:', err);
  }
});

export default app;
