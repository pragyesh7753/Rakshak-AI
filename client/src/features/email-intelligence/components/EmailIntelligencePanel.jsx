'use client';

import { useState } from 'react';
import {
  Mail, Copy, X, ShieldAlert, Brain, AlertTriangle,
  ExternalLink, CheckCircle, Clock, Link as LinkIcon,
} from 'lucide-react';
import { RiskBadge } from '@/shared/components/RiskBadge';
import { ThreatTypeBadge } from '@/shared/components/ThreatTypeBadge';
import { RiskScoreBar } from '@/shared/components/RiskScoreBar';

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function toRiskPct(v) { const n = Number(v); if (!isFinite(n)) return 0; return clamp(n > 1 ? Math.round(n) : Math.round(n * 100), 0, 100); }
function riskLevel(pct) { return pct >= 70 ? 'HIGH' : pct >= 40 ? 'MEDIUM' : 'LOW'; }

function relativeTime(v) {
  const diff = Date.now() - new Date(v).getTime();
  if (isNaN(diff)) return '';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function borderStyle(level) {
  if (level === 'HIGH')   return { borderLeft: '3px solid #f87171', background: 'rgba(248,113,113,0.03)' };
  if (level === 'MEDIUM') return { borderLeft: '3px solid #fbbf24', background: 'rgba(251,191,36,0.02)' };
  return { borderLeft: '3px solid #34d399' };
}

function iconColor(type) {
  const t = String(type ?? '').toUpperCase();
  if (t === 'PHISHING') return '#f87171';
  if (t === 'BEC')      return '#8B5CF6';
  if (t === 'IMPERSONATION') return '#EC4899';
  return '#22d3ee';
}

/* ─── Email Detail Modal ────────────────────────────────────────────────────── */
function EmailDetailModal({ item, onClose }) {
  const [tab, setTab] = useState('content');
  if (!item) return null;

  const score = toRiskPct(item.riskScore);
  const level = riskLevel(score);
  const flags = Array.isArray(item.flags) ? item.flags : [];
  const links = Array.isArray(item.extractedLinks) ? item.extractedLinks : [];

  const ACTION_CARD = {
    Block: { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', color: '#f87171', label: 'BLOCK — Do not interact with sender or links. Alert security team immediately.' },
    Flag:  { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)', color: '#fbbf24', label: 'ESCALATE — Forward to security team for manual review.' },
    Allow: { bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.3)', color: '#34d399', label: 'SAFE — No action required. Email appears legitimate.' },
  };
  const actionStyle = ACTION_CARD[item.recommendedAction ?? 'Flag'] ?? ACTION_CARD.Flag;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl shadow-2xl" style={{ background: '#1e293b', border: '1px solid #334155' }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 flex-shrink-0" style={{ borderBottom: '1px solid #334155' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${iconColor(item.threatType)}20` }}>
              <Mail style={{ width: 18, height: 18, color: iconColor(item.threatType) }} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate" style={{ color: '#f8fafc' }}>
                {item.originalSubject ?? 'Email Analysis'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <RiskBadge level={level} />
                <ThreatTypeBadge type={item.threatType} />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg flex-shrink-0" style={{ color: '#94a3b8' }}><X className="w-4 h-4" /></button>
        </div>

        {/* Tabs */}
        <div className="flex px-5 flex-shrink-0" style={{ borderBottom: '1px solid #334155' }}>
          {[
            { id: 'content', label: 'Email Content' },
            { id: 'analysis', label: 'AI Analysis' },
            { id: 'flags', label: `Flags (${flags.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-3 py-3 text-xs font-medium transition-colors border-b-2 -mb-px"
              style={{ borderColor: tab === t.id ? '#60a5fa' : 'transparent', color: tab === t.id ? '#60a5fa' : '#94a3b8' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Content Tab */}
          {tab === 'content' && (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Extracted Email</p>
                <div className="rounded-lg p-4 font-mono text-xs space-y-1.5" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                  {[
                    ['FROM', item.originalSender ?? 'Unknown'],
                    ['SUBJECT', item.originalSubject ?? '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="font-semibold w-16 flex-shrink-0" style={{ color: '#64748b' }}>{k}:</span>
                      <span className="break-all" style={{ color: '#e2e8f0' }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #334155', marginTop: 8, paddingTop: 8 }}>
                    <p className="whitespace-pre-wrap leading-relaxed" style={{ color: '#cbd5e1' }}>
                      {item.emailBody ?? item.analysis ?? 'Email body not available.'}
                    </p>
                  </div>
                </div>
              </div>
              {/* Risk score */}
              <div className="p-4 rounded-lg" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#94a3b8' }}>Risk Assessment</p>
                <RiskScoreBar score={score} />
              </div>
              {/* Links */}
              {links.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Extracted URLs ({links.length})</p>
                  <div className="space-y-1.5">
                    {links.map((link, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg text-xs" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                        <LinkIcon style={{ width: 11, height: 11, color: '#60a5fa', flexShrink: 0 }} />
                        <span className="break-all flex-1 font-mono" style={{ color: '#cbd5e1' }}>{link}</span>
                        <ExternalLink style={{ width: 11, height: 11, color: '#64748b', flexShrink: 0 }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* AI Analysis Tab */}
          {tab === 'analysis' && (
            <>
              <div className="p-4 rounded-lg space-y-3" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>AI Classification</p>
                <div className="flex flex-wrap gap-2">
                  <ThreatTypeBadge type={item.threatType} />
                  <RiskBadge level={level} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>AI Reasoning</p>
                <div className="rounded-lg p-4" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                  <p className="text-sm leading-relaxed" style={{ color: '#e2e8f0' }}>
                    {item.analysis ?? 'This email has been analyzed and classified based on sender domain reputation, content patterns, urgency indicators, and known threat signatures.'}
                  </p>
                </div>
              </div>
              {/* Recommended action */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Recommended Action</p>
                <div
                  className="rounded-lg p-4 text-sm font-medium"
                  style={{ background: actionStyle.bg, border: `1px solid ${actionStyle.border}`, color: actionStyle.color }}
                >
                  {actionStyle.label}
                </div>
              </div>
            </>
          )}

          {/* Flags Tab */}
          {tab === 'flags' && (
            <>
              {flags.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: '#94a3b8' }}>No flags detected.</p>
              ) : (
                <div className="space-y-2">
                  {flags.map((flag, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg text-sm" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                      <AlertTriangle style={{ width: 14, height: 14, color: '#fbbf24', flexShrink: 0 }} />
                      <span style={{ color: '#e2e8f0' }}>{flag}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 p-4 flex-shrink-0" style={{ borderTop: '1px solid #334155' }}>
          <button className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
            Escalate
          </button>
          <button className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
            Block Sender
          </button>
          <button className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
            Mark Safe
          </button>
          <div className="flex-1" />
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ color: '#cbd5e1', border: '1px solid #334155' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Email Card ────────────────────────────────────────────────────────────── */
function EmailCard({ item, onClick }) {
  const score = toRiskPct(item?.riskScore);
  const level = riskLevel(score);
  const flags = Array.isArray(item?.flags) ? item.flags : [];
  const isUnreviewed = !item?.reviewed;

  return (
    <div
      className="rounded-xl p-5 cursor-pointer transition-colors"
      style={{ background: '#1e293b', border: '1px solid #334155', ...borderStyle(level) }}
      onClick={() => onClick(item)}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#273549'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#1e293b'; }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${iconColor(item?.threatType)}18` }}>
            <Mail style={{ width: 14, height: 14, color: iconColor(item?.threatType) }} />
          </div>
          <span className="text-xs font-mono truncate" style={{ color: level === 'HIGH' ? '#f87171' : '#cbd5e1' }}>
            {item?.originalSender ?? 'Unknown Sender'}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ThreatTypeBadge type={item?.threatType} />
          <RiskBadge level={level} />
          <span className="text-xs" style={{ color: '#64748b' }}>{relativeTime(item?.createdAt)}</span>
        </div>
      </div>

      {/* Subject */}
      <h4 className="text-sm font-semibold mb-1.5 line-clamp-1" style={{ color: '#f8fafc' }}>
        {item?.originalSubject ?? 'No subject'}
      </h4>

      {/* Preview */}
      <p className="text-xs mb-3 line-clamp-2" style={{ color: '#94a3b8' }}>
        {item?.analysis ?? 'No preview available'}
      </p>

      {/* Bottom row: flags + score */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {flags.slice(0, 3).map((f, i) => (
            <span key={i} className="flag-pill">{f}</span>
          ))}
          {flags.length > 3 && (
            <span className="flag-pill">+{flags.length - 3}</span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {isUnreviewed && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>
              NEW
            </span>
          )}
          <button
            className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
            style={{ border: '1px solid #334155', color: '#60a5fa', background: 'transparent' }}
            onMouseEnter={(e) => { e.stopPropagation(); e.currentTarget.style.background = 'rgba(96,165,250,0.1)'; }}
            onMouseLeave={(e) => { e.stopPropagation(); e.currentTarget.style.background = 'transparent'; }}
            onClick={(e) => { e.stopPropagation(); onClick(item); }}
          >
            View Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Summary bar ───────────────────────────────────────────────────────────── */
function StatChip({ label, value, color }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: '#1e293b', border: '1px solid #334155' }}>
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span style={{ color: '#94a3b8' }}>{label}:</span>
      <span className="font-bold" style={{ color: '#f8fafc' }}>{value}</span>
    </div>
  );
}

/* ─── Main Panel ────────────────────────────────────────────────────────────── */
export default function EmailIntelligencePanel({ results }) {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const rows = Array.isArray(results) ? results : [];

  const stats = {
    total:   rows.length,
    high:    rows.filter((r) => toRiskPct(r?.riskScore) >= 70).length,
    bec:     rows.filter((r) => String(r?.threatType ?? '').toUpperCase() === 'BEC').length,
    phishing:rows.filter((r) => String(r?.threatType ?? '').toUpperCase() === 'PHISHING').length,
    blocked: rows.filter((r) => String(r?.recommendedAction ?? '') === 'Block').length,
  };

  const THREAT_FILTERS = ['ALL', 'BEC', 'PHISHING', 'IMPERSONATION', 'SAFE'];
  const filtered = rows.filter((r) => {
    if (filter === 'ALL') return true;
    return String(r?.threatType ?? '').toUpperCase() === filter;
  });

  const FORWARD_EMAIL = 'security-rakshakai@rakshak.ai';
  const [copied, setCopied] = useState(false);
  function copyEmail() {
    navigator.clipboard.writeText(FORWARD_EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: '#f8fafc' }}>Email Intelligence</h2>
        <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
          AI-powered analysis of forwarded suspicious emails
        </p>
      </div>

      {/* Forward instructions banner */}
      <div
        className="rounded-xl p-4 flex items-center gap-4"
        style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.25)' }}
      >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,211,238,0.15)' }}>
          <Mail style={{ width: 18, height: 18, color: '#22d3ee' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold" style={{ color: '#22d3ee' }}>Forward Suspicious Emails</p>
          <p className="text-xs mt-0.5" style={{ color: '#cbd5e1' }}>
            Forward any suspicious email to{' '}
            <span className="font-mono font-medium" style={{ color: '#f8fafc' }}>{FORWARD_EMAIL}</span>
            {' '}for instant AI analysis
          </p>
        </div>
        <button
          onClick={copyEmail}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex-shrink-0"
          style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)' }}
        >
          {copied ? <CheckCircle style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
          {copied ? 'Copied!' : 'Copy Address'}
        </button>
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap gap-2">
        <StatChip label="Total"    value={stats.total}    color="#60a5fa" />
        <StatChip label="High Risk"value={stats.high}     color="#f87171" />
        <StatChip label="BEC"      value={stats.bec}      color="#8B5CF6" />
        <StatChip label="Phishing" value={stats.phishing} color="#f87171" />
        <StatChip label="Blocked"  value={stats.blocked}  color="#f87171" />
      </div>

      {/* Threat type filter */}
      <div className="flex items-center gap-2">
        {THREAT_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            style={
              filter === f
                ? { background: '#60a5fa', color: '#fff' }
                : { background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1' }
            }
          >
            {f === 'ALL' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Email cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <Mail style={{ width: 40, height: 40, color: '#64748b' }} className="mx-auto mb-4" />
          <h3 className="text-sm font-medium mb-1" style={{ color: '#cbd5e1' }}>No emails analyzed yet</h3>
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            Forward suspicious emails to <span className="font-mono" style={{ color: '#22d3ee' }}>{FORWARD_EMAIL}</span> to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <EmailCard
              key={item?.id ?? `${item?.originalSender}-${i}`}
              item={item}
              onClick={setSelectedEmail}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedEmail && (
        <EmailDetailModal item={selectedEmail} onClose={() => setSelectedEmail(null)} />
      )}
    </div>
  );
}
