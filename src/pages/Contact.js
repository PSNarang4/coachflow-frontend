import React, { useState } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './Contact.css';
import LogoIcon from '../assets/LogoIcon';

const CONTACT = {
  email:    'prabhnarang.business@gmail.com',
  phone:    '9499391455',
  whatsapp: '9499391455',
};

// FAQs written for fitness coaches — not tech questions
const FAQS = [
  {
    q: 'I am already managing leads on WhatsApp and Excel. Why should I switch?',
    a: 'WhatsApp and Excel work until they don\'t — leads get buried in chats, follow-ups are forgotten, and you never know your actual conversion rate. CoachFlow AI gives you one place for every lead, automatic scoring to tell you who\'s most likely to convert, and AI-written WhatsApp replies so you spend less time typing and more time coaching.',
  },
  {
    q: 'I am not technical at all. Is this difficult to use?',
    a: 'Not at all. If you can use WhatsApp, you can use CoachFlow AI. Sign up → share your personal form link with clients → leads come in automatically. No Excel, no manual entry, no tech knowledge needed.',
  },
  {
    q: 'How do clients fill the form? Do they need to download anything?',
    a: 'No download needed. You get a personal link like yoursite.com/form/yourname. Share it anywhere — Instagram bio, WhatsApp, Google — and clients fill a simple form. Their details land directly in your dashboard.',
  },
  {
    q: 'Will this help me close more clients?',
    a: 'Yes. The AI Sales Assistant writes personalized follow-up messages based on each client\'s goal (fat loss, muscle gain, etc.) and even handles price objections. Most coaches see a significant improvement in response rates within the first week.',
  },
  {
    q: 'I have clients from multiple cities. Can I manage all of them here?',
    a: 'Yes. There is no limit on number of leads or their location. Online coaches managing clients across India use CoachFlow AI to keep everything organized in one place.',
  },
  {
    q: 'What happens to my leads if I stop the subscription?',
    a: 'Your data is safe and never deleted. If you pause your subscription, you can still log in to view your data. You just cannot add new leads or use AI features until you renew.',
  },
  {
    q: 'Can I try it before paying anything?',
    a: 'Yes — 14 days completely free, no card required. You get full access to every feature during the trial. After 14 days, it\'s ₹500/month to continue.',
  },
  {
    q: 'I already paid a lot for a website and social media management. Is this worth ₹500 more?',
    a: '₹500 is less than the profit from a single client. If CoachFlow AI helps you close even one extra client per month — which most coaches do — it pays for itself 10x over.',
  },
];

const SUBJECTS = [
  { value: '',              label: 'What is your question about?' },
  { value: 'getting-started', label: 'I want to get started' },
  { value: 'subscription',    label: 'Subscription & billing' },
  { value: 'leads',           label: 'Managing my leads' },
  { value: 'form-link',       label: 'My client form link' },
  { value: 'ai-features',     label: 'AI features' },
  { value: 'technical',       label: 'Something is not working' },
  { value: 'other',           label: 'Something else' },
];

export default function Contact() {
  const [form, setForm]       = useState({ name:'', email:'', subject:'', message:'' });
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim())    { toast.error('Please enter your name');    return; }
    if (!form.email.trim())   { toast.error('Please enter your email');   return; }
    if (!form.message.trim()) { toast.error('Please write your message'); return; }

    setSending(true);
    try {
      await API.post('/contact', form);
      setSent(true);
      toast.success('Message sent! Check your email for confirmation.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send. Please try WhatsApp or email directly.';
      toast.error(msg);
    } finally { setSending(false); }
  };

  return (
    <div className="contact-page">

      {/* ── Hero ── */}
      <div className="contact-hero">
        <div className="contact-hero-glow" />
        <LogoIcon size={56} />
        <div className="contact-hero-text">
          <div className="contact-hero-badge">💬 We're here for you</div>
          <h1 className="contact-hero-title">Talk to us directly</h1>
          <p className="contact-hero-sub">
            Every message goes straight to Prabh. No support tickets, no bots.
            Real reply within 2 hours.
          </p>
        </div>
      </div>

      <div className="contact-layout">

        {/* ── Left column ── */}
        <div className="contact-info-col">

          {/* WhatsApp — fastest */}
          <a
            href={`https://wa.me/91${CONTACT.whatsapp}?text=Hi%20Prabh%2C%20I%20have%20a%20question%20about%20CoachFlow%20AI`}
            className="contact-card contact-card-whatsapp"
            target="_blank" rel="noreferrer">
            <div className="contact-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <div className="contact-card-body">
              <div className="contact-card-label">WhatsApp — fastest reply</div>
              <div className="contact-card-value">+91 {CONTACT.whatsapp}</div>
              <div className="contact-card-hint">Usually within 30 minutes</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="contact-card-arrow" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>

          {/* Email */}
          <a href={`mailto:${CONTACT.email}`} className="contact-card contact-card-email">
            <div className="contact-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div className="contact-card-body">
              <div className="contact-card-label">Email</div>
              <div className="contact-card-value">{CONTACT.email}</div>
              <div className="contact-card-hint">Within 2 hours</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="contact-card-arrow" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>

          {/* Phone */}
          <a href={`tel:+91${CONTACT.phone}`} className="contact-card contact-card-phone">
            <div className="contact-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.08 6.08l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div className="contact-card-body">
              <div className="contact-card-label">Phone call</div>
              <div className="contact-card-value">+91 {CONTACT.phone}</div>
              <div className="contact-card-hint">Mon–Sat, 9 AM – 8 PM IST</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="contact-card-arrow" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>

          {/* Response times */}
          <div className="contact-response-card">
            <div className="contact-response-title">Typical response times</div>
            <div className="contact-response-row">
              <span className="contact-response-dot contact-dot-green"/>
              <div><div className="contact-response-label">WhatsApp</div><div className="contact-response-time">~30 minutes</div></div>
            </div>
            <div className="contact-response-row">
              <span className="contact-response-dot contact-dot-yellow"/>
              <div><div className="contact-response-label">Email / Contact form</div><div className="contact-response-time">Within 2 hours</div></div>
            </div>
            <div className="contact-response-row">
              <span className="contact-response-dot contact-dot-blue"/>
              <div><div className="contact-response-label">Phone</div><div className="contact-response-time">Mon–Sat, 9 AM – 8 PM</div></div>
            </div>
          </div>

          {/* Founder card */}
          <div className="contact-founder-card">
            <div className="contact-founder-avatar">P</div>
            <div>
              <div className="contact-founder-name">Prabh Narang</div>
              <div className="contact-founder-role">Founder · CoachFlow AI</div>
              <div className="contact-founder-desc">
                Built CoachFlow AI specifically for fitness coaches in India. Every message goes directly to me — no support team, no bots. I read and reply personally.
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="contact-form-col">

          {!sent ? (
            <div className="contact-form-card">
              <h2 className="contact-form-title">Send a message</h2>
              <p className="contact-form-sub">
                Fill this form and your message goes straight to Prabh's inbox.
                You'll also get a confirmation email.
              </p>

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form-row">
                  <div className="form-group">
                    <label className="form-label">Your Name *</label>
                    <input className="form-input" name="name" value={form.name}
                      onChange={handleChange} placeholder="e.g. Anmol Singh" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your Email *</label>
                    <input className="form-input" type="email" name="email" value={form.email}
                      onChange={handleChange} placeholder="you@gmail.com" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">What's it about?</label>
                  <select className="form-input" name="subject" value={form.subject} onChange={handleChange}>
                    {SUBJECTS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Your message *</label>
                  <textarea
                    className="form-textarea"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell me what you need help with. Be as detailed as you like — the more context, the faster I can help."
                  />
                </div>

                <button type="submit" className="contact-submit-btn" disabled={sending}>
                  {sending ? (
                    <><span className="spinner" /> Sending…</>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="contact-sent-card">
              <div className="contact-sent-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#47ffa4" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3>Message sent! ✉️</h3>
              <p>
                Thanks <strong>{form.name}</strong>! Your message has been sent to Prabh.
                Check <strong>{form.email}</strong> for a confirmation.
                You'll get a reply within 2 hours.
              </p>
              <button
                className="btn btn-ghost"
                onClick={() => { setSent(false); setForm({ name:'', email:'', subject:'', message:'' }); }}>
                Send another message
              </button>
            </div>
          )}

          {/* FAQs */}
          <div className="contact-faq">
            <h3 className="contact-faq-title">Questions coaches ask us</h3>
            {FAQS.map((item, i) => (
              <div key={i} className={`contact-faq-item ${openFaq === i ? 'contact-faq-open' : ''}`}>
                <button className="contact-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)} type="button">
                  <span>{item.q}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round"
                    style={{ flexShrink: 0, transition: 'transform 0.25s', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="contact-faq-a">{item.a}</div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
