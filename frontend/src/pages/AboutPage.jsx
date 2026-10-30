import React from 'react';
import { BookOpen, Layers, Award, Terminal, Code2, Server, Cpu, CheckCircle2, Zap, Database } from 'lucide-react';

const AboutPage = () => {
  return (
    <div>
      {/* Hero Header */}
      <section className="page-hero">
        <div className="hero-text">
          <h2>Architecture & Course Curriculum Context</h2>
          <p>
            Documentation for <strong>Practical 9: Server-Side In-Memory Caching and Database Query Optimization in Express & MongoDB</strong>.
            Course: Advanced Web Development Frameworks (ITUE301) • CO2, CO4 / PO3, PO5.
          </p>
        </div>
        <div className="hero-badges">
          <span className="badge badge-emerald">
            <Award size={13} />
            CO2, CO4 / PO3, PO5
          </span>
          <span className="badge badge-cyan">
            <BookOpen size={13} />
            Coursera Week 9 Module 5
          </span>
        </div>
      </section>

      {/* Architecture Diagrams Before vs After */}
      <div className="perf-card" style={{ marginBottom: '2rem' }}>
        <div className="perf-card-header">
          <h3>
            <Zap size={20} color="var(--accent-cyan)" />
            In-Memory Caching & Cache-Aside Architecture Flow
          </h3>
          <span className="badge badge-cyan">node-cache & MongoDB Architecture</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Read Path */}
          <div style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '12px', padding: '1.2rem' }}>
            <h4 style={{ color: '#06b6d4', fontSize: '0.98rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={16} /> READ FLOW (Cache-Aside Pattern):
            </h4>
            <pre style={{ background: '#090d16', padding: '1rem', borderRadius: '8px', fontSize: '0.78rem', color: '#cbd5e1', overflowX: 'auto', fontFamily: 'JetBrains Mono' }}>
{`Client: GET /api/tasks
       │
       ▼
Check In-Memory Cache (node-cache)
├── HIT  ──► Return RAM data (~1 - 2 ms)
│            X-Cache: HIT
│
└── MISS ──► Query MongoDB Atlas
             ├── Apply Compound Index (IXSCAN)
             ├── Apply .lean() & Projection
             ├── Write response to cache (TTL: 60s)
             └── Return fresh data (~12 - 25 ms)
                 X-Cache: MISS`}
            </pre>
          </div>

          {/* Write Path */}
          <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '1.2rem' }}>
            <h4 style={{ color: '#f87171', fontSize: '0.98rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={16} /> WRITE FLOW (Automatic Invalidation):
            </h4>
            <pre style={{ background: '#090d16', padding: '1rem', borderRadius: '8px', fontSize: '0.78rem', color: '#cbd5e1', overflowX: 'auto', fontFamily: 'JetBrains Mono' }}>
{`Client: POST / PUT / DELETE /api/tasks
       │
       ▼
Execute Database Mutation in MongoDB
       │
       ▼
Trigger Invalidation:
cacheService.invalidateUserTasks(userId)
       │
       ▼
Purge all keys: "tasks:\${userId}:*"
       │
       ▼
Next GET /api/tasks guaranteed to
fetch fresh data (Zero Stale Reads)`}
            </pre>
          </div>
        </div>
      </div>

      {/* Theory & Coursera Concepts */}
      <div className="perf-card" style={{ marginBottom: '2rem' }}>
        <div className="perf-card-header">
          <h3>
            <BookOpen size={20} color="var(--accent-cyan)" />
            Coursera Reference & Technical Theory
          </h3>
          <span className="badge badge-cyan">IBM Node.js & MongoDB Developing Back-end Database Apps</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.2rem' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.55)', padding: '1.2rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#a5b4fc', marginBottom: '0.4rem' }}>
              1. In-Memory Caching (node-cache)
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.5 }}>
              Stores pre-computed database responses in Node.js process heap memory. Eliminates repeated TCP network hops, connection pool contention, and disk I/O, yielding sub-millisecond API response times.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.55)', padding: '1.2rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#67e8f9', marginBottom: '0.4rem' }}>
              2. Compound Indexing (IXSCAN)
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.5 }}>
              Indexes multiple fields together (e.g. <code>&#123; user: 1, createdAt: -1 &#125;</code>) so MongoDB scans only the pre-sorted B-Tree leaf nodes, avoiding collection scans (<code>COLLSCAN</code>) and in-memory sorting.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.55)', padding: '1.2rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#34d399', marginBottom: '0.4rem' }}>
              3. Mongoose <code>.lean()</code> & Projection
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.5 }}>
              Bypasses Mongoose document model instantiation and change tracking, returning raw JavaScript objects (POJOs). Reduces V8 memory allocations by &gt;60% and accelerates serialization.
            </p>
          </div>
        </div>
      </div>

      {/* API Endpoint Reference Table */}
      <div className="perf-card">
        <div className="perf-card-header">
          <h3>
            <Server size={20} color="var(--accent-emerald)" />
            Practical 9 REST API Endpoints Reference
          </h3>
          <span className="badge badge-emerald">Express 4.19, node-cache & MongoDB (taskdb_p9)</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Access Level</th>
                <th>Caching / Invalidation Behavior</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>GET</code></td>
                <td><code>/api/health</code></td>
                <td><span className="badge badge-cyan">Public</span></td>
                <td>System health, database (taskdb_p9), and node-cache status</td>
              </tr>
              <tr>
                <td><code>POST</code></td>
                <td><code>/api/auth/register</code></td>
                <td><span className="badge badge-cyan">Public</span></td>
                <td>Registers user account with bcrypt password hashing</td>
              </tr>
              <tr>
                <td><code>POST</code></td>
                <td><code>/api/auth/login</code></td>
                <td><span className="badge badge-cyan">Public</span></td>
                <td>Authenticates credentials and returns JWT bearer token</td>
              </tr>
              <tr>
                <td><code>GET</code></td>
                <td><code>/api/tasks</code></td>
                <td><span className="badge badge-purple">Protected (JWT)</span></td>
                <td><strong>Cached (TTL: 60s)</strong>; returns <code>X-Cache: HIT/MISS</code></td>
              </tr>
              <tr>
                <td><code>POST</code></td>
                <td><code>/api/tasks</code></td>
                <td><span className="badge badge-purple">Protected (JWT)</span></td>
                <td>Creates task &amp; <strong>invalidates user cache keys</strong></td>
              </tr>
              <tr>
                <td><code>PUT</code></td>
                <td><code>/api/tasks/:id</code></td>
                <td><span className="badge badge-purple">Protected (JWT)</span></td>
                <td>Updates task &amp; <strong>invalidates user cache keys</strong></td>
              </tr>
              <tr>
                <td><code>DELETE</code></td>
                <td><code>/api/tasks/:id</code></td>
                <td><span className="badge badge-purple">Protected (JWT)</span></td>
                <td>Deletes task &amp; <strong>invalidates user cache keys</strong></td>
              </tr>
              <tr>
                <td><code>GET</code></td>
                <td><code>/api/tasks/explain</code></td>
                <td><span className="badge badge-purple">Protected (JWT)</span></td>
                <td>Runs MongoDB <code>.explain('executionStats')</code> verifying <code>IXSCAN</code></td>
              </tr>
              <tr>
                <td><code>GET</code></td>
                <td><code>/api/cache/stats</code></td>
                <td><span className="badge badge-cyan">Public</span></td>
                <td>Real-time cache hit rate, active keys, and memory sizing</td>
              </tr>
              <tr>
                <td><code>DELETE</code></td>
                <td><code>/api/cache/flush</code></td>
                <td><span className="badge badge-cyan">Public</span></td>
                <td>Flushes all active entries from in-memory cache</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
