import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './Subscription.css';

const RAZORPAY_LINK = process.env.REACT_APP_RAZORPAY_LINK || 'https://rzp.io/l/coachflow';

const FEATURES = [
  { icon: '👥', label: 'Unlimited Leads',        desc: 'No cap — capture and manage as many clients as you want' },
  { icon: '🌐', label: 'Your Personal Form Link', desc: 'yoursite.com/form/yourname — share anywhere online' },
  { icon: '✨', label: 'AI Lead Scoring',          desc: 'Know which leads are most likely to become clients' },
  { icon: '💬', label: 'AI WhatsApp Replies',      desc: "AI writes the perfect follow-up for each lead's goal" },
  { icon: '📊', label: 'Pipeline Analytics',       desc: 'See your conversion rate, best source, peak hours' },
  { icon: '🔒', label: 'OTP Login Security',       desc: 'Email verification on every login — no unauthorized access' },
  { icon: '📱', label: 'Works on All Devices',     desc: 'Phone, tablet, laptop — everything stays in sync' },
  { icon: '🚀', label: 'Direct Support',           desc: 'WhatsApp and email support — real replies from Prabh' },
];

const FAQS = [
  {
    q: 'Do I need to add a card to start the free trial?',
    a: 'No. Zero card details needed. Just sign up and you get 14 days full access — no payment screen, no card, nothing. After 14 days you decide if you want to continue.',
  },
  {
    q: 'What happens after my 14-day trial ends?',
    a: "You'll see a payment screen inside the app. Click \"Subscribe Now\", pay ₹500 via UPI, card, or net banking through Razorpay, and your full access is instantly restored.",
  },
  {
    q: 'Will I be automatically charged after the trial?',
    a: 'No — never. You will never be charged without actively clicking Subscribe and completing payment yourself. There is no auto-debit, no card stored.',
  },
  {
    q: 'What payment methods are accepted?',
    a: "All UPI apps (Google Pay, PhonePe, Paytm), debit cards, credit cards, net banking, and wallets. Powered by Razorpay — India's most trusted payment gateway.",
  },
  {
    q: 'Can I cancel anytime?',
    a: "Yes. There's no lock-in. Stop paying and your subscription simply ends at the next billing date. Your data stays safe.",
  },
  {
    q: 'Is my client data safe?',
    a: 'Yes. Your leads and data are stored securely and never shared with anyone. Even if you stop your subscription, your data is not deleted.',
  },
];

export default function Subscription() {
  const { user }              = useAuth();
  const [sub,     setSub]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    API.get('/subscription/status')
      .then(({ data }) => setSub(data.subscription))
      .catch(() => setSub({ status: 'trial', daysLeft: 14 }))
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = () => {
    const name  = encodeURIComponent(user?.name  || '');
    const email = encodeURIComponent(user?.email || '');
    window.open(`${RAZORPAY_LINK}?name=${name}&email=${email}`, '_blank');
  };

  const isActive  = sub?.state === 'active';
  const isTrial   = sub?.state === 'trial';
  const isGrace   = sub?.state === 'grace';
  const isExpired = !isActive && !isTrial && !isGrace && !loading;
  const urgent    = isTrial && sub?.daysLeft <= 3;

  return (
    <div className="sub-page">

      {/* Header */}
      <div className="sub-header">
        <div className="sub-header-badge">💳 Subscription</div>
        <h1 className="sub-header-title">
          {isActive ? "You're on CoachFlow Pro ✅" : 'CoachFlow AI Pro'}
        </h1>
        <p className="sub-header-sub">
          {isActive
            ? `Active until ${new Date(sub.planEndDate).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}`
            : 'Everything you need to grow your coaching business. No card needed to start.'}
        </p>
      </div>

      {/* Status banner */}
      {!loading && !isActive && (
        <div className={`sub-status-banner ${urgent || isExpired || isGrace ? 'sub-banner-urgent' : 'sub-banner-trial'}`}>
          <div className="sub-banner-icon">
            {urgent || isExpired || isGrace ? '⚠️' : '🎁'}
          </div>
          <div className="sub-banner-text">
            {isTrial && sub.daysLeft > 0 && (
              <>
                <strong>{sub.daysLeft} day{sub.daysLeft !== 1 ? 's' : ''} left in your free trial</strong>
                <span>No card needed now. Subscribe any time to keep your access after the trial.</span>
              </>
            )}
            {isGrace && (
              <>
                <strong>Payment failed — {sub.graceLeft} day grace period</strong>
                <span>Your access continues for a few more days. Please renew to avoid interruption.</span>
              </>
            )}
            {isExpired && (
              <>
                <strong>Your access has ended</strong>
                <span>Subscribe below to restore full access instantly. Your leads and data are safe.</span>
              </>
            )}
          </div>
          <button className="btn btn-primary sub-banner-btn" onClick={handleSubscribe}>
            Subscribe — ₹500/mo →
          </button>
        </div>
      )}

      {/* Active card */}
      {!loading && isActive && (
        <div className="sub-active-card">
          <div className="sub-active-glow" />
          <div className="sub-active-check">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <div className="sub-active-title">CoachFlow Pro · Active</div>
            <div className="sub-active-sub">
              Next billing: {sub.planEndDate
                ? new Date(sub.planEndDate).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })
                : '—'}
            </div>
          </div>
          <div className="sub-active-price">
            <span className="sub-active-amount">₹500</span>
            <span className="sub-active-period">/month</span>
          </div>
        </div>
      )}

      {/* Pricing section */}
      {!isActive && (
        <div className="sub-pricing-wrap">

          {/* Pricing card */}
          <div className="sub-pricing-card">
            <div className="sub-pricing-glow" />
            <div className="sub-popular-badge">Everything included</div>
            <div className="sub-plan-name">CoachFlow Pro</div>

            <div className="sub-price-row">
              <span className="sub-currency">₹</span>
              <span className="sub-amount">500</span>
              <div className="sub-period-wrap">
                <span className="sub-period">/month</span>
                <span className="sub-billed">billed monthly</span>
              </div>
            </div>

            {/* No card needed callout */}
            <div className="sub-no-card-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              No card needed · 14-day free trial · Cancel anytime
            </div>

            <div className="sub-divider" />

            <ul className="sub-features-list">
              {FEATURES.map((f, i) => (
                <li key={i} className="sub-feature-item">
                  <span className="sub-feature-icon">{f.icon}</span>
                  <div>
                    <div className="sub-feature-label">{f.label}</div>
                    <div className="sub-feature-desc">{f.desc}</div>
                  </div>
                </li>
              ))}
            </ul>

            <button className="sub-cta-btn" onClick={handleSubscribe}>
              <span>Subscribe Now — ₹500/month</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>

            <div className="sub-payment-icons">
              <span className="sub-pay-badge">UPI</span>
              <span className="sub-pay-badge">Google Pay</span>
              <span className="sub-pay-badge">PhonePe</span>
              <span className="sub-pay-badge">Cards</span>
              <span className="sub-pay-badge">Net Banking</span>
            </div>

            <p className="sub-secure-note">
              🔒 Payments powered by Razorpay · PCI-DSS compliant · No card stored
            </p>
          </div>

          {/* Compare column */}
          <div className="sub-compare">
            <div className="sub-compare-title">Why coaches switch to CoachFlow AI</div>
            <div className="sub-compare-items">
              {[
                { label: 'WhatsApp groups',   bad: true,  text: 'Leads get buried and forgotten' },
                { label: 'Excel sheets',       bad: true,  text: 'No automation, manual work every day' },
                { label: 'Generic CRMs',       bad: true,  text: 'Built for sales teams, not fitness coaches' },
                { label: 'CoachFlow AI',       bad: false, text: 'Built specifically for Indian fitness coaches' },
              ].map((item, i) => (
                <div key={i} className={`sub-compare-row ${item.bad ? 'sub-compare-bad' : 'sub-compare-good'}`}>
                  <span className="sub-compare-icon">{item.bad ? '✕' : '✓'}</span>
                  <div>
                    <div className="sub-compare-label">{item.label}</div>
                    <div className="sub-compare-text">{item.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sub-value-breakdown">
              <div className="sub-value-title">₹500/month works out to</div>
              {[
                { amount: '₹16/day', label: 'Less than a cup of chai' },
                { amount: '1 client', label: 'Pays for 6 months of CoachFlow' },
                { amount: '10×',     label: 'Return if you close one extra client' },
              ].map((item, i) => (
                <div key={i} className="sub-value-row">
                  <div className="sub-value-amount">{item.amount}</div>
                  <div className="sub-value-label">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="sub-testimonial">
              <div className="sub-testi-stars">★★★★★</div>
              <p>"I was managing 40+ leads on WhatsApp. After CoachFlow AI, I closed 3 new clients in the first week just by following the AI scoring."</p>
              <div className="sub-testi-name">— Online Fitness Coach, Delhi</div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="sub-faq">
        <h2 className="sub-faq-title">Common questions about payment</h2>
        <div className="sub-faq-list">
          {FAQS.map((item, i) => (
            <div key={i} className={`sub-faq-item ${openFaq === i ? 'sub-faq-open' : ''}`}>
              <button className="sub-faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)} type="button">
                <span>{item.q}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round"
                  style={{ flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {openFaq === i && <div className="sub-faq-answer">{item.a}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      {!isActive && (
        <div className="sub-bottom-cta">
          <div className="sub-bottom-glow" />
          <h3>Ready to stop losing leads?</h3>
          <p>14 days free. No card needed. ₹500/month after that.</p>
          <button className="sub-cta-btn" onClick={handleSubscribe} style={{ maxWidth: 360, margin: '0 auto' }}>
            <span>Subscribe Now — ₹500/month</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 12 }}>
            Questions? <Link to="/contact" style={{ color: 'var(--accent)' }}>Chat with Prabh on WhatsApp →</Link>
          </p>
        </div>
      )}
    </div>
  );
}