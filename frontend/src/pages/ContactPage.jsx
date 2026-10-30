import React, { useState, useEffect } from 'react';
import { Mail, Send, MessageSquare, HelpCircle, Phone, MapPin, CheckCircle, Clock, Sparkles, Layers } from 'lucide-react';

const ContactPage = ({ addToast }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('General Support');
  const [message, setMessage] = useState('');

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact');
      const data = await res.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching contact messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, category, message })
      });
      const data = await res.json();

      if (data.success) {
        addToast('Your inquiry has been submitted successfully!', 'success');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        fetchMessages();
      } else {
        addToast(data.error || 'Failed to send message', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero Header */}
      <section className="page-hero">
        <div className="hero-text">
          <h2>Contact & Support (Lazy-Loaded Chunk)</h2>
          <p>
            The <code>page-contact.js</code> bundle (~18 KB) was retrieved via dynamic <code>import()</code> only when navigating to this route.
            Users who only check tasks never load this contact form logic!
          </p>
        </div>
        <div className="hero-badges">
          <span className="badge badge-indigo">
            <Layers size={13} />
            Route: /contact
          </span>
          <span className="badge badge-amber">
            <Mail size={13} />
            Chunk: page-contact.js
          </span>
        </div>
      </section>

      <div className="contact-layout">
        {/* Left Column: Form & Inquiries */}
        <div>
          <div className="contact-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send size={18} color="var(--accent-indigo)" />
              Send a Query or Feedback
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Have questions regarding frontend code splitting, lazy loading, or React 18 Suspense boundaries? Submit your inquiry below.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Elena Rostova"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="elena@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Dynamic chunk hashing in Vite"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="input-field"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="General Support">General Support</option>
                    <option value="Performance Issue">Performance Issue</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Consultation">Consultation</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Message Content * (Minimum 5 characters)</label>
                <textarea
                  className="textarea-field"
                  placeholder="Describe your inquiry, performance observation, or feedback..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {submitting ? 'Submitting Inquiry...' : 'Submit Inquiry'}
                <Send size={16} />
              </button>
            </form>
          </div>

          {/* Recent Inquiries List */}
          <div className="contact-card">
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} color="var(--accent-cyan)" />
              Recent Support Inquiries Log
            </h4>

            {loading ? (
              <div className="skeleton-block shimmer" style={{ height: '120px' }} />
            ) : messages.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No messages submitted yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {messages.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: 'var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem 1.2rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{item.subject}</span>
                      <span className="badge badge-cyan">{item.category}</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '0.6rem' }}>
                      {item.message}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      <span>From: {item.name} ({item.email})</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Information & FAQ Sidebar */}
        <div>
          <div className="contact-sidebar-card">
            <h4>
              <HelpCircle size={16} color="var(--accent-indigo)" />
              Course Context
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.5 }}>
              Practical 8 demonstrates Route-Based Code Splitting in modern Single Page Applications (SPAs).
            </p>
          </div>

          <div className="contact-sidebar-card">
            <h4>
              <Phone size={16} color="var(--accent-emerald)" />
              Lab Support Desk
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              <strong>Email:</strong> awdf-lab@charusat.ac.in<br />
              <strong>Hours:</strong> Mon – Fri, 9:00 AM – 5:00 PM IST<br />
              <strong>Location:</strong> Advanced Web Frameworks Computing Lab
            </p>
          </div>

          <div className="contact-sidebar-card">
            <h4>
              <MapPin size={16} color="var(--accent-purple)" />
              Code Splitting Checklist
            </h4>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>
              <li>Dynamic <code>React.lazy()</code> wrapper used for route</li>
              <li>Enclosing <code>&lt;Suspense&gt;</code> boundary defined</li>
              <li>Sleek skeleton fallback prevents layout shifts</li>
              <li>Chunk is cached after first fetch by browser</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
