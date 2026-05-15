import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import LogoIcon from '../assets/LogoIcon';
import './Landing.css';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=1800&q=80';

const STUDIO_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80',
  'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=900&q=80',
];

const FEATURES = [
  {
    label: 'Lead capture',
    title: 'Turn every profile link into a polished intake funnel.',
    text: 'Share one public form, collect real coaching context, and keep new prospects organized from the first message.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: 'Coach CRM',
    title: 'See pipeline, priority, notes, and follow-up status together.',
    text: 'CoachFlow keeps your leads, goals, history, and next actions in one focused workspace built for fitness businesses.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    label: 'AI support',
    title: 'Draft sharper replies and spot the leads worth chasing.',
    text: 'Use AI summaries and outreach assistance to move faster without losing the personal tone your clients expect.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function AnimatedSection({ children, className, ...props }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <motion.section
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      {...props}
    >
      {children}
    </motion.section>
  );
}

export default function Landing() {
  return (
    <main className="landing-page">
      <section
        className="landing-hero"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(10,10,15,0.92) 0%, rgba(10,10,15,0.74) 43%, rgba(10,10,15,0.28) 100%), url(${HERO_IMAGE})` }}
      >
        <motion.nav
          className="landing-nav"
          aria-label="CoachFlow navigation"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link to="/" className="landing-brand" aria-label="CoachFlow AI home">
            <LogoIcon size={40} />
            <span><strong>COACH</strong>FLOW AI</span>
          </Link>
          <div className="landing-nav-actions">
            <Link to="/login" className="landing-link">Log in</Link>
            <Link to="/register" className="landing-nav-cta">Start free</Link>
          </div>
        </motion.nav>

        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <motion.p
              className="landing-kicker"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              Premium fitness CRM
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              CoachFlow AI
            </motion.h1>
            <motion.p
              className="landing-lede"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              The lead capture, client-intake, and AI follow-up workspace for coaches who want fewer missed prospects and cleaner client onboarding.
            </motion.p>
            <motion.div
              className="landing-cta-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to="/register" className="landing-cta landing-cta-primary">Create account</Link>
              <Link to="/login" className="landing-cta landing-cta-secondary">Sign in</Link>
            </motion.div>
            <motion.div
              className="landing-metrics"
              aria-label="Product highlights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div>
                <strong>14 days</strong>
                <span>free trial</span>
              </div>
              <div>
                <strong>1 link</strong>
                <span>for every lead</span>
              </div>
              <div>
                <strong>AI</strong>
                <span>follow-up help</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatedSection className="landing-flow" aria-label="How CoachFlow helps">
        <motion.div className="landing-section-heading" variants={fadeUp}>
          <p>Built for the real coaching workflow</p>
          <h2>From first interest to paid client, keep the whole conversation moving.</h2>
        </motion.div>
        <motion.div className="landing-feature-grid" variants={staggerContainer}>
          {FEATURES.map((feature, i) => (
            <motion.article
              className="landing-feature"
              key={feature.label}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -6, borderColor: 'rgba(232,255,71,0.28)', transition: { duration: 0.25 } }}
            >
              <div className="landing-feature-icon">{feature.icon}</div>
              <span>{feature.label}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </motion.article>
          ))}
        </motion.div>
      </AnimatedSection>

      <AnimatedSection className="landing-showcase" aria-label="Coach profile showcase">
        <motion.div className="landing-showcase-copy" variants={fadeUp}>
          <p>Public forms that feel like your brand</p>
          <h2>A polished intake experience before the client ever opens WhatsApp.</h2>
          <p>
            Your prospects get a premium coaching application. You get structured goals, contact details, training history, and notes ready inside the CRM.
          </p>
          <Link to="/register" className="landing-inline-cta">Launch your coaching CRM</Link>
        </motion.div>
        <motion.div
          className="landing-photo-strip"
          aria-hidden="true"
          variants={staggerContainer}
        >
          {STUDIO_IMAGES.map((src, index) => (
            <motion.div
              className="landing-strip-photo"
              key={src}
              style={{ backgroundImage: `url(${src})`, '--offset': `${index * 28}px` }}
              variants={fadeUp}
              custom={index}
            />
          ))}
        </motion.div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <LogoIcon size={28} />
            <span><strong>COACH</strong>FLOW AI</span>
          </div>
          <p className="landing-footer-copy">© {new Date().getFullYear()} CoachFlow AI. Built for coaches who mean business.</p>
        </div>
      </footer>
    </main>
  );
}
