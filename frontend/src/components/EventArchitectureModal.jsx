import React, { useState, useEffect } from 'react';
import { Radio, Bell, AlertTriangle, CheckCircle, Clock, Zap, RefreshCw, Trash2, Cpu, ShieldAlert, ArrowRight } from 'lucide-react';

const EventArchitectureModal = ({ isOpen, onClose, addToast }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [delayMs, setDelayMs] = useState(2000);
  const [simulateError, setSimulateError] = useState(false);
  const [activeTab, setActiveTab] = useState('liveLogs'); // 'liveLogs' | 'architecture' | 'simulation'

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/events/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.data || []);
        if (data.config) {
          setDelayMs(data.config.simulatedDelayMs);
          setSimulateError(data.config.shouldSimulateError);
        }
      }
    } catch (err) {
      console.error('Failed to fetch event logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const updateConfig = async (newDelay, newSimError) => {
    try {
      const res = await fetch('/api/events/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delayMs: newDelay !== undefined ? newDelay : delayMs,
          shouldSimulateError: newSimError !== undefined ? newSimError : simulateError
        })
      });
      if (res.ok) {
        if (newDelay !== undefined) setDelayMs(newDelay);
        if (newSimError !== undefined) setSimulateError(newSimError);
        addToast?.('Event configuration updated!', 'success');
      }
    } catch (err) {
      addToast?.('Failed to update event configuration', 'error');
    }
  };

  const handleClearLogs = async () => {
    try {
      const res = await fetch('/api/events/logs', { method: 'DELETE' });
      if (res.ok) {
        setLogs([]);
        addToast?.('In-memory event telemetry logs cleared', 'info');
      }
    } catch (err) {
      addToast?.('Failed to clear logs', 'error');
    }
  };

  const handleTriggerError = async () => {
    try {
      const res = await fetch('/api/events/trigger-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Synthetic background listener error triggered from UI' })
      });
      if (res.ok) {
        addToast?.('Triggered synthetic background error event! Error listener caught it safely.', 'warning');
        setTimeout(fetchLogs, 400);
      }
    } catch (err) {
      addToast?.('Error triggering event', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ maxWidth: '850px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
              <Radio size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc' }}>
                Practical 10: Event-Driven Architecture
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                Node.js Native EventEmitter • Non-Blocking Asynchronous Processing
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>
            &times;
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('liveLogs')}
            style={{
              background: activeTab === 'liveLogs' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              color: activeTab === 'liveLogs' ? '#a5b4fc' : '#94a3b8',
              border: activeTab === 'liveLogs' ? '1px solid rgba(99, 102, 241, 0.5)' : 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Live Event Stream ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            style={{
              background: activeTab === 'architecture' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              color: activeTab === 'architecture' ? '#a5b4fc' : '#94a3b8',
              border: activeTab === 'architecture' ? '1px solid rgba(99, 102, 241, 0.5)' : 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Architecture & Timing Flow
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            style={{
              background: activeTab === 'simulation' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              color: activeTab === 'simulation' ? '#a5b4fc' : '#94a3b8',
              border: activeTab === 'simulation' ? '1px solid rgba(99, 102, 241, 0.5)' : 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Listener Lab & Fault Injection
          </button>
        </div>

        {/* Tab 1: Live Event Stream */}
        {activeTab === 'liveLogs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                Auto-refreshing background events captured by <code>taskEvents.on(...)</code>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={fetchLogs}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={14} className={loading ? 'spin' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={handleClearLogs}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <Bell size={36} style={{ color: '#64748b', marginBottom: '0.5rem' }} />
                <p style={{ color: '#94a3b8', margin: 0 }}>No background events logged yet.</p>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Create or delete a task on the Tasks page to emit events!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {logs.map((log) => {
                  const isCreated = log.event === 'task-created';
                  const isDeleted = log.event === 'task-deleted';
                  const isError = log.status === 'ERROR' || log.event === 'error';

                  return (
                    <div
                      key={log.id}
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        background: isError ? 'rgba(239, 68, 68, 0.08)' : isDeleted ? 'rgba(245, 158, 11, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                        border: `1px solid ${isError ? 'rgba(239, 68, 68, 0.3)' : isDeleted ? 'rgba(245, 158, 11, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              background: isError ? '#ef4444' : isDeleted ? '#f59e0b' : '#6366f1',
                              color: '#fff'
                            }}
                          >
                            {log.event}
                          </span>
                          <span style={{ color: '#f8fafc', fontWeight: 600 }}>{log.taskTitle}</span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '12px',
                            background: log.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.2)' : log.status === 'PROCESSING' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: log.status === 'COMPLETED' ? '#34d399' : log.status === 'PROCESSING' ? '#fbbf24' : '#f87171'
                          }}
                        >
                          {log.status}
                        </span>
                      </div>

                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        {log.message}
                      </p>

                      {/* Timestamp Timing Proof Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', fontSize: '0.75rem', background: 'rgba(0,0,0,0.25)', padding: '0.5rem', borderRadius: '6px' }}>
                        <div>
                          <span style={{ color: '#94a3b8', display: 'block' }}>API Response Sent:</span>
                          <strong style={{ color: '#38bdf8' }}>{log.apiResponseTimestamp?.split('T')[1]?.replace('Z', '') || 'N/A'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', display: 'block' }}>Listener Start:</span>
                          <strong style={{ color: '#a78bfa' }}>{log.listenerStartTimestamp?.split('T')[1]?.replace('Z', '') || 'N/A'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', display: 'block' }}>Listener Finished:</span>
                          <strong style={{ color: '#34d399' }}>{log.listenerFinishTimestamp?.split('T')[1]?.replace('Z', '') || 'Pending...'}</strong>
                        </div>
                        {log.simulatedDelayMs > 0 && (
                          <div>
                            <span style={{ color: '#94a3b8', display: 'block' }}>Background Delay:</span>
                            <strong style={{ color: '#f59e0b' }}>+{log.simulatedDelayMs}ms (Decoupled)</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Architecture Diagram */}
        {activeTab === 'architecture' && (
          <div style={{ color: '#cbd5e1' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              Node.js EventEmitter Asynchronous Request Lifecycle
            </h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              In traditional monolithic workflows, secondary actions (sending notification emails, audit logging, analytics tracking) block the critical request path. In Practical 10, Node.js native <code>EventEmitter</code> cleanly decouples side effects so the HTTP response returns immediately (HTTP 201) while listeners run asynchronously in background event loop cycles.
            </p>

            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '1.25rem', margin: '1rem 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8' }}>
                  <span>1. POST /api/tasks</span>
                  <ArrowRight size={14} />
                  <span>Saves task to MongoDB Atlas</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399' }}>
                  <span>2. res.status(201).json(task)</span>
                  <ArrowRight size={14} />
                  <span>Client receives HTTP 201 in ~20ms (Socket closed)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a78bfa' }}>
                  <span>3. taskEvents.emit('task-created', task)</span>
                  <ArrowRight size={14} />
                  <span>Dispatches event to TaskEvents instance</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24' }}>
                  <span>4. taskEvents.on('task-created')</span>
                  <ArrowRight size={14} />
                  <span>Simulates 2000ms email/audit notification in background</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f43f5e' }}>
                  <span>5. taskEvents.on('error')</span>
                  <ArrowRight size={14} />
                  <span>Safely intercepts any background exception without crashing process</span>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#38bdf8', fontSize: '0.95rem' }}>
                💡 Key Insight: Why EventEmitter Decouples Latency
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.5' }}>
                When <code>res.status(201).json()</code> is invoked before the listener completes, the Node.js HTTP response headers and body are immediately flushed to the operating system TCP socket. The client browser finishes its request immediately. The background listener scheduled with <code>setTimeout</code> executes in a future turn of the Node.js Event Loop Timer phase, ensuring zero perceived latency for the end user!
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Simulation & Fault Injection */}
        {activeTab === 'simulation' && (
          <div style={{ color: '#cbd5e1' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              Laboratory Experiments & Timing Controls
            </h3>

            {/* Delay Slider */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontWeight: 600, color: '#f8fafc' }}>
                  Simulated Notification Delay: <span style={{ color: '#38bdf8' }}>{delayMs} ms</span>
                </label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {[0, 1000, 2000, 4000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => updateConfig(preset, undefined)}
                      style={{
                        background: delayMs === preset ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${delayMs === preset ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                        color: delayMs === preset ? '#38bdf8' : '#94a3b8',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      {preset}ms
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="250"
                value={delayMs}
                onChange={(e) => updateConfig(parseInt(e.target.value, 10), undefined)}
                style={{ width: '100%' }}
              />
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Adjusting this delay exaggerates the gap between the instant HTTP response and the background listener finish.
              </p>
            </div>

            {/* Error Injection Test */}
            <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <ShieldAlert size={20} color="#f87171" />
                <h4 style={{ margin: 0, color: '#f87171', fontSize: '1rem' }}>
                  Supplementary Problem 2: Error Event Listener Resilience
                </h4>
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
                In Node.js, an unhandled <code>'error'</code> event causes the process to crash immediately. By registering a dedicated error listener (<code>taskEvents.on('error', ...)</code>), any failure occurring in background tasks is safely intercepted without disrupting active users.
              </p>

              <button
                onClick={handleTriggerError}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <AlertTriangle size={16} />
                <span>Trigger Synthetic Background Error</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventArchitectureModal;

