import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './MembersPage.css';

const TABS = ['all','active','expiring','expired'];
const PLANS = ['1 Month','3 Months','6 Months','Annual','Custom'];
const METHODS = ['cash','upi','card','bank','other'];

function MemberModal({ isOpen, onClose, onSave, member, leads }) {
  const [form, setForm] = useState({
    clientName:'', clientEmail:'', clientPhone:'', leadId:'',
    planName:'1 Month', planDuration:30, planAmount:'',
    startDate: new Date().toISOString().slice(0,10),
    endDate: new Date(Date.now()+30*86400000).toISOString().slice(0,10),
    paymentAmount:'', paymentMethod:'cash', paymentNote:'', notes:'',
  });

  useEffect(() => {
    if (member) {
      setForm({
        clientName: member.clientName||'', clientEmail: member.clientEmail||'',
        clientPhone: member.clientPhone||'', leadId: member.lead||'',
        planName: member.plan?.name||'1 Month', planDuration: member.plan?.duration||30,
        planAmount: member.plan?.amount||'',
        startDate: member.startDate ? new Date(member.startDate).toISOString().slice(0,10) : '',
        endDate: member.endDate ? new Date(member.endDate).toISOString().slice(0,10) : '',
        paymentAmount:'', paymentMethod:'cash', paymentNote:'', notes: member.notes||'',
      });
    } else {
      setForm(f => ({ ...f, clientName:'', clientEmail:'', clientPhone:'', leadId:'', planAmount:'', notes:'' }));
    }
  }, [member, isOpen]);

  const handlePlanChange = (name) => {
    const durations = { '1 Month':30, '3 Months':90, '6 Months':180, 'Annual':365, 'Custom':30 };
    const d = durations[name]||30;
    const end = new Date(new Date(form.startDate).getTime() + d*86400000).toISOString().slice(0,10);
    setForm(f => ({ ...f, planName:name, planDuration:d, endDate:end }));
  };

  const handleStartChange = (val) => {
    const end = new Date(new Date(val).getTime() + form.planDuration*86400000).toISOString().slice(0,10);
    setForm(f => ({ ...f, startDate:val, endDate:end }));
  };

  const handleLeadSelect = (leadId) => {
    if (!leadId) return setForm(f => ({ ...f, leadId:'' }));
    const lead = leads?.find(l => l._id === leadId);
    if (lead) {
      setForm(f => ({ ...f, leadId, clientName:lead.name||f.clientName, clientEmail:lead.email||f.clientEmail, clientPhone:lead.phone||f.clientPhone }));
    }
  };

  const handleSubmit = () => {
    if (!form.clientName) { toast.error('Client name is required'); return; }
    if (!form.startDate || !form.endDate) { toast.error('Start and end dates are required'); return; }
    const payAmt = Number(form.paymentAmount) || Number(form.planAmount) || 0;
    const payload = {
      leadId: form.leadId||null, clientName:form.clientName, clientEmail:form.clientEmail, clientPhone:form.clientPhone,
      plan: { name:form.planName, duration:form.planDuration, amount:Number(form.planAmount)||0 },
      startDate:form.startDate, endDate:form.endDate, notes:form.notes,
      payments: payAmt > 0 ? [{ amount:payAmt, method:form.paymentMethod, note:form.paymentNote||'Initial payment' }] : [],
    };
    onSave(payload);
  };

  if (!isOpen) return null;
  return (
    <div className="m-modal-backdrop" onClick={onClose}>
      <motion.div className="m-modal" onClick={e=>e.stopPropagation()} initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95}} transition={{duration:0.3}}>
        <div className="m-modal-header">
          <div className="m-modal-title">{member ? 'Edit Membership' : 'New Membership'}</div>
          <button className="m-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="m-modal-body">
          {!member && leads?.length > 0 && (
            <div className="m-field">
              <label>Link to Lead (Optional)</label>
              <select value={form.leadId} onChange={e=>handleLeadSelect(e.target.value)}>
                <option value="">— Select a closed lead —</option>
                {leads.filter(l=>l.status==='closed').map(l=><option key={l._id} value={l._id}>{l.name} ({l.email||l.phone||'no contact'})</option>)}
              </select>
            </div>
          )}
          <div className="m-field"><label>Client Name *</label><input value={form.clientName} onChange={e=>setForm(f=>({...f,clientName:e.target.value}))} placeholder="Full name" /></div>
          <div className="m-field-row">
            <div className="m-field"><label>Email</label><input type="email" value={form.clientEmail} onChange={e=>setForm(f=>({...f,clientEmail:e.target.value}))} placeholder="email@example.com" /></div>
            <div className="m-field"><label>Phone</label><input value={form.clientPhone} onChange={e=>setForm(f=>({...f,clientPhone:e.target.value}))} placeholder="+91 98765 43210" /></div>
          </div>
          <div className="m-field-row">
            <div className="m-field"><label>Plan</label><select value={form.planName} onChange={e=>handlePlanChange(e.target.value)}>{PLANS.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
            <div className="m-field"><label>Amount (₹)</label><input type="number" inputMode="decimal" value={form.planAmount} onChange={e=>setForm(f=>({...f,planAmount:e.target.value}))} placeholder="0" /></div>
          </div>
          <div className="m-field-row">
            <div className="m-field"><label>Start Date</label><input type="date" value={form.startDate} onChange={e=>handleStartChange(e.target.value)} /></div>
            <div className="m-field"><label>End Date</label><input type="date" value={form.endDate} onChange={e=>setForm(f=>({...f,endDate:e.target.value}))} /></div>
          </div>
          {!member && (
            <>
              <div style={{height:1,background:'var(--border)',margin:'4px 0'}} />
              <div className="m-field-row">
                <div className="m-field"><label>Payment Amount (₹)</label><input type="number" inputMode="decimal" value={form.paymentAmount} onChange={e=>setForm(f=>({...f,paymentAmount:e.target.value}))} placeholder="0" /></div>
                <div className="m-field"><label>Payment Method</label><select value={form.paymentMethod} onChange={e=>setForm(f=>({...f,paymentMethod:e.target.value}))}>{METHODS.map(m=><option key={m} value={m}>{m.toUpperCase()}</option>)}</select></div>
              </div>
            </>
          )}
          <div className="m-field"><label>Notes</label><textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Any notes about this membership..." /></div>
        </div>
        <div className="m-modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{member ? 'Update' : 'Create Membership'}</button>
        </div>
      </motion.div>
    </div>
  );
}

function RenewModal({ isOpen, onClose, onRenew, member }) {
  const [plan, setPlan] = useState('1 Month');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const startDate = new Date().toISOString().slice(0,10);
  const durations = { '1 Month':30, '3 Months':90, '6 Months':180, 'Annual':365 };
  const endDate = new Date(Date.now()+(durations[plan]||30)*86400000).toISOString().slice(0,10);

  if (!isOpen || !member) return null;
  return (
    <div className="m-modal-backdrop" onClick={onClose}>
      <motion.div className="m-modal" onClick={e=>e.stopPropagation()} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{duration:0.25}}>
        <div className="m-modal-header"><div className="m-modal-title">Renew — {member.clientName}</div><button className="m-modal-close" onClick={onClose}>✕</button></div>
        <div className="m-modal-body">
          <div className="m-field-row">
            <div className="m-field"><label>New Plan</label><select value={plan} onChange={e=>setPlan(e.target.value)}>{Object.keys(durations).map(p=><option key={p}>{p}</option>)}</select></div>
            <div className="m-field"><label>Amount (₹)</label><input type="number" inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0" /></div>
          </div>
          <div className="m-field-row">
            <div className="m-field"><label>Start</label><input type="date" value={startDate} readOnly /></div>
            <div className="m-field"><label>End</label><input type="date" value={endDate} readOnly /></div>
          </div>
          <div className="m-field"><label>Payment Method</label><select value={method} onChange={e=>setMethod(e.target.value)}>{METHODS.map(m=><option key={m}>{m.toUpperCase()}</option>)}</select></div>
        </div>
        <div className="m-modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>onRenew({ plan:{name:plan,duration:durations[plan],amount:Number(amount)||0}, startDate, endDate, payment:{amount:Number(amount)||0,method,note:'Renewal'} })}>Renew Membership</button>
        </div>
      </motion.div>
    </div>
  );
}

function AttendanceCalendarModal({ isOpen, onClose, member, onDone }) {
  const [records, setRecords] = useState([]);
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isOpen && member) {
      API.get(`/membership/${member._id}/attendance`).then(r => {
        setRecords(r.data.records || []);
      }).catch(() => {});
      setSelectedDate(null);
    }
  }, [isOpen, member]);

  const getRecord = (dateStr) => records.find(r => r.date === dateStr);

  const handleMark = async (status) => {
    if (!selectedDate || busy) return;
    setBusy(true);
    try {
      const res = await API.put(`/membership/${member._id}/attendance`, { date: selectedDate, status });
      setRecords(res.data.records || []);
      if (status === 'clear') toast.success('Cleared');
      else toast.success(status === 'present' ? 'Marked Present ✓' : 'Marked Absent ✗');
      setSelectedDate(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setBusy(false); }
  };

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const today = new Date().toISOString().slice(0, 10);
  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;

  const prevMonth = () => { setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)); setSelectedDate(null); };
  const nextMonth = () => { setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)); setSelectedDate(null); };

  if (!isOpen || !member) return null;
  const selectedRec = selectedDate ? getRecord(selectedDate) : null;

  return (
    <div className="m-modal-backdrop" onClick={() => { onDone(); onClose(); }}>
      <motion.div className="m-modal att-modal" onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}>
        <div className="m-modal-header">
          <div className="m-modal-title">📅 {member.clientName}</div>
          <button className="m-modal-close" onClick={() => { onDone(); onClose(); }}>✕</button>
        </div>
        <div className="m-modal-body" style={{ padding: '16px 20px' }}>
          <div className="att-stats">
            <span className="att-stat att-stat-present">✓ {present}</span>
            <span className="att-stat att-stat-absent">✗ {absent}</span>
            <span className="att-stat">{records.length} days</span>
          </div>
          <div className="att-month-nav">
            <button onClick={prevMonth} className="att-nav-btn">‹</button>
            <span className="att-month-label">{month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
            <button onClick={nextMonth} className="att-nav-btn">›</button>
          </div>
          <div className="att-cal">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="att-day-header">{d}</div>)}
            {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} className="att-day-empty" />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const rec = getRecord(dateStr);
              const isToday = dateStr === today;
              const isFuture = dateStr > today;
              const isSelected = dateStr === selectedDate;
              return (
                <div key={day}
                  className={`att-day ${rec ? 'att-day-'+rec.status : ''} ${isToday ? 'att-day-today' : ''} ${isFuture ? 'att-day-future' : ''} ${isSelected ? 'att-day-selected' : ''}`}
                  onClick={() => !isFuture && setSelectedDate(isSelected ? null : dateStr)}>
                  <span className="att-day-num">{day}</span>
                  {rec && <span className="att-day-icon">{rec.status === 'present' ? '✓' : '✗'}</span>}
                </div>
              );
            })}
          </div>
          {selectedDate && (
            <motion.div className="att-action-bar" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <div className="att-action-date">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                {selectedRec && <span className={'att-current-badge att-current-'+selectedRec.status}>{selectedRec.status}</span>}
              </div>
              <div className="att-action-btns">
                <button className="att-action-btn att-btn-present" onClick={() => handleMark('present')} disabled={busy}>✓ Present</button>
                <button className="att-action-btn att-btn-absent" onClick={() => handleMark('absent')} disabled={busy}>✗ Absent</button>
                {selectedRec && <button className="att-action-btn att-btn-clear" onClick={() => handleMark('clear')} disabled={busy}>Clear</button>}
              </div>
            </motion.div>
          )}
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>Tap any date to mark attendance</div>
        </div>
      </motion.div>
    </div>
  );
}


const waLink = (phone, name) => {
  const num = (phone||'').replace(/\D/g,'');
  const msg = encodeURIComponent(`Hi ${name}, this is regarding your membership at CoachFlow. Let me know if you have any questions!`);
  return `https://wa.me/${num.startsWith('91')?num:'91'+num}?text=${msg}`;
};

export default function MembersPage() {
  const [memberships, setMemberships] = useState([]);
  const [stats, setStats] = useState({ total:0, active:0, expiring:0, expired:0 });
  const [reminders, setReminders] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [renewMember, setRenewMember] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [attendanceMember, setAttendanceMember] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, lRes, aRes] = await Promise.allSettled([
        API.get('/membership', { params: { status: tab !== 'all' ? tab : undefined, search: search||undefined } }),
        API.get('/leads?limit=200'),
        API.get('/membership/analytics'),
      ]);
      if (mRes.status==='fulfilled') { setMemberships(mRes.value.data.memberships||[]); setStats(mRes.value.data.stats||{}); }
      if (lRes.status==='fulfilled') setLeads(lRes.value.data.leads||[]);
      if (aRes.status==='fulfilled') setReminders(aRes.value.data.analytics?.reminders||[]);
    } catch {} finally { setLoading(false); }
  }, [tab, search]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCreate = async (payload) => {
    try { await API.post('/membership', payload); toast.success('Membership created! 🎉'); setModalOpen(false); fetch(); }
    catch (err) { toast.error(err.response?.data?.message||'Failed'); }
  };
  const handleUpdate = async (payload) => {
    try { await API.put(`/membership/${editMember._id}`, payload); toast.success('Updated'); setEditMember(null); setModalOpen(false); fetch(); }
    catch (err) { toast.error(err.response?.data?.message||'Failed'); }
  };
  const handleRenew = async (payload) => {
    try { await API.post(`/membership/${renewMember._id}/renew`, payload); toast.success('Membership renewed! 🔄'); setRenewMember(null); fetch(); }
    catch (err) { toast.error(err.response?.data?.message||'Failed'); }
  };
  const handleDelete = async (id) => {
    try { await API.delete(`/membership/${id}`); toast.success('Deleted'); setDeleteConfirm(null); fetch(); }
    catch { toast.error('Failed'); }
  };

  const urgentReminders = reminders.filter(r => r.type==='expiring'||r.type==='expired').slice(0,5);

  return (
    <div className="members-page">
      <div className="members-header">
        <div><h1 className="members-title">Members</h1><p className="members-sub">{stats.total} total memberships</p></div>
        <button className="btn btn-primary" onClick={()=>{setEditMember(null);setModalOpen(true);}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Membership
        </button>
      </div>

      <div className="members-stats">
        <div className="m-stat"><div className="m-stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div className="m-stat-value">{stats.total}</div><div className="m-stat-label">Total</div></div>
        <div className="m-stat" style={{'--stat-color':'#47ffa4'}}><div className="m-stat-icon" style={{color:'#47ffa4'}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></div><div className="m-stat-value">{stats.active}</div><div className="m-stat-label">Active</div></div>
        <div className="m-stat"><div className="m-stat-icon" style={{color:'#ff9f47'}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div className="m-stat-value">{stats.expiring}</div><div className="m-stat-label">Expiring</div></div>
        <div className="m-stat"><div className="m-stat-icon" style={{color:'#ff6b6b'}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div><div className="m-stat-value">{stats.expired}</div><div className="m-stat-label">Expired</div></div>
      </div>

      {urgentReminders.length > 0 && (
        <div className="members-reminders">
          <div className="members-reminders-title">🔔 Smart Reminders</div>
          <div className="reminder-list">
            {urgentReminders.map((r,i) => (
              <div key={i} className="reminder-item">
                <div className={`reminder-dot reminder-dot-${r.type==='expiring'?'expiring':'expired'}`} />
                {r.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="members-tabs">
        {TABS.map(t => <button key={t} className={`m-tab ${tab===t?'m-tab-active':''}`} onClick={()=>setTab(t)}>{t==='all'?`All (${stats.total})`:`${t.charAt(0).toUpperCase()+t.slice(1)} (${stats[t]||0})`}</button>)}
      </div>

      <div className="members-controls">
        <div className="members-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search members..." />
        </div>
      </div>

      <div className="members-table-wrap">
        {loading ? (
          <div className="members-loading"><div className="spinner" style={{width:28,height:28}}/><span>Loading…</span></div>
        ) : memberships.length === 0 ? (
          <div className="members-empty">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            <h3>No members yet</h3><p>Create your first membership to start tracking</p>
            <button className="btn btn-primary" onClick={()=>{setEditMember(null);setModalOpen(true);}}>+ Add First Member</button>
          </div>
        ) : (
          <div className="m-card-list">
            {memberships.map(m => (
              <div key={m._id} className="m-card">
                <div className="m-card-top">
                  <div className="m-name-cell">
                    <div className="m-avatar">{m.clientName?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="m-name">{m.clientName}</div>
                      <div className="m-contact">{m.clientPhone||m.clientEmail||'—'}</div>
                    </div>
                  </div>
                  <span className={`m-status m-status-${m.status}`}>{m.status}</span>
                </div>

                <div className="m-card-details">
                  <div className="m-card-detail"><span className="m-card-detail-label">Plan</span><span className="m-plan">{m.plan?.name}</span></div>
                  <div className="m-card-detail"><span className="m-card-detail-label">Amount</span><span className="m-amount">₹{(m.plan?.amount||0).toLocaleString()}</span></div>
                  <div className="m-card-detail"><span className="m-card-detail-label">Days Left</span><span className={`m-days ${m.daysLeft>7?'m-days-ok':m.daysLeft>0?'m-days-warn':'m-days-expired'}`}>{m.daysLeft>0?`${m.daysLeft}d`:'Expired'}</span></div>
                  <div className="m-card-detail"><span className="m-card-detail-label">Attendance</span><div className="m-attendance"><div className="m-att-bar"><div className="m-att-fill" style={{width:`${m.totalSessions>0?Math.round(m.presentSessions/m.totalSessions*100):0}%`}} /></div><span style={{fontSize:11,color:'var(--text-muted)'}}>{m.presentSessions||0}/{m.totalSessions||0}</span></div></div>
                </div>

                <div className="m-card-actions">
                  <button className="m-card-action-btn" onClick={()=>setAttendanceMember(m)} title="Attendance">📅 Attendance</button>
                  {m.clientPhone && <a href={waLink(m.clientPhone,m.clientName)} target="_blank" rel="noopener noreferrer" className="m-card-action-btn m-wa-btn" title="WhatsApp">💬 WhatsApp</a>}
                  <button className="m-card-action-btn m-renew-btn" onClick={()=>setRenewMember(m)} title="Renew">🔄 Renew</button>
                  <button className="m-card-action-btn" onClick={()=>{setEditMember(m);setModalOpen(true);}} title="Edit">✏️</button>
                  <button className="m-card-action-btn" onClick={()=>setDeleteConfirm(m._id)} title="Delete" style={{color:'#ff6b6b'}}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="m-modal-backdrop" onClick={()=>setDeleteConfirm(null)}>
          <div className="m-modal" onClick={e=>e.stopPropagation()} style={{maxWidth:380}}>
            <div className="m-modal-body" style={{textAlign:'center',padding:'30px 24px'}}>
              <div style={{fontSize:36,marginBottom:12}}>🗑️</div>
              <h3 style={{color:'#fff',marginBottom:8}}>Delete membership?</h3>
              <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:20}}>This action cannot be undone.</p>
              <div style={{display:'flex',gap:10,justifyContent:'center'}}>
                <button className="btn btn-ghost" onClick={()=>setDeleteConfirm(null)}>Cancel</button>
                <button className="btn" style={{background:'#ff6b6b',color:'#fff'}} onClick={()=>handleDelete(deleteConfirm)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && <MemberModal isOpen={modalOpen} onClose={()=>{setModalOpen(false);setEditMember(null);}} onSave={editMember?handleUpdate:handleCreate} member={editMember} leads={leads} />}
      </AnimatePresence>
      <AnimatePresence>
        {renewMember && <RenewModal isOpen={!!renewMember} onClose={()=>setRenewMember(null)} onRenew={handleRenew} member={renewMember} />}
      </AnimatePresence>
      <AnimatePresence>
        {attendanceMember && <AttendanceCalendarModal isOpen={!!attendanceMember} onClose={()=>setAttendanceMember(null)} member={attendanceMember} onDone={fetch} />}
      </AnimatePresence>
    </div>
  );
}
