import React from 'react';
import { CheckCircle2, Clock, ListTodo, Flame } from 'lucide-react';

const TaskStats = ({ stats }) => {
  const { total = 0, completed = 0, pending = 0 } = stats;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
          <ListTodo size={24} />
        </div>
        <div>
          <div className="stat-number">{total}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
          <CheckCircle2 size={24} />
        </div>
        <div>
          <div className="stat-number" style={{ color: '#34d399' }}>{completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
          <Clock size={24} />
        </div>
        <div>
          <div className="stat-number" style={{ color: '#fbbf24' }}>{pending}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8' }}>
          <Flame size={24} />
        </div>
        <div>
          <div className="stat-number" style={{ color: '#38bdf8' }}>{completionRate}%</div>
          <div className="stat-label">Progress Rate</div>
        </div>
      </div>
    </div>
  );
};

export default TaskStats;
