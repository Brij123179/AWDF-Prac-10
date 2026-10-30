import React from 'react';
import TaskCard from './TaskCard';
import { ClipboardList, Sparkles } from 'lucide-react';

const TaskList = ({ tasks, onToggleComplete, onEdit, onDeleteRequest, onSeed }) => {
  if (tasks.length === 0) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: 'var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '3rem 2rem',
        textAlign: 'center'
      }}>
        <ClipboardList size={48} color="var(--text-subtle)" style={{ marginBottom: '1rem', opacity: 0.7 }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.4rem' }}>No Tasks Found</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem', maxWidth: '460px', margin: '0 auto 1.5rem auto' }}>
          No tasks match your current filters. Add a new task above or populate sample performance tasks.
        </p>
        {onSeed && (
          <button className="btn btn-secondary" onClick={onSeed}>
            <Sparkles size={16} color="var(--accent-indigo)" />
            Load Sample Optimization Tasks
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="tasks-grid">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDeleteRequest={onDeleteRequest}
        />
      ))}
    </div>
  );
};

export default TaskList;
