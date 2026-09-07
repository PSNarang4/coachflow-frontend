import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import { getLocalizedSubscriptionPrice } from '../utils/pricing';
import './SubscriptionGate.css';

const SubContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const [sub,     setSub]     = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    API.get('/subscription/status')
      .then(({ data }) => setSub(data.subscription))
      .catch(() => setSub(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <SubContext.Provider value={{ sub, loading, refresh }}>
      {children}
    </SubContext.Provider>
  );
};

export const useSubscription = () => useContext(SubContext);

// Wraps protected pages — shows paywall if access not allowed
export function SubscriptionGuard({ children }) {
  const { sub, loading } = useSubscription();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div className="spinner" style={{ width:32, height:32 }} />
    </div>
  );

  const isBlocked =
    sub?.state === 'trial_expired' ||
    sub?.state === 'expired'       ||
    sub?.state === 'cancelled'     ||
    sub?.state === 'grace_expired' ||
    (sub?.status === 'trial' && sub?.daysLeft === 0);

  if (isBlocked) return <Paywall sub={sub} />;
  return children;
}

// Grace period warning bar (shown inside app, not blocking)
export function GraceWarning() {
  const { sub } = useSubscription();
  if (sub?.state !== 'grace') return null;

  return (
    <div className="grace-bar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <span>
        <strong>Payment failed.</strong>{' '}
        {sub.graceLeft > 0
          ? `You have ${sub.graceLeft} day${sub.graceLeft !== 1 ? 's' : ''} of grace period remaining.`
          : 'Your grace period ends today.'}
        {' '}
        <Link to="/subscription">Renew now →</Link>
      </span>
    </div>
  );
}

// Trial countdown bar
export function TrialBanner() {
  const { sub } = useSubscription();
  const localPrice = useMemo(() => getLocalizedSubscriptionPrice(), []);
  if (sub?.state !== 'trial' || !sub?.daysLeft || sub.daysLeft > 7) return null;

  const urgent = sub.daysLeft <= 3;
  return (
    <div className={`trial-bar ${urgent ? 'trial-bar-urgent' : ''}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <span>
        {urgent ? '⚠️ ' : '🎁 '}
        <strong>{sub.daysLeft} day{sub.daysLeft !== 1 ? 's' : ''} left</strong> in your free trial.{' '}
        <Link to="/subscription">Subscribe for {localPrice.monthlyLabel}</Link>
      </span>
    </div>
  );
}

// ── Full-page paywall ─────────────────────────────────────────────────────────
function Paywall({ sub }) {
  const RAZORPAY_LINK = process.env.REACT_APP_RAZORPAY_LINK || 'https://rzp.io/rzp/2UF21eXW';
  const isTrialEnd = sub?.state === 'trial_expired';
  const localPrice = useMemo(() => getLocalizedSubscriptionPrice(), []);

  return (
    <div className="paywall">
      <div className="paywall-card">
        <div className="paywall-glow" />

        <div className="paywall-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        <div className="paywall-badge">
          {isTrialEnd ? '7-Day Trial Ended' : 'Subscription Required'}
        </div>

        <h2 className="paywall-title">
          {isTrialEnd ? 'Your free trial is over' : 'Your subscription has expired'}
        </h2>

        <p className="paywall-sub">
          Subscribe for <strong>{localPrice.monthlyLabel}</strong> to restore full access.
          No hidden charges. Cancel anytime.
        </p>

        <div className="paywall-price-row">
          <span className="paywall-price-amount paywall-price-amount-local">{localPrice.formatted}</span>
          <span className="paywall-price-period">/month</span>
        </div>
        {!localPrice.isInr && (
          <p className="paywall-price-note">Approx. local price. Checkout is billed as {localPrice.baseFormatted}.</p>
        )}

        <div className="paywall-features">
          {[
            'Unlimited Lead Management',
            'AI Intelligence Center',
            'Custom Form URL (yourname)',
            'Pipeline Analytics & Reports',
            'AI Sales Assistant',
          ].map((f, i) => (
            <div key={i} className="paywall-feature">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {f}
            </div>
          ))}
        </div>

        <a className="paywall-cta" href={RAZORPAY_LINK} target="_blank" rel="noreferrer">
          Subscribe Now - {localPrice.monthlyLabel}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>

        <p className="paywall-note">UPI · Cards · Net Banking · Wallets</p>

        <div className="paywall-footer-links">
          <Link to="/subscription">View plans</Link>
          <span>·</span>
          <Link to="/contact">Contact support</Link>
        </div>
      </div>
    </div>
  );
}
