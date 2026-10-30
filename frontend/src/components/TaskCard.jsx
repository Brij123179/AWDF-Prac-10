import React, { useState, useRef } from 'react';
import { Check, Edit2, Trash2, Calendar, Clock, RefreshCw } from 'lucide-react';

/**
 * TaskCard Component
 * Optimized with React.memo() to prevent unnecessary re-renders (Supplementary Problem 3).
 * Tracks internal render count to visually prove re-render prevention during search/filter operations.
 */
const TaskCard = ({ task, onToggleComplete, onEdit, onDeleteRequest, showRenderCounter = true }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Render counter to demonstrate React.memo / Profiler optimization
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  const handleToggle = async () => {
    if (task.isOptimistic) return;
    setIsUpdating(true);
    await onToggleComplete(task._id, !task.completed);
    setIsUpdating(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className={`task-card ${task.completed ? 'completed' : ''}`}
      style={{
        borderLeft: `4px solid ${
          task.priority === 'high' ? '#f43f5e' : task.priority === 'low' ? '#06b6d4' : '#f59e0b'
        }`
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <h3 className="task-card-title" style={{ fontSize: '1.05rem', fontWeight: 600 }}>
            {task.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {showRenderCounter && (
              <span
                className="badge"
                title="Number of times this component re-rendered in the React reconciliation cycle"
                style={{
                  fontSize: '0.68rem',
                  background: renderCountRef.current > 2 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: renderCountRef.current > 2 ? '#f87171' : '#34d399',
                  border: `1px solid ${renderCountRef.current > 2 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                }}
              >
                <RefreshCw size={10} />
                Renders: {renderCountRef.current}
              </span>
            )}
            <span
              className="badge"
              style={{
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                background: task.priority === 'high' ? 'rgba(244,63,94,0.15)' : task.priority === 'low' ? 'rgba(6,182,212,0.15)' : 'rgba(245,158,11,0.15)',
                color: task.priority === 'high' ? '#f43f5e' : task.priority === 'low' ? '#06b6d4' : '#f59e0b',
                border: `1px solid ${task.priority === 'high' ? 'rgba(244,63,94,0.3)' : task.priority === 'low' ? 'rgba(6,182,212,0.3)' : 'rgba(245,158,11,0.3)'}`
              }}
            >
              {task.priority || 'medium'}
            </span>
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', minHeight: '38px' }}>
          {task.description || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>No description provided</span>}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
          <Calendar size={12} />
          <span>{formatDate(task.createdAt)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            className={`btn btn-sm ${task.completed ? 'btn-secondary' : 'btn-primary'}`}
            style={{
              padding: '0.3rem 0.65rem',
              background: task.completed ? 'rgba(16, 185, 129, 0.2)' : undefined,
              color: task.completed ? '#34d399' : undefined,
              border: task.completed ? '1px solid rgba(16, 185, 129, 0.4)' : undefined
            }}
            onClick={handleToggle}
            title={task.completed ? 'Mark as Pending' : 'Mark as Completed'}
            disabled={isUpdating}
          >
            <Check size={13} />
            <span>{task.completed ? 'Completed' : 'Done'}</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.3rem 0.5rem' }}
            onClick={() => onEdit(task)}
            title="Edit Task"
          >
            <Edit2 size={13} />
          </button>

          <button
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.3rem 0.5rem', color: '#f43f5e' }}
            onClick={() => onDeleteRequest(task)}
            title="Delete Task"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Memoized with custom or default shallow comparison for optimal reconciliation performance
export default React.memo(TaskCard);
