import React, { useState, useEffect } from 'react';
import PhoneInput from './PhoneInput';
import './PhoneInput.css';
import './LeadModal.css';

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const EMPTY = { name:'', email:'', phone:'', goal:'', status:'new', priority:'medium', source:'manual', notes:'' };

export default function LeadModal({ isOpen, onClose, onSave, lead, loading }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(lead ? {
      name:     lead.name     || '',
      email:    lead.email    || '',
      phone:    lead.phone    || '',
      goal:     lead.goal     || '',
      status:   lead.status   || 'new',
      priority: lead.priority || 'medium',
      source:   lead.source   || 'manual',
      notes:    lead.notes    || '',
    } : EMPTY);
  }, [lead, isOpen]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-fade">
        <div className="modal-header">
          <h2 className="modal-title">{lead ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button className="modal-close btn btn-ghost btn-icon" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" name="name" value={form.name} onChange={handleChange}
                placeholder="Arjun Sharma" required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" name="email" type="email" value={form.email}
                onChange={handleChange} placeholder="arjun@example.com" />
            </div>
          </div>

          <div className="modal-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <PhoneInput name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Fitness Goal</label>
              <input className="form-input" name="goal" value={form.goal} onChange={handleChange}
                placeholder="e.g. Lose 10kg, build muscle…" />
            </div>
          </div>

          <div className="modal-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="closed">Closed</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Source</label>
            <div className="source-select-grid">
              {[
                { val:'manual',   icon:'✍️', label:'Manual'   },
                { val:'referral', icon:'🤝', label:'Referral' },
                { val:'social',   icon:'📲', label:'Social'   },
                { val:'form',     icon:'🌐', label:'Form'     },
                { val:'other',    icon:'•',  label:'Other'    },
              ].map(s => (
                <button key={s.val} type="button"
                  className={`source-select-btn ${form.source === s.val ? 'source-select-active' : ''}`}
                  onClick={() => setForm({ ...form, source: s.val })}>
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" name="notes" value={form.notes}
              onChange={handleChange} placeholder="Any additional context about this lead…" rows={3} />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !form.name.trim()}>
              {loading ? <><span className="spinner" /> Saving…</> : lead ? 'Save Changes' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
