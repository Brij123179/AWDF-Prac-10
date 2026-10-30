import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ChunkErrorBoundary Component
 * Catches network failures or stale chunks when dynamic import() fails.
 */
class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dynamic Chunk Loading Error caught by Boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          margin: '2rem auto',
          maxWidth: '600px'
        }}>
          <AlertTriangle size={48} color="#f43f5e" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
            Dynamic Chunk Load Failed
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            The browser could not download the requested route chunk. This often occurs when a new version has been deployed or the network drops.
          </p>
          <button className="btn btn-primary" onClick={this.handleRetry}>
            <RefreshCw size={16} />
            Reload & Retry Chunk
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;
