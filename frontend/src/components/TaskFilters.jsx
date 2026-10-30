import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

const TaskFilters = ({ filters, onFilterChange }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flexWrap: 'wrap',
      background: 'var(--bg-card)',
      padding: '0.9rem 1.2rem',
      borderRadius: 'var(--radius-md)',
      border: 'var(--glass-border)',
      marginBottom: '1.5rem'
    }}>
      {/* Search Bar */}
      <div style={{ position: 'relative', flex: '1 1 220px' }}>
        <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          className="input-field"
          placeholder="Search tasks..."
          style={{ paddingLeft: '36px' }}
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
      </div>

      {/* Priority Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Filter size={15} color="var(--text-subtle)" />
        <select
          className="input-field"
          style={{ width: 'auto', padding: '0.65rem 0.9rem' }}
          value={filters.priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>

      {/* Status Filter */}
      <div>
        <select
          className="input-field"
          style={{ width: 'auto', padding: '0.65rem 0.9rem' }}
          value={filters.completed}
          onChange={(e) => onFilterChange('completed', e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="false">Pending Only</option>
          <option value="true">Completed Only</option>
        </select>
      </div>

      {/* Sort By */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <ArrowUpDown size={15} color="var(--text-subtle)" />
        <select
          className="input-field"
          style={{ width: 'auto', padding: '0.65rem 0.9rem' }}
          value={filters.sortBy}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
        >
          <option value="createdAt">Sort: Date Created</option>
          <option value="title">Sort: Title</option>
          <option value="priority">Sort: Priority</option>
        </select>
      </div>
    </div>
  );
};

export default TaskFilters;
