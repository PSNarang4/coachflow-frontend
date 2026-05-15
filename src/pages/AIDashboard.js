import React, { useState, useEffect, useRef } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './AIDashboard.css';

// ── AI Sales Assistant ────────────────────────────────────────────────────────
function SalesAssistant() {
  const [leads, setLeads]               = useState([]);
  const [selectedLead, setSelectedLead] = useState('');
  const [message, setMessage]           = useState('');
  const [tone, setTone]                 = useState('friendly');
  const [reply, setReply]               = useState('');
  const [loading, setLoading]           = useState(false);
  const replyRef = useRef(null);

  useEffect(() => {
    API.get('/leads?limit=30&sort=-createdAt')
      .then(({ data }) => setLeads(data.leads || []))
      .catch(() => {});
  }, []);

  const generate = async () => {
    if (!selectedLead) { toast.error('Select a lead first'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/ai/generate-reply', {
        leadId: selectedLead,
        userMessage: message.trim(),
        tone,
      });
      setReply(data.reply);
      setTimeout(() => replyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed. Check your Gemini API key.');
    } finally { setLoading(false); }
  };

  const copyReply = () => { navigator.clipboard.writeText(reply); toast.success('Message copied!'); };

  const tones = [
    { key: 'friendly',   label: 'Friendly',  desc: 'Warm & personal',      color: '#47b4ff' },
    { key: 'premium',    label: 'Premium',   desc: 'Polished & confident',  color: '#a47fff' },
    { key: 'aggressive', label: 'Closer',    desc: 'Bold & urgent',         color: '#ff9f47' },
  ];

  const lead = leads.find(l => l._id === selectedLead);

  return (
    <div className="ai-module">
      <div className="ai-module-header">
        <div className="ai-module-badge">AI SALES ASSISTANT</div>
        <h2>Generate Personalized Replies</h2>
        <p>AI crafts highly personalized WhatsApp messages based on lead goals, objections &amp; context</p>
      </div>

      <div className="ai-closer-layout">
        <div className="ai-closer-controls">
          <div className="form-group">
            <label className="form-label">Select Lead</label>
            <select className="form-input" value={selectedLead} onChange={e => setSelectedLead(e.target.value)}>
              <option value="">Choose a lead…</option>
              {leads.map(l => (
                <option key={l._id} value={l._id}>{l.name} — {l.goal || 'No goal set'}</option>
              ))}
            </select>
          </div>

          {lead && (
            <div className="lead-context-chip">
              <div className="lc-row"><span className="lc-label">Goal</span><span className="lc-val">{lead.goal || '—'}</span></div>
              <div className="lc-row"><span className="lc-label">Status</span><span className={`badge badge-${lead.status}`} style={{fontSize:10,padding:'2px 8px'}}>{lead.status}</span></div>
              <div className="lc-row"><span className="lc-label">Source</span><span className="lc-val">{lead.source}</span></div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Their last message (optional)</label>
            <textarea className="form-textarea" rows={3} value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="e.g. 'This seems expensive, I'm not sure…'" />
            <span className="ai-field-hint">Include price objections for specialized handling</span>
          </div>

          <div className="form-group">
            <label className="form-label">Reply Tone</label>
            <div className="tone-selector">
              {tones.map(t => (
                <button key={t.key} type="button"
                  className={`tone-btn ${tone === t.key ? 'tone-btn-active' : ''}`}
                  style={{ '--tone-color': t.color }}
                  onClick={() => setTone(t.key)}>
                  <span className="tone-label">{t.label}</span>
                  <span className="tone-desc">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary ai-generate-btn" onClick={generate} disabled={loading || !selectedLead}>
            {loading ? <><span className="spinner" /> Generating reply…</> : '✨ Generate Reply'}
          </button>
        </div>

        <div className="ai-closer-output">
          {!reply && !loading && (
            <div className="ai-output-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
                strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.2}}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p>Your personalized reply will appear here</p>
            </div>
          )}
          {loading && (
            <div className="ai-output-loading">
              <div className="ai-typing-dots"><span/><span/><span/></div>
              <p>Crafting your perfect reply…</p>
            </div>
          )}
          {reply && !loading && (
            <div className="ai-reply-output" ref={replyRef}>
              <div className="ai-reply-header">
                <div className="ai-reply-tag">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  AI Generated · {tone}
                </div>
              </div>
              <p className="ai-reply-text">{reply}</p>
              <div className="ai-reply-actions">
                <button className="btn btn-primary btn-sm" onClick={copyReply}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy Message
                </button>
                <button className="btn btn-ghost btn-sm" onClick={generate}>Regenerate</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── AI Insights Dashboard ─────────────────────────────────────────────────────
// SAFE DEFAULTS — prevents "Cannot read properties of undefined" crash
const EMPTY_STATS = {
  total:          0,
  closed:         0,
  lost:           0,
  convRate:       0,
  lostRate:       0,
  bestConvSource: 'N/A',
  topSource:      'N/A',
  peakHourLabel:  'N/A',
  topGoal:        'N/A',
  sourceMap:      {},
  goalMap:        {},
};

function InsightsDashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const { data: d } = await API.get('/ai/insights');
      // Merge real data over safe defaults — if stats is missing/undefined, use EMPTY_STATS
      setData({
        insights: Array.isArray(d.insights) ? d.insights : [],
        summary:  typeof d.summary === 'string' ? d.summary : '',
        stats:    { ...EMPTY_STATS, ...(d.stats || {}) },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load insights');
      // Set empty data so page doesn't stay as blank loader
      setData({ insights: [], summary: '', stats: { ...EMPTY_STATS } });
    } finally { setLoading(false); }
  };

  useEffect(() => { loadInsights(); }, []);

  const StatBlock = ({ label, value, sub, color }) => (
    <div className="ai-stat-block" style={{ '--sb-color': color }}>
      <div className="ai-stat-value" style={{ color }}>{value != null ? value : '—'}</div>
      <div className="ai-stat-label">{label}</div>
      {sub && <div className="ai-stat-sub">{sub}</div>}
    </div>
  );

  const SourceBar = ({ label, count, total, color }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
      <div className="ai-src-row">
        <div className="ai-src-name">{label}</div>
        <div className="ai-src-track">
          <div className="ai-src-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
        <div className="ai-src-count">{count}</div>
        <div className="ai-src-pct" style={{ color }}>{pct}%</div>
      </div>
    );
  };

  const srcColors = {
    form: '#47b4ff', manual: '#a47fff', referral: '#47ffa4', social: '#ff9f47', other: '#888',
  };

  // Safe reference — always an object with numeric fields
  const s = data?.stats || EMPTY_STATS;

  return (
    <div className="ai-module">
      <div className="ai-module-header">
        <div className="ai-module-badge">AI INSIGHTS</div>
        <h2>Business Intelligence</h2>
        <p>AI analyzes your pipeline and surfaces the insights that matter most to your revenue</p>
      </div>

      {/* Loading state */}
      {loading && !data && (
        <div className="ai-insights-loading">
          <div className="spinner" style={{width:32,height:32}}/>
          <p>Analyzing your pipeline…</p>
        </div>
      )}

      {/* Empty state — zero leads */}
      {data && s.total === 0 && (
        <div className="ai-empty-state">
          <div className="ai-empty-icon">📊</div>
          <h3>No data yet</h3>
          <p>Add your first leads to unlock AI business insights and recommendations.</p>
        </div>
      )}

      {/* Main content — only renders when total > 0 */}
      {data && s.total > 0 && (
        <>
          {/* Stats grid */}
          <div className="ai-stats-grid">
            <StatBlock label="Total Leads" value={s.total}              color="#e8ff47" />
            <StatBlock label="Conversion"  value={`${s.convRate}%`}     color="#47ffa4" sub={`${s.closed} closed`} />
            <StatBlock label="Lost Rate"   value={`${s.lostRate}%`}     color={s.lostRate > 30 ? '#ff6b6b' : '#888'} />
            <StatBlock label="Best Source" value={s.bestConvSource}     color="#47b4ff" sub="most conversions" />
            <StatBlock label="Peak Hour"   value={s.peakHourLabel}      color="#a47fff" sub="most leads arrive" />
            <StatBlock label="Top Goal"    value={s.topGoal !== 'N/A' ? s.topGoal : '—'} color="#ff9f47" sub="most requested" />
          </div>

          {/* AI Recommendations */}
          {data.insights.length > 0 && (
            <div className="ai-insights-section">
              <div className="ai-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                AI Recommendations
              </div>
              <div className="ai-insights-list">
                {data.insights.map((insight, i) => (
                  <div key={i} className="ai-insight-card">
                    <div className="ai-insight-num">0{i + 1}</div>
                    <p>{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source breakdown */}
          {Object.keys(s.sourceMap).length > 0 && (
            <div className="ai-source-section">
              <div className="ai-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                Lead Source Breakdown
              </div>
              <div className="ai-source-bars">
                {Object.entries(s.sourceMap)
                  .sort((a, b) => b[1] - a[1])
                  .map(([src, cnt]) => (
                    <SourceBar key={src}
                      label={src.charAt(0).toUpperCase() + src.slice(1)}
                      count={cnt} total={s.total}
                      color={srcColors[src] || '#888'} />
                  ))}
              </div>
            </div>
          )}

          {/* Pipeline summary */}
          {data.summary && (
            <div className="ai-summary-card">
              <div className="ai-summary-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div className="ai-summary-label">Pipeline Summary</div>
                <div className="ai-summary-text">{data.summary}</div>
              </div>
              <button className="btn btn-ghost btn-sm ai-refresh-btn" onClick={loadInsights} disabled={loading}>
                {loading ? <span className="spinner" style={{width:14,height:14}}/> : '↻ Refresh'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Refresh button always visible once data loaded */}
      {data && !loading && s.total > 0 && (
        <div style={{ textAlign: 'right', marginTop: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={loadInsights}>↻ Refresh insights</button>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AIDashboard() {
  const [tab, setTab] = useState('insights');

  const tabs = [
    { key: 'insights',  label: '📊 Insights',       desc: 'Business intelligence' },
    { key: 'assistant', label: '💬 Sales Assistant', desc: 'Personalized replies'  },
  ];

  return (
    <div className="ai-dashboard">
      <div className="ai-dashboard-header">
        <div className="ai-dashboard-badge">✨ COACHFLOW AI</div>
        <h1>AI Intelligence Center</h1>
        <p>Your AI-powered business partner — revenue insights, personalized messaging, and more</p>
      </div>

      <div className="ai-tab-bar">
        {tabs.map(t => (
          <button key={t.key}
            className={`ai-tab ${tab === t.key ? 'ai-tab-active' : ''}`}
            onClick={() => setTab(t.key)}>
            <span className="ai-tab-label">{t.label}</span>
            <span className="ai-tab-desc">{t.desc}</span>
          </button>
        ))}
      </div>

      <div className="ai-tab-content">
        {tab === 'insights'  && <InsightsDashboard />}
        {tab === 'assistant' && <SalesAssistant />}
      </div>
    </div>
  );
}
