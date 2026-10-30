import React, { useState, useEffect } from 'react';
import { X, Cpu, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ExplainQueryModal = ({ isOpen, onClose }) => {
  const { authFetch } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      authFetch('/api/tasks/explain')
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setData(json);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }} onClick={onClose}>
      <div style={{
        background: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
        padding: '1.75rem',
        color: '#f8fafc'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={22} color="#6366f1" />
              MongoDB Query Optimization (.explain())
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
              Profiles internal MongoDB execution plan and compound index scan efficiency.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#f8fafc', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px' }}
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            Profiling MongoDB execution plan...
          </div>
        ) : data ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              background: data.summary.isIndexScan ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
              border: `1px solid ${data.summary.isIndexScan ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              {data.summary.isIndexScan ? (
                <CheckCircle2 size={24} color="#34d399" />
              ) : (
                <AlertTriangle size={24} color="#fb7185" />
              )}
              <div>
                <div style={{ fontWeight: 700, color: data.summary.isIndexScan ? '#34d399' : '#fb7185' }}>
                  {data.summary.isIndexScan ? 'Optimized Query Plan: Index Scan (IXSCAN)' : 'Collection Scan (COLLSCAN)'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Active Index: <code style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{data.summary.indexUsed}</code>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(11, 17, 30, 0.6)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Execution Time</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#6366f1' }}>
                  {data.summary.executionTimeMillis} ms
                </div>
              </div>
              <div style={{ background: 'rgba(11, 17, 30, 0.6)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Docs Examined</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#06b6d4' }}>
                  {data.summary.totalDocsExamined}
                </div>
              </div>
              <div style={{ background: 'rgba(11, 17, 30, 0.6)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Keys Examined</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a855f7' }}>
                  {data.summary.totalKeysExamined}
                </div>
              </div>
              <div style={{ background: 'rgba(11, 17, 30, 0.6)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Returned Docs</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>
                  {data.summary.nReturned}
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '10px',
              padding: '1rem',
              fontSize: '0.85rem'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Layers size={16} color="#6366f1" /> Applied Database Optimizations:
              </h4>
              <ul style={{ paddingLeft: '1.25rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: 0 }}>
                <li>
                  <strong style={{ color: '#f8fafc' }}>Compound Indexing: </strong>
                  <code>{'{ user: 1, createdAt: -1 }'}</code> allows B-Tree pointer jumps directly to user tasks sorted chronologically, bypassing memory sorting.
                </li>
                <li>
                  <strong style={{ color: '#f8fafc' }}>Lean Execution: </strong>
                  <code>.lean()</code> skips Mongoose document prototype instantiation, reducing memory heap allocation by over 60%.
                </li>
                <li>
                  <strong style={{ color: '#f8fafc' }}>Field Projection: </strong>
                  <code>.select(...)</code> transmits only relevant task attributes, minimizing network I/O serialization time.
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div style={{ color: '#fb7185' }}>Failed to retrieve MongoDB execution stats.</div>
        )}
      </div>
    </div>
  );
};

export default ExplainQueryModal;
