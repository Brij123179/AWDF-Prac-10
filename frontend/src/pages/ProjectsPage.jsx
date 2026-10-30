import React, { useState, useEffect } from 'react';
import { FolderKanban, Plus, Filter, Users, Calendar, CheckCircle, Clock, Sparkles, Layers } from 'lucide-react';

const ProjectsPage = ({ addToast }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New project form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Frontend');
  const [newProgress, setNewProgress] = useState(25);
  const [newStatus, setNewStatus] = useState('Planning');

  const categories = ['All', 'Frontend', 'Backend', 'DevOps', 'FullStack'];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const url = selectedCategory === 'All' ? '/api/projects' : `/api/projects?category=${selectedCategory}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProjects(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          category: newCategory,
          progress: Number(newProgress),
          status: newStatus
        })
      });
      const data = await res.json();

      if (data.success) {
        addToast('Project created successfully!', 'success');
        setShowAddModal(false);
        setNewTitle('');
        setNewDesc('');
        fetchProjects();
      } else {
        addToast(data.error || 'Failed to create project', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return <span className="badge badge-emerald"><CheckCircle size={12} /> Completed</span>;
      case 'In Progress': return <span className="badge badge-indigo"><Clock size={12} /> In Progress</span>;
      default: return <span className="badge badge-amber"><Clock size={12} /> Planning</span>;
    }
  };

  return (
    <div>
      {/* Hero Header */}
      <section className="page-hero">
        <div className="hero-text">
          <h2>Projects Board (Lazy-Loaded Chunk)</h2>
          <p>
            Notice that <code>page-projects.js</code> was downloaded by your browser <strong>only when you clicked 'Projects'</strong>!
            It was never loaded on the initial home page visit, saving bandwidth and execution overhead.
          </p>
        </div>
        <div className="hero-badges">
          <span className="badge badge-purple">
            <Layers size={13} />
            Route: /projects
          </span>
          <span className="badge badge-cyan">
            <FolderKanban size={13} />
            Chunk: page-projects.js
          </span>
        </div>
      </section>

      {/* Filter and Action Bar */}
      <div className="projects-header-actions">
        <div className="filter-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          className="btn btn-primary"
          style={{ marginLeft: 'auto' }}
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="skeleton-grid">
          <div className="skeleton-card shimmer" />
          <div className="skeleton-card shimmer" />
          <div className="skeleton-card shimmer" />
        </div>
      ) : projects.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)',
          border: 'var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem 2rem',
          textAlign: 'center'
        }}>
          <FolderKanban size={48} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>No Projects in this category</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.4rem' }}>
            Click 'New Project' to add your first milestone.
          </p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((proj) => (
            <div key={proj._id} className="project-card">
              <div>
                <div className="project-meta">
                  <span className="badge badge-cyan">{proj.category}</span>
                  {getStatusBadge(proj.status)}
                </div>

                <h3 className="project-title">{proj.title}</h3>
                <p className="project-desc">{proj.description}</p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  <span>Sprint Completion</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{proj.progress}%</span>
                </div>
                <div className="project-progress-bar">
                  <div className="project-progress-fill" style={{ width: `${proj.progress}%` }} />
                </div>

                <div className="project-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={14} />
                    <span>{proj.teamMembers?.join(', ') || 'Lead Developer'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={13} />
                    <span>{new Date(proj.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FolderKanban size={20} color="var(--accent-indigo)" />
                Add New Project
              </h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. NextGen Micro-Frontend Architecture"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="textarea-field"
                  placeholder="Goals, target milestones, and deliverables..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="input-field"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="DevOps">DevOps</option>
                    <option value="FullStack">FullStack</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    className="input-field"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Progress ({newProgress}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newProgress}
                  onChange={(e) => setNewProgress(e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--accent-indigo)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
