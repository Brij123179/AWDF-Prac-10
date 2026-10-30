import React, { useState, useEffect } from 'react';
import { Zap, Activity, Clock, Database, RefreshCw, Trash2, Cpu, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CacheMetricsCard = ({ onSeedTasks, onOpenBenchmark, onOpenExplain, addToast }) => {
  const { authFetch, lastCacheEvent } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await authFetch('/api/cache/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to load cache stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleFlushCache = async () => {
    setLoading(true);
    try {
      await authFetch('/api/cache/flush', { method: 'DELETE' });
      await fetchStats();
      if (addToast) addToast('All in-memory cache keys flushed!', 'info');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      padding: '1.25rem',
      marginBottom: '1.5rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={18} color="#06b6d4" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc' }}>
              In-Memory Cache Telemetry HUD
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                node-cache (TTL: 60s)
              </span>
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
              Real-time server-side cache state & sub-millisecond retrieval monitoring
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={onOpenBenchmark}
            className="btn btn-sm"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #6366f1)', color: '#fff', border: 'none', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Zap size={14} /> Latency Benchmark
          </button>
          <button
            onClick={onOpenExplain}
            className="btn btn-sm"
            style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.12)', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Cpu size={14} /> Query .explain()
          </button>
          <button
            onClick={onSeedTasks}
            className="btn btn-sm"
            style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.12)', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            title="Seed starter tasks in MongoDB"
          >
            <Database size={14} /> Seed Tasks
          </button>
          <button
            onClick={handleFlushCache}
            disabled={loading}
            className="btn btn-sm"
            style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.3)', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            title="Flush all in-memory cache keys"
          >
            <Trash2 size={14} /> Flush Cache
          </button>
          <button
            onClick={fetchStats}
            style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.12)', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px' }}
            title="Refresh stats"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Grid of 4 metric tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '0.75rem' }}>
        {/* Metric 1: Last Latency */}
        <div style={{
          background: 'rgba(11, 17, 30, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderLeft: `4px solid ${
            !lastCacheEvent
              ? '#6366f1'
              : lastCacheEvent.cacheHeader === 'HIT'
              ? '#10b981'
              : '#f59e0b'
          }`,
          borderRadius: '10px',
          padding: '0.85rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
              Last API Latency
            </span>
            {lastCacheEvent && (
              <span style={{
                background: lastCacheEvent.cacheHeader === 'HIT' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: lastCacheEvent.cacheHeader === 'HIT' ? '#34d399' : '#fbbf24',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontSize: '0.7rem',
                fontWeight: 700
              }}>
                {lastCacheEvent.cacheHeader}
              </span>
            )}
          </div>
          <div style={{
            fontSize: '1.45rem',
            fontWeight: 700,
            color: !lastCacheEvent
              ? '#f8fafc'
              : lastCacheEvent.cacheHeader === 'HIT'
              ? '#34d399'
              : '#fbbf24'
          }}>
            {lastCacheEvent ? `${lastCacheEvent.duration} ms` : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
            <Clock size={12} />
            <span>{lastCacheEvent ? `Server: ${lastCacheEvent.serverDuration} | ${lastCacheEvent.timestamp}` : 'Awaiting request'}</span>
          </div>
        </div>

        {/* Metric 2: Hit Rate */}
        <div style={{
          background: 'rgba(11, 17, 30, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderLeft: '4px solid #06b6d4',
          borderRadius: '10px',
          padding: '0.85rem'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
            Cache Hit Ratio
          </span>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#06b6d4' }}>
            {stats ? `${stats.hitRatePercent}%` : '0.0%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
            {stats ? `${stats.hits} Hits / ${stats.misses} Misses (${stats.totalRequests} reqs)` : 'No requests recorded'}
          </div>
        </div>

        {/* Metric 3: Active Keys in Memory */}
        <div style={{
          background: 'rgba(11, 17, 30, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderLeft: '4px solid #a855f7',
          borderRadius: '10px',
          padding: '0.85rem'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
            Keys In Memory
          </span>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#a855f7' }}>
            {stats ? stats.activeKeysCount : 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
            {stats ? `Est. Memory: ${stats.nodeCacheInternals.ksize + stats.nodeCacheInternals.vsize} bytes` : '0 bytes'}
          </div>
        </div>

        {/* Metric 4: Cache Invalidations */}
        <div style={{
          background: 'rgba(11, 17, 30, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderLeft: '4px solid #f43f5e',
          borderRadius: '10px',
          padding: '0.85rem'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
            Cache Invalidations
          </span>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#fb7185' }}>
            {stats ? stats.totalInvalidations : 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
            {stats && stats.lastInvalidationTime
              ? `Last: ${new Date(stats.lastInvalidationTime).toLocaleTimeString()}`
              : 'Triggered by POST/PUT/DELETE'}
          </div>
        </div>
      </div>

      {/* Active Keys Tag List */}
      {stats && stats.keys && stats.keys.length > 0 && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '0.5rem 0.85rem',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          flexWrap: 'wrap'
        }}>
          <span style={{ color: '#06b6d4', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} /> In-Memory Keys:
          </span>
          {stats.keys.map((k, idx) => (
            <code key={idx} style={{
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              color: '#cbd5e1',
              fontFamily: 'monospace'
            }}>
              {k}
            </code>
          ))}
        </div>
      )}
    </div>
  );
};

export default CacheMetricsCard;
