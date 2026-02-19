'use client';
import { useEffect, useRef } from 'react';
import styles from './Sections.module.css';

/* ─── STATS STRIP ──────────────────────────────────────────────────────────── */
const STATS = [
  { num: '2.4M+', label: 'Posts Monitored Daily',    color: '#00e5ff' },
  { num: '98.6%', label: 'Detection Accuracy',        color: '#ff3b5c' },
  { num: '<90s',  label: 'Avg Detection Latency',     color: '#ffaa00' },
  { num: '24/7',  label: 'Continuous Surveillance',   color: '#00d68f' },
];

export function StatsStrip() {
  return (
    <div className={styles.statsStrip}>
      {STATS.map((s) => (
        <div key={s.label} className={styles.statCell}>
          <div className={styles.statNum} style={{ color: s.color }}>{s.num}</div>
          <div className={styles.statLabel}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── TICKER ───────────────────────────────────────────────────────────────── */
const TICKER_ITEMS = [
  { sev: 'CRITICAL', cls: 'c', text: 'Indian banking credential dump · hackforums.net · 2m ago' },
  { sev: 'HIGH',     cls: 'h', text: 'Phishing kit targeting IRCTC users · pastebin.com · 8m ago' },
  { sev: 'CRITICAL', cls: 'c', text: 'Ransomware targeting .gov.in domains · Telegram · 15m ago' },
  { sev: 'HIGH',     cls: 'h', text: 'Aadhaar API enumeration PoC shared · reddit.com · 22m ago' },
  { sev: 'MEDIUM',   cls: 'm', text: 'DDoS-for-hire against Indian ISPs · dark web · 41m ago' },
  { sev: 'CRITICAL', cls: 'c', text: 'ISRO contractor credentials exposed · pastebin.com · 55m ago' },
];

const sevCls = { c: styles.sevC, h: styles.sevH, m: styles.sevM };

function TickerItems() {
  return (
    <>
      {TICKER_ITEMS.map((t, i) => (
        <div key={i} className={styles.ti}>
          <span className={`${styles.tiBadge} ${sevCls[t.cls]}`}>{t.sev}</span>
          {t.text}
        </div>
      ))}
    </>
  );
}

export function Ticker() {
  return (
    <div className={styles.ticker}>
      <div className={styles.tickerTag}>
        <span className={styles.pulseDot} />
        Live Feed
      </div>
      <div className={styles.tickerScroll}>
        <div className={styles.tickerInner}>
          <TickerItems /><TickerItems />
        </div>
      </div>
    </div>
  );
}

/* ─── HOW IT WORKS ─────────────────────────────────────────────────────────── */
const STEPS = [
  {
    n: '01', icon: '🕷️', title: 'Scrape & Crawl',
    desc: 'Automated scrapers continuously monitor hackforums, Pastebin, Telegram, Reddit, and dark web mirrors using Puppeteer with full JS rendering.',
    pills: ['Puppeteer', 'Cheerio', 'node-cron'],
    accent: '#00e5ff',
  },
  {
    n: '02', icon: '🧠', title: 'AI Analysis',
    desc: 'Each post is sent to Gemini AI for entity extraction — credentials, target organisations, attack types, and contextual threat indicators.',
    pills: ['Gemini API', 'NLP', 'NER'],
    accent: '#ffaa00',
  },
  {
    n: '03', icon: '🎯', title: 'Score & Classify',
    desc: 'Threats are scored 0–100 by severity, credibility, and impact on Indian infrastructure. CRITICAL alerts dispatched in under 90 seconds.',
    pills: ['Scoring Engine', 'MongoDB', 'Rules'],
    accent: '#ff3b5c',
  },
  {
    n: '04', icon: '📡', title: 'Alert & Report',
    desc: 'Real-time alerts pushed via Socket.io to analyst dashboards. Structured reports with historical logs for trend analysis and forecasting.',
    pills: ['Socket.io', 'React', 'Recharts'],
    accent: '#00d68f',
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  useEffect(() => {
    const els = ref.current?.querySelectorAll(`.${styles.reveal}`);
    if (!els) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add(styles.visible); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section className={styles.howSection} id="how" ref={ref}>
      <div className={styles.sectionTag}>Process</div>
      <h2 className={`${styles.sectionTitle} ${styles.reveal}`}>How ThreatWatch Works</h2>
      <p className={`${styles.sectionDesc} ${styles.revealEl} ${styles.reveal}`}>
        Four intelligent stages that convert raw forum noise into actionable, prioritised threat intelligence.
      </p>

      <div className={styles.steps}>
        {STEPS.map((s, i) => (
          <div key={s.n} className={`${styles.step} ${styles.reveal}`} style={{ '--accent': s.accent, transitionDelay: `${i * 0.1}s` }}>
            <div className={styles.stepLine} />
            <div className={styles.stepNum}>{s.n}</div>
            <div className={styles.stepIcon}>{s.icon}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            <div className={styles.stepPills}>
              {s.pills.map(p => <span key={p} className={styles.pill}>{p}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── FEATURES ─────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: '🔍', title: 'Credential Leak Detection', desc: 'Automatically identifies leaked usernames, passwords, API keys, tokens, and config files tied to Indian organisations in real time.', tag: 'Real-time · Pattern Matching', color: '#00e5ff' },
  { icon: '⚠️', title: 'Attack Planning Detection', desc: 'NLP context analysis identifies discussions about planned DDoS, ransomware, phishing, and APT campaigns targeting critical sectors.', tag: 'NLP · Context Aware', color: '#ff3b5c' },
  { icon: '📊', title: 'Threat Scoring Engine', desc: 'Every threat is scored on severity (0–100), credibility, and impact — so analysts focus on what matters most first.', tag: 'Prioritisation · ML Scoring', color: '#ffaa00' },
  { icon: '🗺️', title: 'Multi-Source Monitoring', desc: 'Covers hackforums, Pastebin, Reddit, Telegram channels, and dark web mirrors — all in one unified intelligence feed.', tag: '5+ Sources · Unified Feed', color: '#00d68f' },
  { icon: '⚡', title: 'Real-Time Alerts', desc: 'Critical threats trigger instant alerts via Socket.io to analyst dashboards with under 90-second detection-to-alert latency.', tag: 'Socket.io · <90s Latency', color: '#00e5ff' },
  { icon: '📈', title: 'Historical Trend Analysis', desc: 'Persistent logs power trend dashboards — track threat frequency, source reliability, and sector targeting over time.', tag: 'MongoDB · Analytics', color: '#ff3b5c' },
];

export function Features() {
  const ref = useRef(null);
  useEffect(() => {
    const els = ref.current?.querySelectorAll(`.${styles.reveal}`);
    if (!els) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add(styles.visible); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section className={styles.featSection} id="features" ref={ref}>
      <div className={styles.sectionTag}>Capabilities</div>
      <h2 className={`${styles.sectionTitle} ${styles.reveal}`}>
        Everything You Need to<br />Stay Ahead of Threats
      </h2>

      <div className={styles.featGrid}>
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className={`${styles.featCard} ${styles.reveal}`}
            style={{ '--card-color': f.color, transitionDelay: `${(i % 3) * 0.1}s` }}
          >
            <div className={styles.featIcon}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
            <span className={styles.featTag} style={{ color: f.color, borderColor: `${f.color}30`, background: `${f.color}10` }}>
              {f.tag}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── ARCHITECTURE ─────────────────────────────────────────────────────────── */
const ARCH = [
  {
    icon: '🕷️', title: 'Data Collection',
    desc: 'Scheduled scrapers pull posts from forums & paste sites. Puppeteer handles JS-rendered pages.',
    pills: ['Node.js', 'Puppeteer', 'Cheerio', 'node-cron'],
  },
  {
    icon: '🧠', title: 'AI Processing',
    desc: 'Gemini API performs NLP, entity extraction, and threat classification on scraped content.',
    pills: ['Gemini API', 'Express.js', 'MongoDB', 'Mongoose'],
  },
  {
    icon: '📡', title: 'Live Dashboard',
    desc: 'React dashboard receives real-time events over WebSocket. Analysts review, score, and dismiss alerts.',
    pills: ['React', 'Socket.io', 'Recharts', 'Vite'],
  },
];

function Arrow() {
  return (
    <div className={styles.archArrow}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 11h14M12 5l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Architecture() {
  const ref = useRef(null);
  useEffect(() => {
    const els = ref.current?.querySelectorAll(`.${styles.reveal}`);
    if (!els) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add(styles.visible); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section className={styles.archSection} id="stack" ref={ref}>
      <div className={styles.sectionTag}>Tech Stack</div>
      <h2 className={`${styles.sectionTitle} ${styles.reveal}`}>Built on the MERN Stack</h2>
      <p className={`${styles.sectionDesc} ${styles.reveal}`}>
        A scalable, modular architecture designed for real-time intelligence at production scale.
      </p>

      <div className={styles.archFlow}>
        {ARCH.map((a, i) => (
          <>
            <div key={a.title} className={`${styles.archBox} ${styles.reveal}`} style={{ transitionDelay: `${i * 0.15}s` }}>
              <div className={styles.archIcon}>{a.icon}</div>
              <h4>{a.title}</h4>
              <p>{a.desc}</p>
              <div className={styles.archPills}>
                {a.pills.map(p => <span key={p} className={styles.archPill}>{p}</span>)}
              </div>
            </div>
            {i < ARCH.length - 1 && <Arrow key={`arrow-${i}`} />}
          </>
        ))}
      </div>
    </section>
  );
}

/* ─── CTA ──────────────────────────────────────────────────────────────────── */
export function CTA() {
  return (
    <section className={styles.ctaSection} id="cta">
      <div className={styles.ctaBg} />
      <h2 className={styles.ctaTitle}>
        Protect India&apos;s<br />
        <em>Digital Future</em>
      </h2>
      <p className={styles.ctaDesc}>
        Join ThreatWatch and stay ahead of the threats that matter — before they make headlines.
      </p>
      <div className={styles.ctaActions}>
        <a href="#" className={styles.btnPrimary}>
          Request Demo
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <a href="#how" className={styles.btnOutline}>Learn More</a>
      </div>
      <div className={styles.ctaNote}>
        Built for HACK KRMU 5.0 · PS2 · Cybersecurity &amp; Threat Detection
      </div>
    </section>
  );
}

/* ─── FOOTER ───────────────────────────────────────────────────────────────── */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLogo}>
        <svg width="22" height="26" viewBox="0 0 30 34" fill="none">
          <polygon points="15,1 29,8.5 29,25.5 15,33 1,25.5 1,8.5" stroke="#00e5ff" strokeWidth="1.5" fill="none" />
        </svg>
        <span>Threat<span style={{ color: 'var(--cyan)' }}>Watch</span></span>
      </div>

      <ul className={styles.footerLinks}>
        <li><a href="#how">How It Works</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#stack">Stack</a></li>
        <li><a href="#cta">Contact</a></li>
      </ul>

      <div className={styles.footerCopy}>© 2025 ThreatWatch · HACK KRMU 5.0</div>
    </footer>
  );
}
