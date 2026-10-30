import React, { useState, useEffect } from 'react';
import TaskStats from '../components/TaskStats';
import TaskFilters from '../components/TaskFilters';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import TaskEditModal from '../components/TaskEditModal';
import TaskDeleteConfirmModal from '../components/TaskDeleteConfirmModal';
import CacheMetricsCard from '../components/CacheMetricsCard';
import CacheBenchmarkModal from '../components/CacheBenchmarkModal';
import ExplainQueryModal from '../components/ExplainQueryModal';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, ShieldAlert, Sparkles, RefreshCw, Layers, Zap } from 'lucide-react';

const HomePage = ({ addToast, onOpenAuthModal }) => {
  const { isAuthenticated, authFetch } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    completed: '',
    sortBy: 'createdAt'
  });

  // Modal states
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isExplainOpen, setIsExplainOpen] = useState(false);

  const fetchTasks = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.completed !== '') queryParams.append('completed', filters.completed);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);

      const res = await authFetch(`/api/tasks?${queryParams.toString()}`);
      const data = await res.json();

      if (data.success) {
        setTasks(data.data || []);
        if (data.stats) setStats(data.stats);

        // Feedback on cache status
        if (res.eventData) {
          if (res.eventData.cacheHeader === 'HIT') {
            addToast(`⚡ Cache HIT: ${data.count} tasks retrieved from node-cache in ${res.eventData.duration}ms`, 'success');
          } else if (res.eventData.cacheHeader === 'MISS') {
            addToast(`🍃 Cache MISS: MongoDB queried in ${res.eventData.duration}ms and saved to cache`, 'info');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddTask = async (taskData) => {
    setIsSubmitting(true);
    try {
      const res = await authFetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
      });
      const data = await res.json();
      if (data.success) {
        addToast('Task created & cache invalidated on server!', 'success');
        fetchTasks();
      } else {
        addToast(data.error || 'Failed to create task', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (taskId, nextCompletedState) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, completed: nextCompletedState } : t))
      );

      const res = await authFetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: nextCompletedState })
      });
      const data = await res.json();

      if (data.success) {
        addToast(
          nextCompletedState ? 'Task completed (Cache invalidated)' : 'Task marked pending (Cache invalidated)',
          'info'
        );
        fetchTasks();
      }
    } catch (err) {
      fetchTasks(); // Revert on error
      addToast(err.message, 'error');
    }
  };

  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      const res = await authFetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();
      if (data.success) {
        addToast('Task updated & cache invalidated!', 'success');
        fetchTasks();
      } else {
        addToast(data.error || 'Update failed', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await authFetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        addToast('Task deleted & cache invalidated!', 'info');
        setDeletingTask(null);
        fetchTasks();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSeedTasks = async () => {
    try {
      const res = await authFetch('/api/tasks/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast(`Seeded ${data.count} starter tasks. Cache refreshed!`, 'success');
        fetchTasks();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div>
      {/* Page Hero Header */}
      <section className="page-hero">
        <div className="hero-text">
          <h2>Task Dashboard & Optimization Lab</h2>
          <p>
            Combined Performance Hub: Client route lazy loading (<code>page-home.js</code>) + Server-side In-Memory Caching (<code>node-cache</code>) with automatic write invalidation.
          </p>
        </div>
        <div className="hero-badges">
          <span className="badge badge-indigo">
            <Layers size={13} />
            Route: / (Home Chunk)
          </span>
          <span className="badge badge-emerald">
            <Zap size={13} />
            node-cache (TTL: 60s)
          </span>
        </div>
      </section>

      {!isAuthenticated ? (
        <div style={{
          background: 'var(--bg-card)',
          border: 'var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '3.5rem 2rem',
          textAlign: 'center',
          backdropFilter: 'blur(12px)'
        }}>
          <ShieldAlert size={52} color="#a5b4fc" style={{ marginBottom: '1.2rem', opacity: 0.9 }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.6rem' }}>
            Authentication Required for Tasks
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '520px', margin: '0 auto 1.8rem auto' }}>
            To view, create, and manage your private tasks, sign in or register an account. Test in-memory cache hits, write invalidation, and query optimizations live!
          </p>
          <button className="btn btn-primary" onClick={onOpenAuthModal}>
            Sign In / Register Now
          </button>
        </div>
      ) : (
        <>
          {/* Server-Side Cache Telemetry HUD */}
          <CacheMetricsCard
            onSeedTasks={handleSeedTasks}
            onOpenBenchmark={() => setIsBenchmarkOpen(true)}
            onOpenExplain={() => setIsExplainOpen(true)}
            addToast={addToast}
          />

          <TaskStats stats={stats} />
          <TaskForm onAddTask={handleAddTask} isSubmitting={isSubmitting} />
          <TaskFilters filters={filters} onFilterChange={handleFilterChange} />
          <TaskList
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onEdit={setEditingTask}
            onDeleteRequest={setDeletingTask}
            onSeed={handleSeedTasks}
          />
        </>
      )}

      {/* Edit Modal */}
      <TaskEditModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        onUpdateTask={handleUpdateTask}
      />

      {/* Delete Modal */}
      <TaskDeleteConfirmModal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        task={deletingTask}
        onConfirmDelete={handleDeleteTask}
      />

      {/* Cache Benchmark Modal */}
      <CacheBenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
      />

      {/* Query Explain Modal */}
      <ExplainQueryModal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
      />
    </div>
  );
};

export default HomePage;
