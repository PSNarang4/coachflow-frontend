import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './PublicForm.css';

const DEFAULT_PHOTOS = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80',
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=900&q=80',
];

const GOAL_OPTIONS = [
  'Improved Health', 'Tone Up', 'Increased Strength',
  'Increased Muscle Mass', 'Fat Loss', 'Weight Gain', 'Build Gym Confidence',
];

const STEPS = [
  { id: 1, label: 'Personal details' },
  { id: 2, label: 'Work and lifestyle' },
  { id: 3, label: 'Health' },
  { id: 4, label: 'Goals' },
  { id: 5, label: 'Training background' },
  { id: 6, label: 'Commitment' },
];

const EMPTY_FORM = {
  // Step 1
  name: '', gender: '', dob: '', age: '', height: '', weight: '', phone: '', email: '',
  // Step 2
  occupation: '', workSchedule: '',
  // Step 3
  healthConditions: '', medications: '', injuries: '', hasStress: '', readiness: '',
  // Step 4
  goalTypes: [], trainingGoal: '', whyGoal: '',
  // Step 5
  currentlyExercising: '', hadPersonalTrainer: '',
  // Step 6
  commitment: '', additionalInfo: '',
};

export default function PublicForm() {
  const { clientId } = useParams();
  const [coach, setCoach]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep]             = useState(1);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    API.get(`/leads/public/${clientId}`)
      .then(({ data }) => setCoach(data.coach))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [clientId]);

  const photos = coach?.photos?.length > 0 ? coach.photos : DEFAULT_PHOTOS;

  // Auto-cycle photos every 6s
  useEffect(() => {
    const t = setInterval(() => setActivePhoto(p => (p + 1) % photos.length), 6000);
    return () => clearInterval(t);
  }, [photos.length]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const toggleGoal = (goal) => {
    setForm(f => ({
      ...f,
      goalTypes: f.goalTypes.includes(goal)
        ? f.goalTypes.filter(g => g !== goal)
        : [...f.goalTypes, goal],
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim()) { toast.error('Full name is required'); return false; }
      if (!form.email.trim()) { toast.error('Email is required'); return false; }
    }
    if (step === 4) {
      if (form.goalTypes.length === 0) { toast.error('Please select at least one goal'); return false; }
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step < STEPS.length) { setStep(s => s + 1); window.scrollTo(0,0); }
  };

  const prev = () => { if (step > 1) { setStep(s => s - 1); window.scrollTo(0,0); } };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const payload = {
        name:  form.name,
        email: form.email,
        phone: form.phone,
        goal:  form.goalTypes.join(', ') + (form.trainingGoal ? ` — ${form.trainingGoal}` : ''),
        notes: buildNotes(form),
      };
      await API.post(`/leads/public/${clientId}`, payload);
      setSubmitted(true);
      window.scrollTo(0,0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  const buildNotes = (f) => [
    f.gender     && `Gender: ${f.gender}`,
    f.dob        && `DOB: ${f.dob}`,
    f.age        && `Age: ${f.age}`,
    f.height     && `Height: ${f.height}`,
    f.weight     && `Weight: ${f.weight}`,
    f.occupation && `Occupation: ${f.occupation}`,
    f.workSchedule && `Work schedule: ${f.workSchedule}`,
    f.healthConditions && `Health conditions: ${f.healthConditions}`,
    f.medications  && `Medications: ${f.medications}`,
    f.injuries     && `Injuries: ${f.injuries}`,
    f.hasStress    && `Stress/motivation issues: ${f.hasStress}`,
    f.readiness    && `Readiness for change: ${f.readiness}/10`,
    f.whyGoal      && `Why they want to change: ${f.whyGoal}`,
    f.currentlyExercising && `Currently exercising: ${f.currentlyExercising}`,
    f.hadPersonalTrainer  && `Had personal trainer: ${f.hadPersonalTrainer}`,
    f.commitment   && `Commitment: ${f.commitment}`,
    f.additionalInfo && `Additional info: ${f.additionalInfo}`,
  ].filter(Boolean).join('\n');

  if (loading) return (
    <div className="pf-loading-screen">
      <div className="pf-spinner" />
    </div>
  );

  if (notFound) return (
    <div className="pf-not-found">
      <div className="pf-nf-card">
        <span>🔍</span>
        <h2>Page not found</h2>
        <p>This coaching profile doesn't exist or the link may be incorrect.</p>
      </div>
    </div>
  );

  const coachName = coach?.businessName || coach?.name || 'Your Coach';
  const coachFirst = coach?.name?.split(' ')[0] || 'your coach';
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  if (submitted) return (
    <div className="pf-submitted">
      <div className="pf-submitted-card">
        <div className="pf-submitted-check">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2>Application submitted! 💪</h2>
        <p>Thanks <strong>{form.name}</strong>. {coachFirst} will review your application and get back to you personally.</p>
      </div>
    </div>
  );

  return (
    <div className="pf-root">
      {/* ── Top nav bar ── */}
      <nav className="pf-nav">
        <div className="pf-nav-brand">
          <div className="pf-nav-logo">{coachName.charAt(0)}</div>
          <div>
            <div className="pf-nav-name">{coachName}</div>
            <div className="pf-nav-sub">Online Coaching</div>
          </div>
        </div>
        <a href={`/form/${clientId}`} className="pf-nav-back">Back to site</a>
      </nav>

      <div className="pf-body">
        {/* ── LEFT: Coach photo panel ── */}
        <div className="pf-left">
          <div className="pf-photo-wrap">
            {photos.map((src, i) => (
              <div key={i}
                className={`pf-photo-layer ${i === activePhoto ? 'pf-photo-layer-active' : ''}`}
                style={{ backgroundImage: `url(${src})` }}
              />
            ))}
            <div className="pf-photo-overlay">
              <div className="pf-overlay-tag">Consultation Form</div>
              <h1 className="pf-overlay-title">Apply for {coachName}.</h1>
              <p className="pf-overlay-desc">
                Fill this out properly so {coachFirst} can understand your goals, lifestyle,
                training history, and what kind of support you need. The more honest you are, the better {coachFirst} can help.
              </p>
              <div className="pf-overlay-bullets">
                <div className="pf-overlay-bullet">Customized training and nutrition based on your real life.</div>
                <div className="pf-overlay-bullet">Clear structure, accountability, and a plan that actually fits.</div>
              </div>
            </div>
            {/* Photo dots */}
            {photos.length > 1 && (
              <div className="pf-photo-dots">
                {photos.map((_, i) => (
                  <span key={i}
                    className={`pf-photo-dot ${i === activePhoto ? 'pf-photo-dot-active' : ''}`}
                    
                  />
                ))}
              </div>
            )}
          </div>
          <div className="pf-left-footer">
            Customized coaching. Real structure. Real results.
          </div>
        </div>

        {/* ── RIGHT: Step form ── */}
        <div className="pf-right">
          {/* Step-by-step header */}
          <div className="pf-step-header">
            <div className="pf-step-label-top">STEP BY STEP</div>
            <p className="pf-step-desc">
              This is your full intake form. It is broken into smaller sections so it feels easier to complete on your phone.
            </p>
            <div className="pf-step-meta">
              <span>Step {step} of {STEPS.length}</span>
              <span>{STEPS[step-1].label}</span>
            </div>
            <div className="pf-progress-bar">
              <div className="pf-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Step content */}
          <div className="pf-step-content">

            {/* ── STEP 1: Personal Details ── */}
            {step === 1 && (
              <div className="pf-step-card">
                <h2 className="pf-step-title">Personal Details</h2>
                <p className="pf-step-subtitle">Start with the basics so {coachFirst} knows who you are and how to contact you.</p>

                <div className="pf-field-row">
                  <div className="pf-field">
                    <label className="pf-label">FULL NAME</label>
                    <input className="pf-input" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
                  </div>
                  <div className="pf-field">
                    <label className="pf-label">GENDER</label>
                    <select className="pf-input" name="gender" value={form.gender} onChange={handleChange}>
                      <option value="">Select one</option>
                      <option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="pf-field-row pf-field-row-3">
                  <div className="pf-field">
                    <label className="pf-label">DATE OF BIRTH</label>
                    <input className="pf-input" type="date" name="dob" value={form.dob} onChange={handleChange} />
                  </div>
                  <div className="pf-field">
                    <label className="pf-label">AGE</label>
                    <input className="pf-input" type="number" name="age" value={form.age} onChange={handleChange} placeholder="Years" min="10" max="100" />
                  </div>
                  <div className="pf-field">
                    <label className="pf-label">HEIGHT</label>
                    <input className="pf-input" name="height" value={form.height} onChange={handleChange} placeholder="e.g. 5'10" />
                  </div>
                </div>

                <div className="pf-field-row">
                  <div className="pf-field">
                    <label className="pf-label">WEIGHT</label>
                    <input className="pf-input" name="weight" value={form.weight} onChange={handleChange} placeholder="If unknown that's okay" />
                  </div>
                  <div className="pf-field">
                    <label className="pf-label">PHONE NUMBER</label>
                    <input className="pf-input" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 00000 00000" />
                  </div>
                </div>

                <div className="pf-field">
                  <label className="pf-label">EMAIL</label>
                  <input className="pf-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                </div>
              </div>
            )}

            {/* ── STEP 2: Work & Lifestyle ── */}
            {step === 2 && (
              <div className="pf-step-card">
                <h2 className="pf-step-title">Work and Lifestyle</h2>
                <p className="pf-step-subtitle">Your routine matters because your coaching plan has to fit real life, not a perfect day.</p>

                <div className="pf-field">
                  <label className="pf-label">WHAT DO YOU DO FOR A LIVING?</label>
                  <textarea className="pf-textarea" name="occupation" value={form.occupation} onChange={handleChange}
                    placeholder="Describe your job or daily work..." rows={4} />
                </div>

                <div className="pf-field">
                  <label className="pf-label">DO YOU FOLLOW A REGULAR WORKING SCHEDULE, DO YOU WORK DAYS, AFTERNOON OR NIGHTS?</label>
                  <textarea className="pf-textarea" name="workSchedule" value={form.workSchedule} onChange={handleChange}
                    placeholder="Describe your typical working hours and schedule..." rows={4} />
                </div>
              </div>
            )}

            {/* ── STEP 3: Health ── */}
            {step === 3 && (
              <div className="pf-step-card">
                <h2 className="pf-step-title">Health</h2>
                <p className="pf-step-subtitle">{coachFirst} needs to know if there is anything important that could affect training, recovery, or nutrition.</p>

                <div className="pf-field">
                  <label className="pf-label">IF YOU HAVE ANY DIAGNOSED HEALTH PROBLEMS LIST THE CONDITION(S).</label>
                  <textarea className="pf-textarea" name="healthConditions" value={form.healthConditions} onChange={handleChange}
                    placeholder="List any diagnosed conditions, or write 'None'..." rows={3} />
                </div>

                <div className="pf-field">
                  <label className="pf-label">IF YOU ARE ON ANY MEDICATIONS, PLEASE LIST THEM.</label>
                  <textarea className="pf-textarea" name="medications" value={form.medications} onChange={handleChange}
                    placeholder="List medications, or write 'None'..." rows={3} />
                </div>

                <div className="pf-field">
                  <label className="pf-label">IF YOU HAVE ANY INJURIES, PLEASE LIST THEM.</label>
                  <textarea className="pf-textarea" name="injuries" value={form.injuries} onChange={handleChange}
                    placeholder="List injuries, or write 'None'..." rows={3} />
                </div>

                <div className="pf-field">
                  <label className="pf-label">ARE YOU EXPERIENCING ANY STRESSES OR MOTIVATIONAL PROBLEMS?</label>
                  <div className="pf-radio-row">
                    {['Yes', 'No'].map(opt => (
                      <label key={opt} className={`pf-radio-btn ${form.hasStress === opt ? 'pf-radio-active' : ''}`}>
                        <input type="radio" name="hasStress" value={opt} checked={form.hasStress === opt} onChange={handleChange} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pf-field">
                  <label className="pf-label">PLEASE RATE YOUR READINESS FOR CHANGE</label>
                  <div className="pf-scale-row">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <label key={n} className={`pf-scale-btn ${form.readiness === String(n) ? 'pf-scale-active' : ''}`}>
                        <input type="radio" name="readiness" value={n} checked={form.readiness === String(n)} onChange={handleChange} />
                        {n}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: Goals ── */}
            {step === 4 && (
              <div className="pf-step-card">
                <h2 className="pf-step-title">Goals</h2>
                <p className="pf-step-subtitle">Tell {coachFirst} what you want and why it matters to you.</p>

                <div className="pf-field">
                  <label className="pf-label">WHAT FOLLOWING GOALS DOES BEST FIT IN WITH YOUR GOALS?</label>
                  <div className="pf-checkbox-grid">
                    {GOAL_OPTIONS.map(goal => (
                      <label key={goal} className={`pf-checkbox-btn ${form.goalTypes.includes(goal) ? 'pf-checkbox-active' : ''}`}>
                        <input type="checkbox" checked={form.goalTypes.includes(goal)} onChange={() => toggleGoal(goal)} />
                        <span className="pf-checkbox-box">
                          {form.goalTypes.includes(goal) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </span>
                        {goal}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pf-field">
                  <label className="pf-label">WHAT IS YOUR GOAL WITH YOUR TRAINING?</label>
                  <textarea className="pf-textarea" name="trainingGoal" value={form.trainingGoal} onChange={handleChange}
                    placeholder="Describe your specific training goal in detail..." rows={4} />
                </div>

                <div className="pf-field">
                  <label className="pf-label">WHY?</label>
                  <textarea className="pf-textarea" name="whyGoal" value={form.whyGoal} onChange={handleChange}
                    placeholder="Why is this goal important to you? What will change in your life when you achieve it?" rows={4} />
                </div>
              </div>
            )}

            {/* ── STEP 5: Training Background ── */}
            {step === 5 && (
              <div className="pf-step-card">
                <h2 className="pf-step-title">Training Background</h2>
                <p className="pf-step-subtitle">This helps {coachFirst} understand where you're starting from and what kind of programming will suit you best.</p>

                <div className="pf-field-row">
                  <div className="pf-field">
                    <label className="pf-label">ARE YOU CURRENTLY EXERCISING?</label>
                    <div className="pf-radio-row">
                      {['Yes', 'No'].map(opt => (
                        <label key={opt} className={`pf-radio-btn ${form.currentlyExercising === opt ? 'pf-radio-active' : ''}`}>
                          <input type="radio" name="currentlyExercising" value={opt} checked={form.currentlyExercising === opt} onChange={handleChange} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="pf-field">
                    <label className="pf-label">HAVE YOU TRAINED WITH A PERSONAL TRAINER BEFORE?</label>
                    <div className="pf-radio-row">
                      {['Yes', 'No'].map(opt => (
                        <label key={opt} className={`pf-radio-btn ${form.hadPersonalTrainer === opt ? 'pf-radio-active' : ''}`}>
                          <input type="radio" name="hadPersonalTrainer" value={opt} checked={form.hadPersonalTrainer === opt} onChange={handleChange} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 6: Commitment ── */}
            {step === 6 && (
              <div className="pf-step-card">
                <h2 className="pf-step-title">Commitment</h2>
                <p className="pf-step-subtitle">The last step. Be honest — this helps {coachFirst} understand how to support you best.</p>

                <div className="pf-field">
                  <label className="pf-label">HOW COMMITTED ARE YOU TO MAKING A CHANGE RIGHT NOW?</label>
                  <textarea className="pf-textarea" name="commitment" value={form.commitment} onChange={handleChange}
                    placeholder="Tell your coach honestly how ready you are, what might get in the way, and what you're willing to do..." rows={5} />
                </div>

                <div className="pf-field">
                  <label className="pf-label">IS THERE ANYTHING ELSE YOU WANT {coachFirst.toUpperCase()} TO KNOW?</label>
                  <textarea className="pf-textarea" name="additionalInfo" value={form.additionalInfo} onChange={handleChange}
                    placeholder="Anything else that's important to mention — lifestyle, preferences, past experiences..." rows={5} />
                </div>
              </div>
            )}

          </div>

          {/* ── Navigation bar ── */}
          <div className="pf-nav-bar">
            <div className="pf-nav-left">
              <button
                className={`pf-btn-prev ${step === 1 ? 'pf-btn-disabled' : ''}`}
                onClick={prev} type="button" disabled={step === 1}>
                Previous<br/>step
             </button>
            </div>

            <div className="pf-nav-hint">
              Take your time and answer each question honestly. The more detail you share, the better your coaching experience will be.
            </div>

            <div className="pf-nav-right">
              {step < STEPS.length && (
                <button className="pf-btn-next" onClick={next} type="button">
                  Next<br/>step
                 </button>
              )}
              {step === STEPS.length && (
                <button className="pf-btn-submit" onClick={handleSubmit} type="button" disabled={submitting}>
                  {submitting ? <><span className="pf-spinner" /> Sending…</> : <>Submit<br/>application</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
