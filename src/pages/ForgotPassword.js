import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './Auth.css';
import LogoIcon from '../assets/LogoIcon';

const BG_PHOTOS = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=75',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=700&q=75',
  'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=700&q=75',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=75',
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=700&q=75',
];

const PASSWORD_RULES = [
  { re: /.{8,}/,                                         label: '8+ characters'  },
  { re: /[A-Z]/,                                         label: 'Uppercase'       },
  { re: /[a-z]/,                                         label: 'Lowercase'       },
  { re: /[0-9]/,                                         label: 'Number'          },
  { re: /[^a-zA-Z0-9\s]/,                                label: 'Special char'    },
];

const PasswordStrength = ({ password }) => {
  const passed = PASSWORD_RULES.filter(r => r.re.test(password)).length;
  const colors = ['#ff4444', '#ff8800', '#ffcc00', '#88dd00', '#47ffa4'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  return (
    <div className="pwd-strength">
      <div className="pwd-bars">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="pwd-bar"
            style={{ background: i <= passed ? colors[passed-1] : 'rgba(255,255,255,0.08)' }} />
        ))}
      </div>
      <div className="pwd-rules">
        {PASSWORD_RULES.map((r, i) => (
          <span key={i} className={`pwd-rule ${r.re.test(password) ? 'pwd-rule-ok' : ''}`}>
            {r.re.test(password) ? '✓' : '○'} {r.label}
          </span>
        ))}
      </div>
      {password && <div className="pwd-label" style={{ color: colors[passed-1] }}>{labels[passed]}</div>}
    </div>
  );
};

const stepVariants = {
  enter: { opacity: 0, x: 30, filter: 'blur(4px)' },
  center: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -30, filter: 'blur(4px)', transition: { duration: 0.25 } },
};

export default function ForgotPassword() {

  const [step, setStep]       = useState(1); // 1=email, 2=otp, 3=new password, 4=success
  const [email, setEmail]     = useState('');
  const [otp, setOtp]         = useState('');
  const [devOTP, setDevOTP]   = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const isPasswordValid = () => PASSWORD_RULES.every(r => r.re.test(newPassword));

  const startCooldown = () => {
    let t = 60;
    setResendCooldown(t);
    const iv = setInterval(() => { t--; setResendCooldown(t); if (t <= 0) clearInterval(iv); }, 1000);
  };

  // Step 1: Check email & send OTP
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      if (data.devOTP) setDevOTP(data.devOTP);
      startCooldown();
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { toast.error('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      await API.post('/auth/forgot-password/verify-otp', { email: email.trim().toLowerCase(), otp });
      toast.success('OTP verified!');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) { toast.error('Please fill in both fields'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (!isPasswordValid()) { toast.error('Password does not meet requirements'); return; }
    setLoading(true);
    try {
      await API.post('/auth/forgot-password/reset', {
        email: email.trim().toLowerCase(),
        newPassword,
        confirmPassword,
      });
      toast.success('Password reset successfully! 🎉');
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally { setLoading(false); }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const { data } = await API.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      if (data.devOTP) setDevOTP(data.devOTP);
      startCooldown();
      toast.success('New OTP sent!');
    } catch { toast.error('Failed to resend OTP'); }
    finally { setLoading(false); }
  };

  const stepLabels = ['Email', 'Verify', 'Reset'];

  return (
    <div className="auth-page">
      <div className="auth-bg-photos">
        {BG_PHOTOS.map((src, i) => (
          <div key={i} className="auth-bg-photo" style={{ backgroundImage: `url(${src})` }} />
        ))}
      </div>
      <div className="auth-bg-overlay" /><div className="auth-bg-grain" />

      <motion.div
        className="auth-glass-card"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="auth-logo">
          <LogoIcon size={36} />
          <div>
            <div className="auth-logo-title"><span>COACH</span>FLOW AI</div>
            <div className="auth-logo-sub">Premium Fitness CRM</div>
          </div>
        </div>

        {/* Step indicators */}
        {step < 4 && (
          <div className="auth-steps">
            {stepLabels.map((label, i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <div className={`auth-step-line ${step > i ? 'auth-step-line-done' : ''}`} />
                )}
                <div className={`auth-step ${step === i+1 ? 'auth-step-active' : step > i+1 ? 'auth-step-done' : ''}`}>
                  <div className="auth-step-dot">
                    {step > i+1
                      ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : i+1}
                  </div>
                  <span>{label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ── STEP 1: Enter Email ── */}
          {step === 1 && (
            <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit">
              <div className="auth-header">
                <h1>Forgot password?</h1>
                <p>No worries. Enter the email you registered with and we'll send you a verification code.</p>
              </div>
              <form onSubmit={handleEmailSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" value={email}
                    onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" autoFocus />
                </div>
                <div className="auth-otp-notice">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  We'll check if your email is registered before sending the OTP
                </div>
                <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                  {loading ? <><span className="spinner" /> Checking...</> : 'Send OTP →'}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── STEP 2: Verify OTP ── */}
          {step === 2 && (
            <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit">
              <div className="auth-header">
                <h1>Verify your email</h1>
                <p>We sent a 6-digit code to <strong>{email}</strong></p>
              </div>
              {devOTP && (
                <div className="auth-dev-otp">
                  <span>🛠 Dev mode OTP:</span>
                  <strong>{devOTP}</strong>
                </div>
              )}
              <form onSubmit={handleVerifyOTP} className="auth-form">
                <div className="form-group">
                  <label className="form-label">OTP Code</label>
                  <input
                    className="form-input auth-otp-input"
                    type="text" inputMode="numeric" maxLength="6"
                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000" autoFocus
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                  {loading ? <><span className="spinner" /> Verifying...</> : 'Verify OTP →'}
                </button>
                <div className="auth-resend-row">
                  <span>Didn't receive it?</span>
                  <button type="button" className={`auth-resend-btn ${resendCooldown > 0 ? 'auth-resend-disabled' : ''}`}
                    onClick={handleResend} disabled={resendCooldown > 0 || loading}>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
                <button type="button" className="auth-skip" onClick={() => setStep(1)}>← Change email</button>
              </form>
            </motion.div>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === 3 && (
            <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit">
              <div className="auth-header">
                <h1>Set new password</h1>
                <p>Create a strong password for your account.</p>
              </div>
              <form onSubmit={handleResetPassword} className="auth-form">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="pwd-input-wrap">
                    <input className="form-input" type={showPwd ? 'text' : 'password'}
                      value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min. 8 chars" />
                    <button type="button" className="pwd-toggle" onClick={() => setShowPwd(p => !p)}>
                      {showPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {newPassword && <PasswordStrength password={newPassword} />}
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="pwd-input-wrap">
                    <input className="form-input" type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-type password" />
                    <button type="button" className="pwd-toggle" onClick={() => setShowConfirm(p => !p)}>
                      {showConfirm ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {confirmPassword && newPassword && confirmPassword !== newPassword && (
                    <div style={{ fontSize: 12, color: '#ff6b6b', marginTop: 4 }}>
                      Passwords do not match
                    </div>
                  )}
                  {confirmPassword && newPassword && confirmPassword === newPassword && (
                    <div style={{ fontSize: 12, color: '#47ffa4', marginTop: 4 }}>
                      ✓ Passwords match
                    </div>
                  )}
                </div>
                <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                  {loading ? <><span className="spinner" /> Resetting...</> : 'Reset Password →'}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── STEP 4: Success ── */}
          {step === 4 && (
            <motion.div key="step4" variants={stepVariants} initial="enter" animate="center" exit="exit">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className="forgot-success-icon"
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#47ffa4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{ fontFamily: 'var(--font-display)', fontSize: 34, letterSpacing: '0.04em', color: '#fff', marginTop: 20, marginBottom: 8 }}
                >
                  Password reset!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}
                >
                  Your password has been changed successfully. You can now sign in with your new password.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Link to="/login" className="btn btn-primary btn-lg auth-submit" style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none' }}>
                    Sign in now →
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="auth-footer-text">
          Remember your password? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
