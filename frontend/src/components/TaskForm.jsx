import React, { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';

const TaskForm = ({ onAddTask, isSubmitting }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      completed: false
    });

    setTitle('');
    setDescription('');
    setPriority('medium');
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--bg-card)',
        padding: '1.4rem',
        borderRadius: 'var(--radius-lg)',
        border: 'var(--glass-border)',
        marginBottom: '2rem'
      }}
    >
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <PlusCircle size={18} color="var(--accent-indigo)" />
        Create New Task
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 140px', gap: '0.85rem', alignItems: 'flex-start' }}>
        <input
          type="text"
          className="input-field"
          placeholder="Task title (e.g. Implement React.lazy chunking)..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <select
          className="input-field"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ height: '42px' }}
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? (
            <Loader2 size={16} className="spinner-pulse" />
          ) : (
            <>
              <PlusCircle size={16} />
              Add Task
            </>
          )}
        </button>
      </div>

      <input
        type="text"
        className="input-field"
        style={{ marginTop: '0.75rem', fontSize: '0.84rem' }}
        placeholder="Optional detailed description or acceptance criteria..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
    </form>
  );
};

export default TaskForm;
