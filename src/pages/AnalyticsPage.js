import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './AnalyticsPage.css';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: res } = await API.get('/membership/analytics');
        setData(res.analytics);
      } catch { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="members-loading"><div className="spinner" style={{width:28,height:28}}/><span>Loading analytics…</span></div>;
  if (!data) return null;

  const maxRevenue = Math.max(...data.revenueChart.map(r => r.amount), 1);
  const { members, leads, reminders } = data;

  const donutTotal = members.active + members.expiring + members.expired;
  const donutData = [
    { label:'Active', count:members.active, color:'#47ffa4', pct: donutTotal>0 ? members.active/donutTotal*100 : 0 },
    { label:'Expiring', count:members.expiring, color:'#ff9f47', pct: donutTotal>0 ? members.expiring/donutTotal*100 : 0 },
    { label:'Expired', count:members.expired, color:'#ff6b6b', pct: donutTotal>0 ? members.expired/donutTotal*100 : 0 },
  ];
  // Conic gradient for donut
  let conicStops = '';
  let cumPct = 0;
  donutData.forEach(d => {
    conicStops += `${d.color} ${cumPct}% ${cumPct + d.pct}%, `;
    cumPct += d.pct;
  });
  if (cumPct < 100) conicStops += `rgba(255,255,255,0.06) ${cumPct}% 100%`;
  else conicStops = conicStops.slice(0, -2);

  const reminderIcons = { expiring:'⏰', expired:'🔴', inactive_lead:'💤' };

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1 className="analytics-title">Analytics</h1>
        <p className="analytics-sub">Revenue, members, and conversion insights</p>
      </div>

      <motion.div className="analytics-stats" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5}}>
        <div className="a-stat">
          <div className="a-stat-label">This Month Revenue</div>
          <div className="a-stat-value" style={{color:'var(--accent)'}}>₹{data.thisMonthRevenue.toLocaleString()}</div>
          <div className={`a-stat-change ${data.revenueGrowth>=0?'a-stat-up':'a-stat-down'}`}>
            {data.revenueGrowth>=0?'↑':'↓'} {Math.abs(data.revenueGrowth)}% vs last month
          </div>
        </div>
        <div className="a-stat">
          <div className="a-stat-label">Total Revenue</div>
          <div className="a-stat-value">₹{data.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="a-stat">
          <div className="a-stat-label">Active Members</div>
          <div className="a-stat-value" style={{color:'#47ffa4'}}>{members.active}</div>
        </div>
        <div className="a-stat">
          <div className="a-stat-label">Conversion Rate</div>
          <div className="a-stat-value" style={{color:'#a47fff'}}>{leads.conversionRate}%</div>
          <div className="a-stat-change" style={{color:'var(--text-muted)'}}>{leads.closed}/{leads.total} leads closed</div>
        </div>
      </motion.div>

      <div className="analytics-row">
        <motion.div className="a-card" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
          <div className="a-card-title">Revenue (Last 6 Months)</div>
          <div className="a-chart">
            {data.revenueChart.map((r,i) => (
              <div key={i} className="a-chart-bar-wrap">
                <div className="a-chart-amount">₹{r.amount>999?(r.amount/1000).toFixed(1)+'k':r.amount}</div>
                <div className="a-chart-bar" style={{height:'100%',position:'relative'}}>
                  <div className="a-chart-bar-fill" style={{height:`${Math.max(4,(r.amount/maxRevenue)*100)}%`}} />
                </div>
                <div className="a-chart-label">{r.month}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="a-card" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
          <div className="a-card-title">Member Distribution</div>
          <div className="a-donut">
            <div className="a-donut-ring" style={{background:`conic-gradient(${conicStops})`}}>
              <div className="a-donut-center">
                <div className="a-donut-num">{members.total}</div>
                <div className="a-donut-label">Total</div>
              </div>
            </div>
            <div className="a-donut-legend">
              {donutData.map(d => (
                <div key={d.label} className="a-legend-item">
                  <div className="a-legend-dot" style={{background:d.color}} />
                  <span>{d.label}: <strong style={{color:'#fff'}}>{d.count}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="analytics-row">
        <motion.div className="a-card" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
          <div className="a-card-title">Lead → Member Funnel</div>
          <div className="a-funnel">
            <div className="a-funnel-row"><div className="a-funnel-label">Total Leads</div><div className="a-funnel-bar"><div className="a-funnel-fill" style={{width:'100%',background:'#e8ff47'}} /></div><div className="a-funnel-count">{leads.total}</div></div>
            <div className="a-funnel-row"><div className="a-funnel-label">Closed</div><div className="a-funnel-bar"><div className="a-funnel-fill" style={{width:`${leads.total>0?leads.closed/leads.total*100:0}%`,background:'#47ffa4'}} /></div><div className="a-funnel-count">{leads.closed}</div></div>
            <div className="a-funnel-row"><div className="a-funnel-label">Members</div><div className="a-funnel-bar"><div className="a-funnel-fill" style={{width:`${leads.total>0?members.total/leads.total*100:0}%`,background:'#47b4ff'}} /></div><div className="a-funnel-count">{members.total}</div></div>
          </div>
        </motion.div>

        <motion.div className="a-card" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}}>
          <div className="a-card-title" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            🔔 Smart Reminders
            <Link to="/members" className="btn btn-ghost btn-sm" style={{fontSize:11}}>View Members →</Link>
          </div>
          {reminders.length === 0 ? (
            <div style={{textAlign:'center',padding:'30px 0',color:'var(--text-muted)',fontSize:13}}>
              <div style={{fontSize:28,marginBottom:8}}>✅</div>
              All clear! No urgent reminders.
            </div>
          ) : (
            <div className="a-reminders">
              {reminders.slice(0,8).map((r,i) => (
                <div key={i} className="a-reminder">
                  <span className="a-reminder-icon">{reminderIcons[r.type]||'📌'}</span>
                  {r.message}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
