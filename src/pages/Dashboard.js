import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './Dashboard.css';
import LogoIcon from '../assets/LogoIcon';

const DEFAULT_PHOTOS = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=75',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=700&q=75',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=75',
];

const StatCard = ({ label, value, color, icon }) => (
  <div className="stat-card" style={{ '--stat-color': color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]           = useState({ new:0, contacted:0, qualified:0, closed:0, lost:0 });
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [copied, setCopied]         = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [aiSummary, setAiSummary]   = useState(null);

  const photos = user?.photos?.length > 0 ? user.photos : DEFAULT_PHOTOS;

  // Use slug-based URL if available
  const formIdentifier = user?.slug || user?.id;
  const formLink = `${window.location.origin}/form/${formIdentifier}`;

  // Auto-cycle photos — no manual control on dashboard
  useEffect(() => {
    const t = setInterval(() => setActivePhoto(p => (p + 1) % photos.length), 4500);
    return () => clearInterval(t);
  }, [photos.length]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [leadsRes, insightsRes] = await Promise.allSettled([
        API.get('/leads?limit=5&sort=-createdAt'),
        API.get('/ai/insights'),
      ]);
      if (leadsRes.status === 'fulfilled') {
        setStats(leadsRes.value.data.stats || {});
        setRecentLeads(leadsRes.value.data.leads || []);
      }
      if (insightsRes.status === 'fulfilled') {
        setAiSummary(insightsRes.value.data);
      }
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const copyLink = () => {
    // Fallback for non-HTTPS contexts
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(formLink).then(() => {
        setCopied(true);
        toast.success('Link copied!');
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    const textarea = document.createElement('textarea');
    textarea.value = formLink;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
    document.body.removeChild(textarea);
  };

  const total = Object.values(stats).reduce((a,b) => a+b, 0);
  const convRate = total > 0 ? Math.round((stats.closed/total)*100) : 0;

  const statusConfig = {
    new:       { label:'New',       color:'#e8ff47' },
    contacted: { label:'Contacted', color:'#47b4ff' },
    qualified: { label:'Qualified', color:'#a47fff' },
    closed:    { label:'Closed',    color:'#47ffa4' },
    lost:      { label:'Lost',      color:'#ff6b6b' },
  };

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dashboard">
      {/* ── Hero — full-width auto-cycling vertical photo ── */}
      <div className="coach-hero">
        <div className="coach-hero-photo">
          {photos.map((src, i) => (
            <div
              key={i}
              className={`coach-hero-layer ${i === activePhoto ? 'coach-hero-layer-active' : ''}`}
              style={{ backgroundImage:`url(${src})` }}
            />
          ))}
          <div className="coach-hero-overlay" />
          <div className="coach-hero-top-badges">
            <div className="coach-hero-status">
              <span className="coach-status-dot" />Active
            </div>
          </div>
        </div>
        <div className="coach-info-below">
          <div className="coach-greeting">{greeting}</div>
          <h1 className="coach-name">{user?.name}</h1>
          {user?.businessName && <div className="coach-biz">{user.businessName}</div>}
          {user?.tagline && <p className="coach-tagline">"{user.tagline}"</p>}
          <div className="coach-divider" />
          <div className="coach-stats-mini">
            <div className="coach-mini-stat"><span className="coach-mini-val">{total}</span><span className="coach-mini-lbl">Leads</span></div>
            <div className="coach-mini-sep"/>
            <div className="coach-mini-stat"><span className="coach-mini-val">{stats.new||0}</span><span className="coach-mini-lbl">New</span></div>
            <div className="coach-mini-sep"/>
            <div className="coach-mini-stat"><span className="coach-mini-val">{convRate}%</span><span className="coach-mini-lbl">Conversion</span></div>
          </div>

          {/* Slug form link */}
          <div className="coach-link-section">
            <div className="coach-link-label">
              Your lead capture page
              {user?.slug && <span className="coach-slug-badge">/{user.slug}</span>}
            </div>
            <div className="coach-link-row">
              <div className="coach-link-box"><span className="coach-link-text">{formLink}</span></div>
              <button className="btn btn-primary btn-sm" onClick={copyLink}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{marginTop:12,justifyContent:'center',display:'flex'}}
            onClick={() => navigate('/leads', { state: { openModal: true } })}
          >+ Add Lead</button>
          <Link to="/ai" className="btn btn-ghost" style={{marginTop:8,justifyContent:'center',display:'flex',fontSize:13}}>
            ✨ Open AI Center
          </Link>

          <div className="coach-powered">
            <LogoIcon size={16} />
            <span><strong>COACH</strong>FLOW AI</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading"><div className="spinner" style={{width:28,height:28}}/><span>Loading…</span></div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard label="Total Leads" value={total} color="#e8ff47" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
            <StatCard label="New"        value={stats.new||0}       color="#e8ff47" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}/>
            <StatCard label="Contacted"  value={stats.contacted||0} color="#47b4ff" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.08 6.08l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>}/>
            <StatCard label="Qualified"  value={stats.qualified||0} color="#a47fff" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}/>
            <StatCard label="Closed"     value={stats.closed||0}    color="#47ffa4" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}/>
            <StatCard label="Conversion" value={`${convRate}%`}      color="#a47fff" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>}/>
          </div>

          {/* AI Quick Insights snippet */}
          {aiSummary?.insights?.length > 0 && (
            <div className="dashboard-ai-teaser card">
              <div className="section-header">
                <h3 className="section-title">✨ AI Insight of the Day</h3>
                <Link to="/ai" className="btn btn-ghost btn-sm">Full AI Center →</Link>
              </div>
              <div className="ai-teaser-insight">
                <div className="ai-teaser-num">01</div>
                <p>{aiSummary.insights[0]}</p>
              </div>
            </div>
          )}

          <div className="dashboard-row">
            {/* Pipeline */}
            <div className="pipeline-card card">
              <h3 className="section-title">Pipeline Overview</h3>
              <div className="pipeline-bars">
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <div key={key} className="pipeline-row">
                    <div className="pipeline-label">
                      <span className="pipeline-dot" style={{background:cfg.color}}/>
                      <span>{cfg.label}</span>
                    </div>
                    <div className="pipeline-track">
                      <div className="pipeline-fill" style={{
                        width: total > 0 ? `${((stats[key]||0)/total)*100}%` : '0%',
                        background: cfg.color,
                      }}/>
                    </div>
                    <span className="pipeline-count">{stats[key]||0}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent leads */}
            <div className="recent-leads card">
              <div className="section-header">
                <h3 className="section-title">Recent Leads</h3>
                <Link to="/leads" className="btn btn-ghost btn-sm">View all</Link>
              </div>
              {recentLeads.length === 0 ? (
                <div className="empty-state">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  <p>No leads yet. Share your link!</p>
                </div>
              ) : (
                <div className="recent-list">
                  {recentLeads.map(lead => (
                    <div key={lead._id} className="recent-item">
                      <div className="recent-avatar">{lead.name.charAt(0).toUpperCase()}</div>
                      <div className="recent-info">
                        <div className="recent-name">{lead.name}</div>
                        <div className="recent-contact">{lead.email || lead.phone || '—'}</div>
                      </div>
                      <div className="recent-right">
                        <span className={`badge badge-${lead.status}`}>{lead.status}</span>
                        {lead.aiScore !== null && lead.aiScore !== undefined && (
                          <span className="recent-score" style={{color: lead.aiScore>=75?'#47ffa4':lead.aiScore>=50?'#e8ff47':'#ff9f47'}}>
                            ★{lead.aiScore}
                          </span>
                        )}
                      </div>
                      <div className="recent-date">
                        {new Date(lead.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
