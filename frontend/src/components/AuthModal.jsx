import React, { useState } from 'react';
import { X, Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose, addToast }) => {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (tab === 'login') {
        await login(email, password);
        addToast('Welcome back! Successfully authenticated.', 'success');
      } else {
        await register(name, email, password);
        addToast('Account created successfully! You are now logged in.', 'success');
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={22} color="#6366f1" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {tab === 'login' ? 'Sign In to TaskFlow' : 'Create Account'}
            </h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '4px', marginBottom: '1.4rem' }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              background: tab === 'login' ? 'var(--accent-indigo)' : 'transparent',
              color: '#fff',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onClick={() => { setTab('login'); setError(null); }}
          >
            Login
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              background: tab === 'register' ? 'var(--accent-indigo)' : 'transparent',
              color: '#fff',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onClick={() => { setTab('register'); setError(null); }}
          >
            Register
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', color: '#fca5a5', fontSize: '0.84rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : tab === 'login' ? 'Sign In' : 'Create Account'}
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
