import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const TaskDeleteConfirmModal = ({ isOpen, onClose, task, onConfirmDelete }) => {
  if (!isOpen || !task) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.15)',
            color: '#f43f5e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <AlertTriangle size={26} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>Delete Task</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Are you sure you want to permanently delete <strong>"{task.title}"</strong>? This action cannot be undone.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1, background: '#f43f5e', borderColor: '#f43f5e' }}
            onClick={() => onConfirmDelete(task._id)}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDeleteConfirmModal;
