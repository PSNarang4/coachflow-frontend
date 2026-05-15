import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';
import LeadModal from '../components/LeadModal';
import './LeadsPage.css';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const STATUS_FILTERS = ['all','new','contacted','qualified','closed','lost'];
const STATUS_OPTIONS  = ['new','contacted','qualified','closed','lost'];

const SOURCE_META = {
  form:     { label: 'Form',     icon: '🌐', color: '#47b4ff' },
  manual:   { label: 'Manual',   icon: '✍️', color: '#a47fff' },
  referral: { label: 'Referral', icon: '🤝', color: '#47ffa4' },
  social:   { label: 'Social',   icon: '📲', color: '#ff9f47' },
  other:    { label: 'Other',    icon: '•',  color: '#888' },
};

// ── Fixed StatusDropdown — no race condition ──────────────────────────────────
function StatusDropdown({ lead, onStatusChange }) {
  const [open, setOpen]       = useState(false);
  const [updating, setUpdating] = useState(false);
  const wrapRef = useRef(null);

  // Close on outside click using ref — not document listener race
  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    // Use capture phase with a small delay so the triggering click doesn't immediately close
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); };
  }, [open]);

  const handleSelect = async (s) => {
    if (s === lead.status || updating) return;
    setOpen(false);
    setUpdating(true);
    await onStatusChange(lead, s);
    setUpdating(false);
  };

  return (
    <div className="status-dropdown-wrap" ref={wrapRef}>
      <button
        className={`badge badge-${lead.status} status-dropdown-trigger ${updating ? 'status-updating' : ''}`}
        onClick={() => !updating && setOpen(v => !v)}
        type="button"
        disabled={updating}
      >
        {updating
          ? <span className="spinner" style={{ width: 10, height: 10 }} />
          : <><span className={`status-dot status-dot-${lead.status}`} style={{ marginRight: 5 }} />{lead.status}</>
        }
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 5, opacity: 0.6 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="status-dropdown-menu">
          <div className="status-dropdown-header">Change status</div>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              className={`status-dropdown-item ${s === lead.status ? 'status-dropdown-item-active' : ''}`}
              onClick={() => handleSelect(s)}
              type="button"
            >
              <span className={`status-dot status-dot-${s}`} />
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {s === lead.status && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" style={{ marginLeft: 'auto' }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Source badge — premium redesign ──────────────────────────────────────────
function SourceBadge({ source }) {
  const meta = SOURCE_META[source] || SOURCE_META.other;
  return (
    <div className="source-badge" style={{ '--src-color': meta.color }}>
      <span className="source-badge-icon">{meta.icon}</span>
      <span className="source-badge-label">{meta.label}</span>
    </div>
  );
}

// ── AI Score chip ─────────────────────────────────────────────────────────────
function ScoreChip({ score, reason, leadId, onScore }) {
  const [loading, setLoading] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const handleScore = async (e) => {
    e.stopPropagation();
    if (score !== null) { setShowTip(v => !v); return; }
    setLoading(true);
    await onScore(leadId);
    setLoading(false);
  };

  if (loading) return <div className="score-chip score-chip-loading"><span className="spinner" style={{width:12,height:12}}/></div>;

  if (score === null) return (
    <button className="score-chip score-chip-empty" onClick={handleScore} type="button" title="Score this lead with AI">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      Score
    </button>
  );

  const color = score >= 75 ? '#47ffa4' : score >= 50 ? '#e8ff47' : score >= 30 ? '#ff9f47' : '#ff6b6b';
  return (
    <div className="score-chip-wrap">
      <button className="score-chip score-chip-filled" style={{ '--sc': color }} onClick={handleScore} type="button">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        {score}
      </button>
      {showTip && reason && (
        <div className="score-tooltip">
          <div className="score-tooltip-title">AI Analysis</div>
          <p>{reason}</p>
          <button className="score-tooltip-close" onClick={() => setShowTip(false)}>✕</button>
        </div>
      )}
    </div>
  );
}

// ── Parse intake notes into structured object ─────────────────────────────────
function parseIntakeNotes(notes) {
  if (!notes) return null;
  const lines = notes.split('\n').filter(Boolean);
  const data = {};
  lines.forEach(line => {
    const idx = line.indexOf(': ');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 2).trim();
    data[key] = val;
  });
  return Object.keys(data).length > 0 ? data : null;
}

const INTAKE_SECTIONS = [
  {
    title: 'Personal',
    icon: '👤',
    fields: ['Gender','DOB','Age','Height','Weight'],
  },
  {
    title: 'Lifestyle',
    icon: '💼',
    fields: ['Occupation','Work schedule'],
  },
  {
    title: 'Health',
    icon: '🏥',
    fields: ['Health conditions','Medications','Injuries','Stress/motivation issues','Readiness for change'],
  },
  {
    title: 'Goals',
    icon: '🎯',
    fields: ['Why they want to change'],
  },
  {
    title: 'Training',
    icon: '🏋️',
    fields: ['Currently exercising','Had personal trainer'],
  },
  {
    title: 'Commitment',
    icon: '🔥',
    fields: ['Commitment','Additional info'],
  },
];

function LeadDrawerContent({ lead, onClose }) {
  const intake = parseIntakeNotes(lead.notes);
  const hasIntake = intake && Object.keys(intake).length > 0;
  const plainNotes = !hasIntake && lead.notes;

  return (
    <>
      <div className="lead-drawer-header">
        <div className="lead-drawer-title">
          <div className="lead-avatar" style={{width:32,height:32,fontSize:14}}>{lead.name.charAt(0).toUpperCase()}</div>
          <div>
            <span className="lead-drawer-name">{lead.name}</span>
            <span className="lead-drawer-sub">Full intake profile</span>
          </div>
        </div>
        <button className="lead-drawer-close" onClick={onClose} type="button">✕</button>
      </div>

      {hasIntake ? (
        <div className="lead-drawer-body">
          {INTAKE_SECTIONS.map(section => {
            const items = section.fields
              .map(f => ({ label: f, value: intake[f] }))
              .filter(i => i.value);
            if (!items.length) return null;
            return (
              <div key={section.title} className="lead-drawer-section">
                <div className="lead-drawer-section-title">
                  <span>{section.icon}</span> {section.title}
                </div>
                <div className="lead-drawer-grid">
                  {items.map(({ label, value }) => (
                    <div key={label} className="lead-drawer-field">
                      <span className="lead-drawer-field-label">{label}</span>
                      <span className="lead-drawer-field-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {(() => {
            const knownFields = INTAKE_SECTIONS.flatMap(s => s.fields);
            const extras = Object.entries(intake).filter(([k]) => !knownFields.includes(k));
            if (!extras.length) return null;
            return (
              <div className="lead-drawer-section">
                <div className="lead-drawer-section-title"><span>📝</span> Other</div>
                <div className="lead-drawer-grid">
                  {extras.map(([label, value]) => (
                    <div key={label} className="lead-drawer-field">
                      <span className="lead-drawer-field-label">{label}</span>
                      <span className="lead-drawer-field-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      ) : plainNotes ? (
        <div className="lead-drawer-body">
          <div className="lead-drawer-section">
            <div className="lead-drawer-section-title"><span>📝</span> Notes</div>
            <p className="lead-drawer-plain-notes">{plainNotes}</p>
          </div>
        </div>
      ) : (
        <div className="lead-drawer-empty">
          <span>No intake data available for this lead.</span>
        </div>
      )}
    </>
  );
}

function LeadDrawer({ lead, onClose }) {
  return (
    <tr className="lead-drawer-row">
      <td colSpan={9} className="lead-drawer-td">
        <div className="lead-drawer">
          <LeadDrawerContent lead={lead} onClose={onClose} />
        </div>
      </td>
    </tr>
  );
}


// ── Main LeadsPage ────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const location = useLocation();

  // Auto-open add modal when navigated from Dashboard "Add Lead" button
  useEffect(() => {
    if (location.state?.openModal) {
      setEditLead(null);
      setModalOpen(true);
      // Clear state so refresh doesn't re-open
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const [leads, setLeads]               = useState([]);
  const [stats, setStats]               = useState({});
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [searchInput, setSearchInput]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [scoreSort, setScoreSort]       = useState('none');
  const [modalOpen, setModalOpen]       = useState(false);
  const [editLead, setEditLead]         = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedLead, setExpandedLead]   = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort: '-createdAt' };
      if (statusFilter !== 'all')  params.status   = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (search)                   params.search   = search;
      if (scoreSort !== 'none')     params.scoreSort = scoreSort;
      const { data } = await API.get('/leads', { params });
      setLeads(data.leads || []);
      setStats(data.stats || {});
    } catch { toast.error('Failed to fetch leads'); }
    finally { setLoading(false); }
  }, [statusFilter, priorityFilter, search, scoreSort]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleSave = async (form) => {
    try {
      if (editLead) {
        const { data } = await API.put(`/leads/${editLead._id}`, form);
        setLeads(prev => prev.map(l => l._id === editLead._id ? data.lead : l));
        toast.success('Lead updated');
      } else {
        const { data } = await API.post('/leads', form);
        setLeads(prev => [data.lead, ...prev]);
        toast.success('Lead added');
      }
      setModalOpen(false);
      fetchLeads(); // refresh stats
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save lead'); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/leads/${id}`);
      setLeads(prev => prev.filter(l => l._id !== id));
      setDeleteConfirm(null);
      toast.success('Lead deleted');
      fetchLeads();
    } catch { toast.error('Failed to delete lead'); }
  };

  // ─── FIXED status update — optimistic + re-fetch ───
  const handleQuickStatus = async (lead, newStatus) => {
    // Optimistic update immediately
    setLeads(prev => prev.map(l => l._id === lead._id ? { ...l, status: newStatus } : l));
    try {
      const { data } = await API.put(`/leads/${lead._id}`, { status: newStatus });
      // Sync with server response
      setLeads(prev => prev.map(l => l._id === lead._id ? data.lead : l));
      toast.success(`Status → ${newStatus}`);
      // Refresh stats bar
      const statsRes = await API.get('/leads', { params: { sort: '-createdAt', status: statusFilter !== 'all' ? statusFilter : undefined } });
      setStats(statsRes.data.stats || {});
    } catch {
      // Rollback on failure
      setLeads(prev => prev.map(l => l._id === lead._id ? { ...l, status: lead.status } : l));
      toast.error('Failed to update status');
    }
  };

  // Score a single lead
  const handleScoreLead = async (leadId) => {
    try {
      const { data } = await API.post(`/ai/score-lead/${leadId}`);
      setLeads(prev => prev.map(l => l._id === leadId ? { ...l, aiScore: data.score, aiScoreReason: data.reason } : l));
      toast.success(`Score: ${data.score}/100`);
    } catch (err) { toast.error(err.response?.data?.message || 'Scoring failed'); }
  };

  // Score all leads
  const handleScoreAll = async () => {
    const t = toast.loading('Scoring all leads…');
    try {
      await API.post('/ai/score-all');
      await fetchLeads();
      toast.success('All leads scored!', { id: t });
    } catch { toast.error('Bulk scoring failed', { id: t }); }
  };

  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="leads-page">
      {/* Header */}
      <div className="leads-header">
        <div>
          <h1 className="leads-title">Leads</h1>
          <p className="leads-sub">{total} total leads in your pipeline</p>
        </div>
        <div className="leads-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleScoreAll} title="Score all leads with AI">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            AI Score All
          </button>
          <button className="btn btn-primary" onClick={() => { setEditLead(null); setModalOpen(true); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Lead
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="status-tabs">
        {STATUS_FILTERS.map(s => (
          <button key={s} className={`status-tab ${statusFilter === s ? 'status-tab-active' : ''}`}
            onClick={() => setStatusFilter(s)}>
            {s === 'all' ? `All (${total})` : `${s.charAt(0).toUpperCase()+s.slice(1)} (${stats[s] || 0})`}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="leads-controls">
        <div className="search-box">
          <SearchIcon />
          <input className="search-input" value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by name, email, phone…" />
          {searchInput && <button className="search-clear" onClick={() => { setSearchInput(''); setSearch(''); }}>✕</button>}
        </div>
        <select className="filter-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="filter-select" value={scoreSort} onChange={e => setScoreSort(e.target.value)}>
          <option value="none">Sort by Date</option>
          <option value="desc">Score: High→Low</option>
          <option value="asc">Score: Low→High</option>
        </select>
      </div>

      {/* Table */}
      <div className="leads-table-wrap">
        {loading ? (
          <div className="leads-loading"><div className="spinner" style={{width:28,height:28}}/><span>Loading leads…</span></div>
        ) : leads.length === 0 ? (
          <div className="leads-empty">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <h3>No leads yet</h3>
            <p>Share your form link or add leads manually</p>
            <button className="btn btn-primary" onClick={() => { setEditLead(null); setModalOpen(true); }}>+ Add your first lead</button>
          </div>
        ) : (
          <table className="leads-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Contact</th>
                <th>Goal</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Source</th>
                <th>
                  <div className="th-score">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    AI Score
                  </div>
                </th>
                <th>Added</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <React.Fragment key={lead._id}>
                <tr
                  className={`lead-row ${expandedLead === lead._id ? 'lead-row-expanded' : ''}`}
                  onClick={() => setExpandedLead(prev => prev === lead._id ? null : lead._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div className="lead-name-cell">
                      <div className="lead-avatar">{lead.name.charAt(0).toUpperCase()}</div>
                      <span className="lead-name">{lead.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="lead-contact">
                      {lead.email && <span>{lead.email}</span>}
                      {lead.phone && <span className="lead-phone">{lead.phone}</span>}
                      {!lead.email && !lead.phone && <span className="lead-no-contact">—</span>}
                    </div>
                  </td>
                  <td>
                    <span className="lead-goal" title={lead.goal}>
                      {lead.goal ? (lead.goal.length > 28 ? lead.goal.slice(0,28)+'…' : lead.goal) : '—'}
                    </span>
                  </td>
                  <td><StatusDropdown lead={lead} onStatusChange={handleQuickStatus} /></td>
                  <td>
                    <span className={`priority-badge priority-${lead.priority}`}>
                      {lead.priority.toUpperCase()}
                    </span>
                  </td>
                  <td><SourceBadge source={lead.source} /></td>
                  <td>
                    <ScoreChip
                      score={lead.aiScore ?? null}
                      reason={lead.aiScoreReason}
                      leadId={lead._id}
                      onScore={handleScoreLead}
                    />
                  </td>
                  <td>
                    <span className="lead-date">
                      {new Date(lead.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'})}
                    </span>
                  </td>
                  <td>
                    <div className="lead-actions">
                      {lead.phone && (
                        <a href={`https://wa.me/${(lead.phone||'').replace(/\D/g,'').replace(/^(?!91)/,'91')}?text=${encodeURIComponent(`Hi ${lead.name}, this is regarding your fitness journey. Let me know how I can help!`)}`} target="_blank" rel="noopener noreferrer" className="lead-action-btn" title="WhatsApp" onClick={e=>e.stopPropagation()} style={{color:'#25D366'}}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.624-1.475A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.586-5.934-1.606l-.425-.253-2.742.876.876-2.712-.278-.44A9.8 9.8 0 0 1 2.182 12c0-5.423 4.395-9.818 9.818-9.818S21.818 6.577 21.818 12s-4.395 9.818-9.818 9.818z"/></svg>
                        </a>
                      )}
                      <button className="lead-action-btn lead-edit-btn" onClick={(e) => { e.stopPropagation(); setEditLead(lead); setModalOpen(true); }} title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="lead-action-btn lead-delete-btn" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(lead._id); }} title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedLead === lead._id && (
                  <LeadDrawer lead={lead} onClose={() => setExpandedLead(null)} />
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="delete-confirm-card" onClick={e => e.stopPropagation()}>
            <div className="delete-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </div>
            <h3>Delete lead?</h3>
            <p>This action cannot be undone.</p>
            <div className="delete-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <LeadModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditLead(null); }}
        onSave={handleSave} lead={editLead} />
    </div>
  );
}