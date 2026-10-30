/**
 * In-Memory Fallback Storage
 * Automatically engages when MongoDB connection is unavailable (e.g. local environment without Docker/Mongo daemon),
 * ensuring zero-friction development, automated testing, and screenshot generation.
 */

class InMemoryStore {
  constructor() {
    this.users = [
      {
        _id: '67224cf920a7b51e0c294100',
        name: 'Alex Johnson',
        email: 'alex.practical10@example.com',
        password: '$2a$10$wN9cE4uYkU2dEwqd7H5OWeKq7zI3M1B1V4Wv5hYq2pB3p6s1qXy1q' // hash for 'password123'
      }
    ];

    this.tasks = [
      {
        _id: '67224cf920a7b51e0c294101',
        user: '67224cf920a7b51e0c294100',
        title: 'Configure Node.js EventEmitter Subsystem',
        description: 'Decouple long-running notifications from API critical response path.',
        priority: 'high',
        completed: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        _id: '67224cf920a7b51e0c294102',
        user: '67224cf920a7b51e0c294100',
        title: 'Implement Multi-Stage Dockerfile for React',
        description: 'Reduce final production image footprint using Alpine Linux and Nginx.',
        priority: 'medium',
        completed: true,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        _id: '67224cf920a7b51e0c294103',
        user: '67224cf920a7b51e0c294100',
        title: 'Verify Timestamp Evidence for Non-Blocking Handlers',
        description: 'Compare T_response with T_completed gap (+2000ms).',
        priority: 'high',
        completed: false,
        createdAt: new Date(Date.now() - 10800000).toISOString()
      },
      {
        _id: '67224cf920a7b51e0c294104',
        user: '67224cf920a7b51e0c294100',
        title: 'Mount Persistent Named Volume for MongoDB',
        description: 'Ensure mongo-data persists across container restarts.',
        priority: 'low',
        completed: true,
        createdAt: new Date(Date.now() - 14400000).toISOString()
      }
    ];
  }

  // User Operations
  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find(u => String(u._id) === String(id));
  }

  createUser(userData) {
    const newUser = {
      _id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...userData
    };
    this.users.push(newUser);
    return newUser;
  }

  // Task Operations
  getTasks(userId, filter = {}) {
    let result = this.tasks.filter(t => String(t.user) === String(userId));
    if (filter.priority) {
      result = result.filter(t => t.priority === filter.priority);
    }
    if (filter.completed !== undefined) {
      result = result.filter(t => t.completed === filter.completed);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    return result;
  }

  createTask(taskData) {
    const newTask = {
      _id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...taskData
    };
    this.tasks.unshift(newTask);
    return newTask;
  }

  updateTask(taskId, userId, updates) {
    const task = this.tasks.find(t => String(t._id) === String(taskId) && String(t.user) === String(userId));
    if (task) {
      Object.assign(task, updates);
    }
    return task;
  }

  deleteTask(taskId, userId) {
    const idx = this.tasks.findIndex(t => String(t._id) === String(taskId) && String(t.user) === String(userId));
    if (idx !== -1) {
      const deleted = this.tasks.splice(idx, 1)[0];
      return deleted;
    }
    return null;
  }

  seedTasks(userId) {
    this.tasks = this.tasks.filter(t => String(t.user) !== String(userId));
    const starters = [
      {
        _id: `task_${Date.now()}_1`,
        user: userId,
        title: 'Configure Node.js EventEmitter Subsystem',
        description: 'Decouple long-running notifications from API critical response path.',
        priority: 'high',
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        _id: `task_${Date.now()}_2`,
        user: userId,
        title: 'Implement Multi-Stage Dockerfile for React',
        description: 'Reduce final production image footprint using Alpine Linux and Nginx.',
        priority: 'medium',
        completed: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: `task_${Date.now()}_3`,
        user: userId,
        title: 'Verify Timestamp Evidence for Non-Blocking Handlers',
        description: 'Compare T_response with T_completed gap (+2000ms).',
        priority: 'high',
        completed: false,
        createdAt: new Date().toISOString()
      }
    ];
    this.tasks.push(...starters);
    return starters;
  }
}

export const inMemoryStore = new InMemoryStore();
