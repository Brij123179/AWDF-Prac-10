import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Layers, PieChart, TrendingUp, Cpu } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * HeavyAnalyticsChart Component (Supplementary Problem 1)
 * Heavy third-party component using Chart.js (~160 KB uncompressed).
 * Loaded asynchronously ONLY when requested by the user, avoiding upfront bundle bloat.
 */
const HeavyAnalyticsChart = () => {
  // 1. Bar Chart: Route Load Times (Before vs After)
  const barData = {
    labels: ['Initial Home (/)', 'Projects (/projects)', 'Contact (/contact)', 'About (/about)'],
    datasets: [
      {
        label: 'Monolithic Single Bundle (ms)',
        data: [1250, 45, 40, 38],
        backgroundColor: 'rgba(244, 63, 94, 0.7)',
        borderColor: '#f43f5e',
        borderWidth: 1,
        borderRadius: 6
      },
      {
        label: 'Code-Split Lazy Chunks (ms)',
        data: [480, 180, 150, 140],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#cbd5e1', font: { family: 'Outfit', size: 12 } }
      },
      title: {
        display: true,
        text: 'Navigation Load Time Breakdown (Fast 3G)',
        color: '#f8fafc',
        font: { family: 'Outfit', size: 14, weight: 'bold' }
      }
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  // 2. Doughnut Chart: Bundle Size Share
  const doughnutData = {
    labels: ['Vendor React Core', 'Task Management App', 'Projects Chunk', 'Contact Chunk', 'Heavy Chart.js Module'],
    datasets: [
      {
        data: [171, 28, 22, 18, 160],
        backgroundColor: [
          '#6366f1',
          '#06b6d4',
          '#a855f7',
          '#f59e0b',
          '#ec4899'
        ],
        borderWidth: 0
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#cbd5e1', font: { family: 'Outfit', size: 11 } }
      },
      title: {
        display: true,
        text: 'Module Size Footprint (KB)',
        color: '#f8fafc',
        font: { family: 'Outfit', size: 14, weight: 'bold' }
      }
    }
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.65)',
      border: '1px solid rgba(236, 72, 153, 0.3)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.8rem',
      marginTop: '1.5rem',
      boxShadow: '0 8px 32px rgba(236, 72, 153, 0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.4rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', color: '#fff' }}>
            <PieChart size={20} color="#ec4899" />
            Heavy Third-Party Component (Chart.js & react-chartjs-2)
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '2px' }}>
            Successfully isolated into <code>vendor-chart.js</code> (~160 KB). Only loaded when this interactive panel was toggled!
          </p>
        </div>
        <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
          <Cpu size={13} />
          Dynamic Component Chunk
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: 'rgba(9, 13, 22, 0.6)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Bar data={barData} options={barOptions} />
        </div>

        <div style={{ background: 'rgba(9, 13, 22, 0.6)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
};

export default HeavyAnalyticsChart;
