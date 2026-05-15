import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import PhotoUploader from '../components/PhotoUploader';
import '../components/PhotoUploader.css';
import '../components/PhoneInput.css';
import './AccountSettings.css';

const Section = ({ title, subtitle, children }) => (
  <div className="as-section">
    <div className="as-section-header">
      <h3 className="as-section-title">{title}</h3>
      {subtitle && <p className="as-section-sub">{subtitle}</p>}
    </div>
    <div className="as-section-body">{children}</div>
  </div>
);

export default function AccountSettings() {
  const { user, updateUser } = useAuth();

  // Profile fields
  const [name,         setName]         = useState(user?.name         || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [tagline,      setTagline]      = useState(user?.tagline      || '');
  const [slug,         setSlug]         = useState(user?.slug         || '');
  const [photos,       setPhotos]       = useState(user?.photos       || []);

  // Email change with OTP
  const [newEmail,      setNewEmail]      = useState(user?.email || '');
  const [emailOTP,      setEmailOTP]      = useState('');
  const [emailOTPSent,  setEmailOTPSent]  = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  const [emailLoading,  setEmailLoading]  = useState(false);

  // Password change
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd,     setNewPwd]     = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showPwd,    setShowPwd]    = useState(false);

  const [saving, setSaving] = useState(false);

  // ── Email OTP flow
  const handleSendEmailOTP = async () => {
    // If OTP already sent, this button = Verify
    if (emailOTPSent && emailOTP) {
      setEmailLoading(true);
      try {
        await API.post('/auth/verify-otp', { type: 'email', otp: emailOTP });
        setEmailVerified(true);
        setEmailOTPSent(false);
        toast.success('Email verified!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Invalid OTP');
      } finally { setEmailLoading(false); }
      return;
    }
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || cleanEmail === user?.email) { toast.error('Enter a new email address'); return; }
    setEmailLoading(true);
    try {
      const { data } = await API.post('/auth/send-otp', { type: 'email', value: cleanEmail });
      setEmailOTPSent(true);
      setEmailVerified(false);
      toast.success(`OTP sent to ${cleanEmail}${data.devOTP ? ` (dev: ${data.devOTP})` : ''}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setEmailLoading(false); }
  };

  // ── Save profile
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload = { name, businessName, tagline, photos, slug };

      if (newEmail !== user?.email) {
        if (!emailVerified) { toast.error('Please verify new email first'); setSaving(false); return; }
        payload.email    = newEmail.trim().toLowerCase();
        payload.emailOTP = emailOTP;
      }

      const { data } = await API.put('/auth/profile', payload);
      updateUser(data.user);
      // Sync local state back to the Cloudinary URLs returned by the server
      // (replaces any base64 data URLs with permanent Cloudinary URLs)
      setPhotos(data.user.photos || []);
      setName(data.user.name || '');
      setBusinessName(data.user.businessName || '');
      setTagline(data.user.tagline || '');
      setSlug(data.user.slug || '');
      toast.success('Profile updated!');
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        toast.error('Upload timed out — try a smaller photo or check your connection.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to save. Please try again.');
      }
    } finally { setSaving(false); }
  };

  // ── Change password
  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) { toast.error('Fill in all password fields'); return; }
    if (newPwd !== confirmPwd) { toast.error('New passwords do not match'); return; }
    setPwdLoading(true);
    try {
      await API.put('/auth/profile', { password: currentPwd, newPassword: newPwd });
      toast.success('Password changed successfully!');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setPwdLoading(false); }
  };

  const emailChanged = newEmail !== user?.email;
  const formIdentifier = user?.slug || user?.id;
  const publicLink = `${window.location.origin}/form/${formIdentifier}`;

  return (
    <div className="account-settings">
      <div className="as-header">
        <div className="as-header-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>
        <div>
          <h1 className="as-title">Account Settings</h1>
          <p className="as-subtitle">Manage your profile, photos, and security settings</p>
        </div>
      </div>

      {/* ── Profile Photos ── */}
      <Section
        title="Profile Photos"
        subtitle="These appear on your public lead capture page. Recommended: 1080×1350px portrait or 1080×1080px square. Max 10MB each.">
        <PhotoUploader photos={photos} onChange={setPhotos} label="Your photos (up to 3)" />
      </Section>

      {/* ── Basic Info ── */}
      <Section title="Basic Information" subtitle="Update your name, business name, tagline, and public URL.">
        <div className="as-grid-2">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={name}
              onChange={e => setName(e.target.value)} placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label className="form-label">Business Name</label>
            <input className="form-input" value={businessName}
              onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Prabh Fitness" />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 12 }}>
          <label className="form-label">
            Your URL Slug
            <span className="as-char-count">→ /form/{slug || '…'}</span>
          </label>
          <div className="as-slug-wrap">
            <span className="as-slug-prefix">/form/</span>
            <input className="form-input as-slug-input" value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
              placeholder="prabhfitness" maxLength={24} />
          </div>
          <span className="as-slug-hint">Letters and numbers only. e.g. "prabhfitness" → yoursite.com/form/prabhfitness</span>
        </div>

        <div className="form-group" style={{ marginTop: 12 }}>
          <label className="form-label">Tagline <span className="as-char-count">{tagline.length}/120</span></label>
          <input className="form-input" value={tagline}
            onChange={e => setTagline(e.target.value.slice(0, 120))}
            placeholder="e.g. Transform your body. Transform your life." />
        </div>
      </Section>

      {/* ── Email (with OTP) ── */}
      <Section title="Email Address" subtitle="Changing your email requires OTP verification sent to the new address.">
        <div className="as-otp-field">
          <div className="as-otp-input-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                value={newEmail}
                onChange={e => {
                  setNewEmail(e.target.value);
                  setEmailVerified(false);
                  setEmailOTPSent(false);
                  setEmailOTP('');
                }}
                placeholder="you@example.com"
              />
            </div>
            {emailChanged && !emailVerified && (
              <button
                className="btn btn-ghost btn-sm as-send-otp-btn"
                onClick={handleSendEmailOTP}
                disabled={emailLoading || !newEmail}>
                {emailLoading
                  ? <span className="spinner" style={{ width: 14, height: 14 }} />
                  : emailOTPSent ? 'Verify OTP' : 'Send OTP'}
              </button>
            )}
            {emailVerified && emailChanged && (
              <span className="as-verified-badge">✓ Verified</span>
            )}
          </div>
          {emailOTPSent && !emailVerified && (
            <div className="as-otp-verify-row">
              <input
                className="form-input as-otp-code"
                placeholder="Enter 6-digit OTP from email"
                maxLength={6}
                inputMode="numeric"
                value={emailOTP}
                onChange={e => setEmailOTP(e.target.value.replace(/\D/g, ''))}
              />
              <button className="btn btn-primary btn-sm" onClick={handleSendEmailOTP}>Verify</button>
            </div>
          )}
        </div>
      </Section>

      {/* ── Save button ── */}
      <div className="as-save-row">
        <button className="btn btn-primary as-save-btn" onClick={handleSaveProfile} disabled={saving}>
          {saving
            ? <><span className="spinner" /> {photos.some(p => p.startsWith('data:')) ? 'Uploading photos…' : 'Saving…'}</>
            : 'Save Changes'}
        </button>
      </div>

      {/* ── Change Password ── */}
      <Section
        title="Change Password"
        subtitle="Must be 8+ characters with uppercase, lowercase, number & special character.">
        <div className="as-pwd-grid">
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input className="form-input" type={showPwd ? 'text' : 'password'}
              value={currentPwd} onChange={e => setCurrentPwd(e.target.value)}
              placeholder="Current password" />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-input" type={showPwd ? 'text' : 'password'}
              value={newPwd} onChange={e => setNewPwd(e.target.value)}
              placeholder="New password" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input className="form-input" type={showPwd ? 'text' : 'password'}
              value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
              placeholder="Confirm new password" />
          </div>
        </div>
        <div className="as-pwd-actions">
          <label className="auth-otp-toggle" style={{ fontSize: 12 }}>
            <input type="checkbox" checked={showPwd} onChange={e => setShowPwd(e.target.checked)} />
            <span className="auth-otp-toggle-check">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
            <span>Show passwords</span>
          </label>
          <button className="btn btn-primary" onClick={handleChangePassword} disabled={pwdLoading}>
            {pwdLoading ? <><span className="spinner" /> Changing…</> : 'Change Password'}
          </button>
        </div>
      </Section>

      {/* ── Public Link ── */}
      <Section title="Your Public Lead Form" subtitle="Share this link with potential clients to capture their details.">
        <div className="as-link-box">
          <span className="as-link-text">{publicLink}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => {
            navigator.clipboard.writeText(publicLink);
            toast.success('Link copied!');
          }}>
            Copy
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 8 }}>
          Your phone number ({user?.phone || 'not set'}) was set during signup and cannot be changed here.
          Contact support if you need to update it.
        </p>
      </Section>
    </div>
  );
}
