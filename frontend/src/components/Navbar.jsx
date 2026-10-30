import React from 'react';
import { NavLink } from 'react-router-dom';
import { CheckSquare, FolderKanban, Mail, BarChart3, Info, Activity, User, LogOut, LogIn, Sparkles, Zap, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ apiStatus, onOpenAuthModal, onOpenInspector, onOpenEventModal, loadedRoutesCount = 1 }) => {
  const { user, isAuthenticated, logout, bypassCache, setBypassCache } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <NavLink to="/" className="nav-brand">
          <div className="logo-icon-wrapper">
            <Radio size={22} />
          </div>
          <div className="nav-title-group">
            <h1>TaskFlow Pro</h1>
            <div className="nav-subtitle">
              <span className="pulse-dot" />
              <span>P10: Event-Driven Architecture (EventEmitter)</span>
            </div>
          </div>
        </NavLink>

        {/* Route Links (React Router) */}
        <nav className="nav-links">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end
          >
            <CheckSquare size={16} />
            <span>Tasks</span>
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FolderKanban size={16} />
            <span>Projects</span>
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Mail size={16} />
            <span>Contact</span>
          </NavLink>

          <NavLink
            to="/performance"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <BarChart3 size={16} />
            <span>Performance</span>
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Info size={16} />
            <span>About</span>
          </NavLink>
        </nav>

        {/* Actions: Event Stream, Cache Toggle, Chunk Inspector & Auth */}
        <div className="nav-actions">
          {/* Practical 10 Asynchronous Event Stream Trigger */}
          <button
            onClick={onOpenEventModal}
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#818cf8',
              padding: '0.35rem 0.65rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
            title="Inspect Practical 10 Asynchronous EventEmitter & Live Stream"
          >
            <Radio size={13} />
            <span>Event Stream</span>
          </button>

          {/* In-Memory Cache Toggle Switch */}
          <button
            onClick={() => setBypassCache(!bypassCache)}
            style={{
              background: bypassCache ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${bypassCache ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
              color: bypassCache ? '#fbbf24' : '#34d399',
              padding: '0.35rem 0.65rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
            title={bypassCache ? "In-Memory Cache is bypassed (?nocache=true)" : "In-Memory Cache is active (TTL: 60s)"}
          >
            <Zap size={13} />
            <span>{bypassCache ? 'Cache: Bypassed' : 'Cache: Active'}</span>
          </button>

          <button
            className="chunk-badge-btn"
            onClick={onOpenInspector}
            title="Inspect Dynamic Code-Split Chunks in Real Time"
          >
            <Activity size={14} />
            <span>{loadedRoutesCount}/5 Chunks</span>
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(99, 102, 241, 0.15)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  fontSize: '0.82rem',
                  color: '#e0e7ff'
                }}
              >
                <User size={14} color="#a5b4fc" />
                <span style={{ fontWeight: 600 }}>{user?.name || 'User'}</span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={logout}
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={onOpenAuthModal}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
