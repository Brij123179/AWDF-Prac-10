import React, { useState, useEffect } from 'react';
import { X, Save, Edit3 } from 'lucide-react';

const TaskEditModal = ({ isOpen, onClose, task, onUpdateTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [completed, setCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setCompleted(!!task.completed);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    await onUpdateTask(task._id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      completed
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit3 size={20} color="var(--accent-indigo)" />
            <h3>Edit Task</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title</label>
            <input
              type="text"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="textarea-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task details..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select
                className="input-field"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                className="input-field"
                value={completed ? 'true' : 'false'}
                onChange={(e) => setCompleted(e.target.value === 'true')}
              >
                <option value="false">Pending</option>
                <option value="true">Completed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              <Save size={16} />
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskEditModal;
