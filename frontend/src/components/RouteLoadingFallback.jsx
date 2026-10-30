import React from 'react';
import { Zap, Cpu, Sparkles } from 'lucide-react';

/**
 * RouteLoadingFallback Component
 * Meaningful fallback UI rendered by React <Suspense> while dynamic route chunks are fetched.
 */
const RouteLoadingFallback = ({ routeName = 'Route' }) => {
  return (
    <div className="route-fallback-container">
      {/* Dynamic Chunk Loading Banner */}
      <div className="chunk-loading-indicator">
        <div className="chunk-info">
          <div className="spinner-pulse" />
          <div className="chunk-details">
            <h4>
              <Zap size={15} style={{ display: 'inline', marginRight: '6px', color: '#6366f1' }} />
              Fetching Dynamic Chunk: <code>{routeName}.chunk.js</code>
            </h4>
            <p>React.lazy() Suspense is loading code on-demand...</p>
          </div>
        </div>
        <div className="badge badge-indigo">
          <Cpu size={13} />
          Code-Split Module
        </div>
      </div>

      {/* Shimmering Skeleton Header */}
      <div className="skeleton-hero shimmer" />

      {/* Shimmering Skeleton Grid */}
      <div className="skeleton-grid">
        <div className="skeleton-card shimmer" />
        <div className="skeleton-card shimmer" />
        <div className="skeleton-card shimmer" />
      </div>

      {/* Shimmering Skeleton Content Block */}
      <div className="skeleton-block shimmer" />
    </div>
  );
};

export default RouteLoadingFallback;
