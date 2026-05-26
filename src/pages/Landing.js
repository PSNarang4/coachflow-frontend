import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import LogoIcon from '../assets/LogoIcon';
import './Landing.css';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=1800&q=80';

const FOUNDER_IMAGE = '/founder-prabh.jpg';

const PROBLEMS = [
  'Lost DMs',
  'Missed follow-ups',
  'Scattered payments',
  'No revenue clarity',
];

const FEATURES = [
  {
    label: 'Lead capture',
    title: 'Form link',
    text: 'Share in bio or WhatsApp. New prospects land in Leads.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M16 11l2 2 4-4"/>
      </svg>
    ),
  },
  {
    label: 'Lead management',
    title: 'Pipeline',
    text: 'Track status, priority, notes, and contact details.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    label: 'Members',
    title: 'Members',
    text: 'Plans, payments, renewals, and attendance stay together.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 7a4 4 0 1 0 0 8"/><path d="M16 7a4 4 0 1 1 0 8"/><path d="M4 21v-1a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v1"/>
      </svg>
    ),
  },
  {
    label: 'AI analytics',
    title: 'AI insights',
    text: 'Score leads, draft replies, and read revenue signals.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
];

const HOW_TO_USE = [
  {
    title: 'Capture leads',
    steps: [
      'Create account.',
      'Copy form link.',
      'Share in bio or chats.',
      'Open Leads.',
    ],
  },
  {
    title: 'Follow up and close',
    steps: [
      'Update status.',
      'Check AI score.',
      'Send better replies.',
    ],
  },
  {
    title: 'Manage members',
    steps: [
      'Add plan.',
      'Mark attendance.',
      'Review revenue.',
    ],
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
  const isInView = useInView(ref, { once: true, amount: 0.1 });
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
        style={{ backgroundImage: `linear-gradient(90deg, rgba(10,10,15,0.94) 0%, rgba(10,10,15,0.76) 45%, rgba(10,10,15,0.24) 100%), url(${HERO_IMAGE})` }}
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
              CRM for online fitness coaches
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
              Capture leads, manage members, track attendance, and see revenue in one dashboard.
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
                <strong>Form</strong>
                <span>lead link</span>
              </div>
              <div>
                <strong>Members</strong>
                <span>plans</span>
              </div>
              <div>
                <strong>AI</strong>
                <span>insights</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatedSection className="landing-simple" aria-label="What CoachFlow does">
        <motion.div className="landing-section-heading" variants={fadeUp}>
          <p>Simple explanation</p>
          <h2>One place for leads, members, attendance, and money.</h2>
        </motion.div>
        <div className="landing-simple-layout">
          <motion.div className="landing-simple-copy" variants={fadeUp}>
            <h3>No more hunting through chats, sheets, notes, and reminders.</h3>
            <p>
              A prospect fills your form. You follow up, close, manage their plan, and see the numbers.
            </p>
          </motion.div>
          <motion.div className="landing-simple-visual" variants={fadeUp}>
            <div className="landing-app-window">
              <div className="landing-window-top">
                <span />
                <span />
                <span />
              </div>
              <div className="landing-pipeline-row">
                <div>
                  <span>Lead</span>
                  <strong>62</strong>
                </div>
                <div>
                  <span>Members</span>
                  <strong>18</strong>
                </div>
                <div>
                  <span>Revenue</span>
                  <strong>+24%</strong>
                </div>
              </div>
              <div className="landing-progress-stack">
                <span style={{ '--w': '82%' }} />
                <span style={{ '--w': '58%' }} />
                <span style={{ '--w': '72%' }} />
              </div>
            </div>
            <div className="landing-problem-list" aria-label="Problems CoachFlow solves">
              {PROBLEMS.map((problem, i) => (
                <motion.div className="landing-problem" key={problem} variants={fadeUp} custom={i}>
                  <span>0{i + 1}</span>
                  <p>{problem}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="landing-flow" aria-label="How CoachFlow helps">
        <motion.div className="landing-section-heading" variants={fadeUp}>
          <p>What you get</p>
          <h2>From interested prospect to paid member.</h2>
        </motion.div>
        <motion.div className="landing-flow-visual" variants={fadeUp}>
          <span>Form</span>
          <i />
          <span>Lead</span>
          <i />
          <span>Member</span>
          <i />
          <span>Revenue</span>
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

      <AnimatedSection className="landing-how" aria-label="How to use CoachFlow">
        <motion.div className="landing-section-heading landing-how-heading" variants={fadeUp}>
          <p>How to use it</p>
          <h2>Four minutes to start. Daily work gets cleaner.</h2>
        </motion.div>
        <motion.div className="landing-how-grid" variants={staggerContainer}>
          {HOW_TO_USE.map((group, groupIndex) => (
            <motion.article className="landing-how-card" key={group.title} variants={fadeUp} custom={groupIndex}>
              <div className="landing-how-number">0{groupIndex + 1}</div>
              <h3>{group.title}</h3>
              <ol>
                {group.steps.map(step => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </motion.article>
          ))}
        </motion.div>
      </AnimatedSection>

      <AnimatedSection className="landing-founder" aria-label="About the founder">
        <motion.div className="landing-founder-visual" variants={fadeUp}>
          <div className="landing-founder-photo-shell">
            <img className="landing-founder-photo" src={FOUNDER_IMAGE} alt="Prabh Narang, founder of CoachFlow AI" />
          </div>
          <div className="landing-founder-card-copy">
            <div className="landing-founder-name">Prabh Narang</div>
            <div className="landing-founder-role">Founder, CoachFlow AI</div>
          </div>
        </motion.div>
        <motion.div className="landing-founder-copy" variants={fadeUp}>
          <p>About the founder</p>
          <h2>Built close to the coaching problem.</h2>
          <p>
            Prabh built CoachFlow for coaches losing leads in chats and sheets. The goal stays simple: capture, follow up, manage members, understand revenue.
          </p>
          <div className="landing-founder-points">
            <span>Instagram and WhatsApp friendly</span>
            <span>Founder-led support</span>
            <span>Built for fitness workflows</span>
          </div>
        </motion.div>
      </AnimatedSection>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <LogoIcon size={28} />
            <span><strong>COACH</strong>FLOW AI</span>
          </div>
          <p className="landing-footer-copy">&copy; {new Date().getFullYear()} CoachFlow AI.</p>
        </div>
      </footer>
    </main>
  );
}
