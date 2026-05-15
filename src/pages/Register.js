import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';
import PhotoUploader from '../components/PhotoUploader';
import PhoneInput from '../components/PhoneInput';
import '../components/PhotoUploader.css';
import '../components/PhoneInput.css';
import './Auth.css';
import LogoIcon from '../assets/LogoIcon';

const BG_PHOTOS = [
  'https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=900&q=75',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=700&q=75',
  'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=700&q=75',
  'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=900&q=75',
  'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=700&q=75',
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

// ─── Steps: 1=credentials, 2=photos, 3=email-otp ─────────────────────────
export default function Register() {
  const navigate = useNavigate();

  const [step,    setStep]    = useState(1);
  const [form,    setForm]    = useState({ name:'', email:'', password:'', businessName:'', phone:'', tagline:'' });
  const [photos,  setPhotos]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // OTP step
  const [sessionId,      setSessionId]      = useState('');
  const [otp,            setOtp]            = useState('');
  const [devOTP,         setDevOTP]         = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const isPasswordValid = () => PASSWORD_RULES.every(r => r.re.test(form.password));

  const startCooldown = () => {
    let t = 60;
    setResendCooldown(t);
    const iv = setInterval(() => { t--; setResendCooldown(t); if (t <= 0) clearInterval(iv); }, 1000);
  };

  // ── STEP 1 → validate and go to step 2 ───────────────────────────────────
  const handleStep1 = e => {
    e.preventDefault();
    if (!form.name.trim())  { toast.error('Name is required'); return; }
    if (!form.email.trim()) { toast.error('Email is required'); return; }
    if (!form.password)     { toast.error('Password is required'); return; }
    if (!isPasswordValid()) { toast.error('Password does not meet all requirements'); return; }
    setStep(2);
  };

  // ── STEP 2 → send email OTP, go to step 3 ────────────────────────────────
  const initiateRegistration = async (skipPhotos = false) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register/initiate', {
        ...form,
        email: form.email.trim().toLowerCase(),
        photos: skipPhotos ? [] : photos,
      });
      setSessionId(data.sessionId);
      if (data.devOTP) setDevOTP(data.devOTP);
      startCooldown();
      setStep(3);
      toast.success('OTP sent to your email!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      toast.error(msg);
      if (msg.includes('already registered')) navigate('/login');
    } finally { setLoading(false); }
  };

  // ── STEP 3 → verify email OTP → create account ───────────────────────────
  const handleVerifyOTP = async e => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { toast.error('Enter the 6-digit OTP from your email'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register/complete', { sessionId, otp });
      localStorage.setItem('cf_token', data.token);
      localStorage.setItem('cf_user', JSON.stringify(data.user));
      toast.success('Welcome to CoachFlow AI! 🎉');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed';
      toast.error(msg);
      if (msg.includes('expired')) { setStep(1); }
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register/initiate', {
        ...form,
        email: form.email.trim().toLowerCase(),
        photos,
      });
      setSessionId(data.sessionId);
      if (data.devOTP) setDevOTP(data.devOTP);
      startCooldown();
      toast.success('New OTP sent!');
    } catch { toast.error('Failed to resend'); }
    finally { setLoading(false); }
  };

  const stepLabels = ['Your Details', 'Your Photos', 'Verify Email'];

  return (
    <div className="auth-page">
      <div className="auth-bg-photos">
        {BG_PHOTOS.map((src, i) => (
          <div key={i} className="auth-bg-photo" style={{ backgroundImage: `url(${src})` }} />
        ))}
      </div>
      <div className="auth-bg-overlay" />
      <div className="auth-bg-grain" />

      <div className={`auth-glass-card ${step === 2 ? 'auth-glass-card-wide' : ''}`}>
        {/* Logo */}
        <div className="auth-logo">
          <LogoIcon size={36} />
          <div>
            <div className="auth-logo-title"><span>COACH</span>FLOW AI</div>
            <div className="auth-logo-sub">Premium Fitness CRM</div>
          </div>
        </div>

        {/* Step indicators */}
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

        {/* ── STEP 1: Credentials ── */}
        {step === 1 && (
          <>
            <div className="auth-header">
              <h1>Create account</h1>
              <p>Start managing your leads — free forever.</p>
            </div>
            <form onSubmit={handleStep1} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" type="text" name="name"
                    value={form.name} onChange={handleChange} placeholder="Alex Johnson" />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Name</label>
                  <input className="form-input" type="text" name="businessName"
                    value={form.businessName} onChange={handleChange} placeholder="FitLife Studio" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email * <span style={{opacity:0.4,fontSize:11}}>(OTP will be sent here)</span></label>
                <input className="form-input" type="email" name="email"
                  value={form.email} onChange={handleChange} placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone <span style={{opacity:0.4,fontSize:11}}>(optional)</span></label>
                <PhoneInput name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div className="pwd-input-wrap">
                  <input className="form-input" type={showPwd ? 'text' : 'password'}
                    name="password" value={form.password} onChange={handleChange}
                    placeholder="Min. 8 chars" />
                  <button type="button" className="pwd-toggle" onClick={() => setShowPwd(p => !p)}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.password && <PasswordStrength password={form.password} />}
              </div>
              <button type="submit" className="btn btn-primary btn-lg auth-submit">
                Continue →
              </button>
            </form>
            <p className="auth-footer-text">
              Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </>
        )}

        {/* ── STEP 2: Photos ── */}
        {step === 2 && (
          <>
            <div className="auth-header">
              <h1>Add your photos</h1>
              <p>Upload 2–3 photos of you or your gym. Recommended: 1080×1350px portrait. Max 10MB each.</p>
            </div>
            <div className="auth-form">
              <PhotoUploader photos={photos} onChange={setPhotos} label="Your photos (up to 3)" />
              <div className="auth-divider-line" />
              <div className="form-group">
                <label className="form-label">
                  Your Tagline
                  <span style={{ opacity:0.4, marginLeft:6, fontSize:11 }}>{form.tagline.length}/120</span>
                </label>
                <input className="form-input" type="text" name="tagline"
                  value={form.tagline} onChange={handleChange}
                  placeholder="e.g. Transform your body. Transform your life."
                  maxLength={120} />
              </div>
              <div className="auth-btn-row">
                <button className="auth-btn-back" onClick={() => setStep(1)} type="button">← Back</button>
                <button className="btn btn-primary" type="button" disabled={loading || photos.length === 0}
                  onClick={() => initiateRegistration(false)}>
                  {loading ? <><span className="spinner" /> Sending OTP…</> : 'Continue →'}
                </button>
              </div>
              <button className="auth-skip" type="button" disabled={loading}
                onClick={() => initiateRegistration(true)}>
                Skip photos — add later
              </button>
            </div>
          </>
        )}

        {/* ── STEP 3: Email OTP ── */}
        {step === 3 && (
          <>
            <div className="auth-header">
              <h1>Check your email</h1>
              <p>We sent a 6-digit code to <strong>{form.email}</strong>. Enter it below to verify your account.</p>
            </div>

            {devOTP && (
              <div className="auth-dev-otp">
                <span>🛠 Dev OTP (not shown in production):</span>
                <strong>{devOTP}</strong>
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="auth-form">
              <div className="form-group">
                <label className="form-label">6-Digit OTP</label>
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
                {loading ? <><span className="spinner" /> Verifying…</> : 'Verify & Create Account →'}
              </button>
              <div className="auth-resend-row">
                <span>Didn't receive it?</span>
                <button type="button"
                  className={`auth-resend-btn ${resendCooldown > 0 ? 'auth-resend-disabled' : ''}`}
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleResend}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
