import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
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

const stepVariants = {
  enter: { opacity: 0, x: 30, filter: 'blur(4px)' },
  center: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -30, filter: 'blur(4px)', transition: { duration: 0.25 } },
};

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function Login() {
  const { login, verifyLoginOTP, googleLogin } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const [form, setForm]         = useState({ email: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otpStage, setOtpStage] = useState(false);
  const [userId, setUserId]     = useState(null);
  const [devOTP, setDevOTP]     = useState('');
  const [otp, setOtp]           = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGoogleCredential = useCallback(async (response) => {
    if (!response?.credential) {
      toast.error('Google sign-in failed. Please try again.');
      return;
    }

    setGoogleLoading(true);
    try {
      await googleLogin(response.credential);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  }, [googleLogin, navigate]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || otpStage) return undefined;

    let cancelled = false;
    const renderGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });

      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'filled_black',
        size: 'large',
        shape: 'rectangular',
        text: 'continue_with',
        width: googleButtonRef.current.offsetWidth || 360,
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else {
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) existing.addEventListener('load', renderGoogleButton, { once: true });
      else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = renderGoogleButton;
        document.head.appendChild(script);
      }
    }

    return () => { cancelled = true; };
  }, [handleGoogleCredential, otpStage]);

  const startCooldown = () => {
    let t = 60;
    setResendCooldown(t);
    const iv = setInterval(() => { t--; setResendCooldown(t); if (t <= 0) clearInterval(iv); }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const result = await login(form.email.trim().toLowerCase(), form.password);
      if (result?.requiresOTP) {
        setUserId(result.userId);
        setOtpStage(true);
        if (result.devOTP) setDevOTP(result.devOTP);
        startCooldown();
        toast.success('OTP sent to your email!');
      } else {
        toast.success('Welcome back! 💪');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const result = await login(form.email.trim().toLowerCase(), form.password);
      if (result.devOTP) setDevOTP(result.devOTP);
      startCooldown();
      toast.success('New OTP sent!');
    } catch { toast.error('Failed to resend OTP'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { toast.error('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      await verifyLoginOTP(userId, otp);
      toast.success('Welcome back! 💪');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

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

        <AnimatePresence mode="wait">
          {!otpStage ? (
            <motion.div key="login" variants={stepVariants} initial="enter" animate="center" exit="exit">
              <div className="auth-header">
                <h1>Welcome back</h1>
                <p>Sign in to manage your leads. An OTP will be sent to your email for security.</p>
              </div>
              <div className="auth-oauth-section">
                {GOOGLE_CLIENT_ID ? (
                  <div className="auth-google-wrap">
                    <div ref={googleButtonRef} className="auth-google-button" />
                    {googleLoading && (
                      <div className="auth-google-loading">
                        <span className="spinner" />
                        Signing in...
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    className="auth-oauth-fallback"
                    onClick={() => toast.error('Google sign-in is not configured yet.')}
                  >
                    <span className="auth-google-mark">G</span>
                    <span>Continue with Google</span>
                  </button>
                )}
                <div className="auth-or-divider"><span>or</span></div>
              </div>
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" name="email" value={form.email}
                    onChange={handleChange} placeholder="you@example.com" autoComplete="email" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" name="password" value={form.password}
                    onChange={handleChange} placeholder="••••••••" autoComplete="current-password" />
                </div>
                <div className="auth-forgot-row">
                  <Link to="/forgot-password" className="auth-forgot-link">
                    Forgot password?
                  </Link>
                </div>
                <div className="auth-otp-notice">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  OTP verification is required every login for your security
                </div>
                <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                  {loading ? <><span className="spinner" /> Sending OTP...</> : 'Continue →'}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="otp" variants={stepVariants} initial="enter" animate="center" exit="exit">
              <div className="auth-header">
                <h1>Verify it's you</h1>
                <p>We sent a 6-digit code to <strong>{form.email}</strong></p>
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
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                  {loading ? <><span className="spinner" /> Verifying...</> : 'Sign In →'}
                </button>
                <div className="auth-resend-row">
                  <span>Didn't receive it?</span>
                  <button type="button" className={`auth-resend-btn ${resendCooldown > 0 ? 'auth-resend-disabled' : ''}`}
                    onClick={handleResend} disabled={resendCooldown > 0 || loading}>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
                <button type="button" className="auth-skip" onClick={() => setOtpStage(false)}>← Back</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/register" className="auth-link">Start free trial</Link>
        </p>
      </motion.div>
    </div>
  );
}
