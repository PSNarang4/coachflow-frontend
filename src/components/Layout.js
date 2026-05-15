import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription, GraceWarning, TrialBanner } from './SubscriptionGate';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './Layout.css';
import LogoIcon from '../assets/LogoIcon';

const IconDash    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconLeads   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconMembers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconAI      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconMore    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>;
const IconBilling = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const IconMsg     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IconCog     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>;
const IconAnalytics = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconLogout  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconMenu    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;

function SubBadge({ sub }) {
  if (!sub) return null;
  if (sub.state === 'active')
    return <span className="nav-item-badge nav-badge-green">Pro</span>;
  if (sub.state === 'grace')
    return <span className="nav-item-badge nav-badge-urgent">Grace</span>;
  if (sub.state === 'trial' && sub.daysLeft != null)
    return <span className={`nav-item-badge ${sub.daysLeft <= 3 ? 'nav-badge-urgent' : ''}`}>{sub.daysLeft}d</span>;
  if (sub.state === 'trial_expired' || sub.state === 'expired')
    return <span className="nav-item-badge nav-badge-urgent">Expired</span>;
  return null;
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const { sub }          = useSubscription() || {};
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
    : 'CF';

  const isBlocked = sub && (
    sub.state === 'trial_expired' || sub.state === 'expired' ||
    sub.state === 'cancelled'     || sub.state === 'grace_expired'
  );

  // Bottom tab bar items — the 5 most-used screens
  const bottomTabs = [
    { to: '/dashboard', icon: <IconDash />,    label: 'Home' },
    { to: '/leads',     icon: <IconLeads />,   label: 'Leads' },
    { to: '/members',   icon: <IconMembers />, label: 'Members' },
    { to: '/ai',        icon: <IconAI />,      label: 'AI' },
  ];

  // Full sidebar nav items
  const navItems = [
    { to: '/dashboard',    icon: <IconDash />,      label: 'Dashboard'        },
    { to: '/leads',        icon: <IconLeads />,     label: 'Leads'            },
    { to: '/members',      icon: <IconMembers />,   label: 'Members'          },
    { to: '/analytics',    icon: <IconAnalytics />, label: 'Analytics'        },
    { to: '/ai',           icon: <IconAI />,        label: 'AI Center',  badge: true },
    { to: '/subscription', icon: <IconBilling />,   label: 'Subscription', subBadge: true },
    { to: '/contact',      icon: <IconMsg />,       label: 'Contact Us'       },
    { to: '/account',      icon: <IconCog />,       label: 'Account Settings' },
  ];

  return (
    <div className="layout">
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <LogoIcon size={36} />
          <div>
            <div className="logo-title"><span>COACH</span>FLOW</div>
            <div className="logo-sub">AI · Premium CRM</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={() => setMobileOpen(false)}>
              {item.icon}
              <span>{item.label}</span>
              {item.badge && <span className="nav-item-badge">AI</span>}
              {item.subBadge && <SubBadge sub={sub} />}
            </NavLink>
          ))}
        </nav>

        {/* Blocked warning in sidebar */}
        {isBlocked && (
          <Link to="/subscription" className="sidebar-trial-warn" onClick={() => setMobileOpen(false)}>
            <span className="sidebar-trial-icon">⚠️</span>
            <div>
              <div className="sidebar-trial-title">Access Blocked</div>
              <div className="sidebar-trial-sub">Subscribe to unlock →</div>
            </div>
          </Link>
        )}
        {!isBlocked && sub?.state === 'trial' && sub?.daysLeft <= 3 && (
          <Link to="/subscription" className="sidebar-trial-warn" onClick={() => setMobileOpen(false)}>
            <span className="sidebar-trial-icon">⏰</span>
            <div>
              <div className="sidebar-trial-title">{sub.daysLeft}d trial left</div>
              <div className="sidebar-trial-sub">Subscribe now →</div>
            </div>
          </Link>
        )}

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <IconLogout /><span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="mobile-header">
          <div className="mobile-logo">
            <LogoIcon size={28} />
            <span><strong>COACH</strong>FLOW</span>
          </div>
          <div className="user-avatar-sm" onClick={() => setMobileOpen(true)}>{initials}</div>
        </header>

        {/* Notification bars — shown at top of all pages */}
        <GraceWarning />
        <TrialBanner />

        <main className="main-content">{children}</main>
      </div>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="bottom-tabs" aria-label="Main navigation">
        {bottomTabs.map(tab => {
          const isActive = location.pathname === tab.to;
          return (
            <NavLink key={tab.to} to={tab.to} className={`btab ${isActive ? 'btab-active' : ''}`}>
              <span className="btab-icon">{tab.icon}</span>
              <span className="btab-label">{tab.label}</span>
              {isActive && <span className="btab-dot" />}
            </NavLink>
          );
        })}
        <button className="btab" onClick={() => setMobileOpen(true)} type="button">
          <span className="btab-icon"><IconMore /></span>
          <span className="btab-label">More</span>
        </button>
      </nav>
    </div>
  );
}
