import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationToast = ({ toasts = [], onDismiss }) => {
  if (toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="#10b981" />;
      case 'error':
        return <AlertCircle size={18} color="#f43f5e" />;
      default:
        return <Info size={18} color="#6366f1" />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          {getIcon(toast.type)}
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              padding: '2px'
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
