import React, { useState } from 'react';
import { X, Play, RefreshCw, Copy, Check, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const CacheBenchmarkModal = ({ isOpen, onClose }) => {
  const { authFetch } = useAuth();
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const runBenchmark = async () => {
    setRunning(true);
    setResults(null);

    try {
      const trialsCount = 5;
      const uncachedTimes = [];
      const cachedTimes = [];

      // 1. Run 5 Uncached Requests (?nocache=true)
      for (let i = 1; i <= trialsCount; i++) {
        const start = performance.now();
        const response = await authFetch('/api/tasks?nocache=true');
        const end = performance.now();
        const duration = parseFloat((end - start).toFixed(2));
        await response.json();
        uncachedTimes.push({ trial: i, duration, status: 'BYPASS' });
      }

      // 2. Clear cache first so Trial 1 is a fresh MISS, followed by 4 HITs
      await authFetch('/api/cache/user', { method: 'DELETE' });

      // 3. Run 5 Cached Requests
      for (let i = 1; i <= trialsCount; i++) {
        const start = performance.now();
        const response = await authFetch('/api/tasks');
        const end = performance.now();
        const duration = parseFloat((end - start).toFixed(2));
        const json = await response.json();
        cachedTimes.push({
          trial: i,
          duration,
          status: json.cacheStatus || response.headers.get('x-cache') || (i === 1 ? 'MISS' : 'HIT'),
          ttl: json.remainingTTL || 60
        });
      }

      // Calculations
      const avgUncached = uncachedTimes.reduce((acc, t) => acc + t.duration, 0) / trialsCount;
      const hitTrials = cachedTimes.filter((t) => t.status === 'HIT');
      const avgCachedHit =
        hitTrials.length > 0
          ? hitTrials.reduce((acc, t) => acc + t.duration, 0) / hitTrials.length
          : cachedTimes[1].duration;

      const speedup = (avgUncached / avgCachedHit).toFixed(1);
      const reduction = (((avgUncached - avgCachedHit) / avgUncached) * 100).toFixed(1);

      setResults({
        uncachedTimes,
        cachedTimes,
        avgUncached: parseFloat(avgUncached.toFixed(2)),
        avgCachedHit: parseFloat(avgCachedHit.toFixed(2)),
        speedup,
        reduction
      });
    } catch (err) {
      console.error('Benchmark failed:', err);
    } finally {
      setRunning(false);
    }
  };

  const copyMarkdownTable = () => {
    if (!results) return;
    let md = `| Trial | Uncached (MongoDB) | Cached (node-cache) | Cache Status |\n`;
    md += `|:-----:|:------------------:|:-------------------:|:------------:|\n`;
    for (let i = 0; i < results.uncachedTimes.length; i++) {
      md += `| ${i + 1} | ${results.uncachedTimes[i].duration} ms | ${results.cachedTimes[i].duration} ms | ${results.cachedTimes[i].status} |\n`;
    }
    md += `\n**Summary**:\n- Average Uncached: ${results.avgUncached} ms\n- Average Cached HIT: ${results.avgCachedHit} ms\n- Speedup Factor: ${results.speedup}x Faster (${results.reduction}% Latency Reduction)\n`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chartData = results
    ? {
        labels: ['Trial 1', 'Trial 2', 'Trial 3', 'Trial 4', 'Trial 5'],
        datasets: [
          {
            label: 'Uncached (MongoDB Query)',
            data: results.uncachedTimes.map((t) => t.duration),
            backgroundColor: 'rgba(245, 158, 11, 0.75)',
            borderColor: '#f59e0b',
            borderWidth: 1,
            borderRadius: 6
          },
          {
            label: 'Cached (node-cache)',
            data: results.cachedTimes.map((t) => t.duration),
            backgroundColor: 'rgba(6, 182, 212, 0.75)',
            borderColor: '#06b6d4',
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#cbd5e1',
          font: { family: 'Plus Jakarta Sans', size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw} ms`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Response Time (ms)', color: '#94a3b8' },
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    }
  };

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
        maxWidth: '760px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
        padding: '1.75rem',
        color: '#f8fafc'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={22} color="#06b6d4" />
              Automated Empirical Latency Benchmark
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
              Measures 5 Uncached database reads vs 5 In-Memory cached reads to document speedup.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#f8fafc', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button
            onClick={runBenchmark}
            disabled={running}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
              color: '#fff',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(6, 182, 212, 0.35)'
            }}
          >
            {running ? (
              <>
                <RefreshCw size={16} className="spin" /> Executing 10 Benchmark Trials...
              </>
            ) : (
              <>
                <Play size={16} /> Run Live Latency Benchmark
              </>
            )}
          </button>
          {results && (
            <button
              onClick={copyMarkdownTable}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#f8fafc',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              {copied ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
              {copied ? 'Copied Table!' : 'Copy Markdown'}
            </button>
          )}
        </div>

        {results && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(99, 102, 241, 0.15))',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              marginBottom: '1.25rem',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Avg Uncached (DB)</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fbbf24' }}>
                  {results.avgUncached} ms
                </div>
              </div>
              <div style={{ height: 35, width: 1, background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Avg Cached (HIT)</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#34d399' }}>
                  {results.avgCachedHit} ms
                </div>
              </div>
              <div style={{ height: 35, width: 1, background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Speedup Multiplier</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#06b6d4' }}>
                  {results.speedup}x Faster
                </div>
              </div>
            </div>

            <div style={{ height: '220px', marginBottom: '1.25rem', background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: '10px' }}>
              {chartData && <Bar data={chartData} options={chartOptions} />}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.05)', textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Trial</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Uncached (MongoDB)</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Cached (node-cache)</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Status</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Delta Savings</th>
                </tr>
              </thead>
              <tbody>
                {results.uncachedTimes.map((u, i) => {
                  const c = results.cachedTimes[i];
                  const delta = (u.duration - c.duration).toFixed(2);
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>Trial {i + 1}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: '#fbbf24' }}>{u.duration} ms</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: '#34d399' }}>{c.duration} ms</td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        <span style={{
                          background: c.status === 'HIT' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: c.status === 'HIT' ? '#34d399' : '#fbbf24',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '9999px',
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', color: '#06b6d4' }}>
                        -{delta} ms
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CacheBenchmarkModal;
