'use client';

import { useState } from 'react';
import { RiskScoreBar } from '@/shared/components/RiskScoreBar';
import { RiskBadge } from '@/shared/components/RiskBadge';
import { ThreatTypeBadge, SentimentBadge } from '@/shared/components/ThreatTypeBadge';

/** Map numeric score to level string */
function riskLevel(score) {
  const n = Number(score ?? 0);
  if (n >= 7) return 'HIGH';
  if (n >= 4) return 'MEDIUM';
  return 'LOW';
}

/** Extract subreddit / author from raw_posts if present */
function postMeta(threat) {
  const raw = threat.raw_posts;
  return {
    author:    raw?.author    ?? 'unknown',
    subreddit: raw?.subreddit ?? raw?.source ?? 'r/security',
    url:       raw?.url       ?? null,
    content:   raw?.content   ?? threat.summary ?? '',
    title:     raw?.title     ?? threat.threat_type ?? 'Threat Detected',
    createdAt: raw?.created_at ?? threat.created_at,
  };
}

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (isNaN(diff)) return '';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function borderColor(level) {
  if (level === 'HIGH')   return '#f87171';
  if (level === 'MEDIUM') return '#fbbf24';
  return '#34d399';
}

/** Single post card */
function PostCard({ threat, onClick }) {
  const [expanded, setExpanded] = useState(false);
  const meta = postMeta(threat);
  const level = riskLevel(threat.severity_score);
  const score = Number(threat.severity_score ?? 0);
  const pct = score <= 1 ? score * 100 : score * 10; // normalize to 0-100

  // Derive sentiment/intent from available fields
  const sentiment = threat.sentiment_label ?? (level === 'HIGH' ? 'URGENT' : 'NEUTRAL');
  const intent    = threat.intent_label    ?? threat.threat_type ?? 'THREAT';

  const flags = Array.isArray(threat.flags) ? threat.flags :
    [threat.sector, threat.impact_level].filter(Boolean).slice(0, 3);

  const PREVIEW_LEN = 160;
  const needsExpand = meta.content.length > PREVIEW_LEN;
  const displayText = expanded ? meta.content : meta.content.slice(0, PREVIEW_LEN);

  return (
    <div
      className="rounded-xl flex overflow-hidden cursor-pointer group transition-colors"
      style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderLeft: `3px solid ${borderColor(level)}`,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = borderColor(level); }}
    >
      {/* Left: post content (70%) */}
      <div className="flex-1 p-5 min-w-0" onClick={() => onClick(threat.id)}>
        {/* Author / subreddit / time */}
        <p className="text-xs mb-2" style={{ color: '#94a3b8' }}>
          <span style={{ color: '#cbd5e1' }}>u/{meta.author}</span>
          {' '}•{' '}
          <span>{meta.subreddit}</span>
          {' '}•{' '}
          <span>{relativeTime(meta.createdAt)}</span>
        </p>

        {/* Post title */}
        <h4
          className="text-sm font-semibold mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors"
          style={{ color: '#f8fafc' }}
        >
          {meta.title}
        </h4>

        {/* Post excerpt */}
        {meta.content && (
          <p className="text-xs leading-relaxed mb-3" style={{ color: '#cbd5e1' }}>
            {displayText}
            {needsExpand && !expanded && '…'}
            {needsExpand && (
              <button
                className="ml-1 font-medium"
                style={{ color: '#60a5fa' }}
                onClick={(e) => { e.stopPropagation(); setExpanded((p) => !p); }}
              >
                {expanded ? 'read less' : 'read more'}
              </button>
            )}
          </p>
        )}

        {/* Badges + flags */}
        <div className="flex flex-wrap items-center gap-1.5">
          <SentimentBadge sentiment={sentiment} />
          <ThreatTypeBadge type={intent} />
          {flags.map((f, i) => (
            <span key={i} className="flag-pill">{f}</span>
          ))}
        </div>
      </div>

      {/* Right: risk score panel */}
      <div
        className="w-36 flex-shrink-0 p-4 flex flex-col items-center justify-center gap-3"
        style={{ borderLeft: '1px solid #334155' }}
        onClick={() => onClick(threat.id)}
      >
        <RiskScoreBar score={pct} />
        <button
          className="w-full py-1.5 rounded-lg text-xs font-semibold transition-colors"
          style={{ border: '1px solid #60a5fa', color: '#60a5fa', background: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(96,165,250,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default function ThreatFeed({ threats, onThreatClick }) {
  if (!threats || threats.length === 0) {
    return (
      <div
        className="rounded-xl p-12 text-center"
        style={{ background: '#1e293b', border: '1px solid #334155' }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: '#334155' }}
        >
          <svg className="w-7 h-7" style={{ color: '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-base font-medium mb-1" style={{ color: '#cbd5e1' }}>No Threats Found</h3>
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          No threat intelligence available. Run the social scraper to fetch new posts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {threats.map((threat) => (
        <PostCard key={threat.id} threat={threat} onClick={onThreatClick} />
      ))}
    </div>
  );
}
