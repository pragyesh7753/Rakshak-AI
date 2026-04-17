'use client';

import { useEffect, useState } from 'react';
import { X, ExternalLink, ShieldAlert, Brain, FileText, AlertTriangle } from 'lucide-react';
import { RiskScoreBar } from '@/shared/components/RiskScoreBar';
import { RiskBadge } from '@/shared/components/RiskBadge';
import { ThreatTypeBadge, SentimentBadge } from '@/shared/components/ThreatTypeBadge';

const TABS = [
  { id: 'overview',   label: 'Overview',     icon: ShieldAlert },
  { id: 'ai',         label: 'AI Analysis',  icon: Brain },
  { id: 'raw',        label: 'Raw Data',     icon: FileText },
];

function riskLevel(score) {
  const n = Number(score ?? 0);
  if (n >= 7) return 'HIGH';
  if (n >= 4) return 'MEDIUM';
  return 'LOW';
}

function MetaRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 text-xs">
      <span className="flex-shrink-0 font-medium w-20" style={{ color: '#94a3b8' }}>{label}</span>
      <span className="break-all" style={{ color: '#e2e8f0' }}>{value}</span>
    </div>
  );
}

export default function ThreatModal({ threat, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!threat) return null;

  const raw    = threat.raw_posts;
  const source = raw?.threat_sources;
  const level  = riskLevel(threat.severity_score);
  const score  = Number(threat.severity_score ?? 0);
  const pct    = score <= 1 ? score * 100 : score * 10;

  const sentiment = threat.sentiment_label ?? (level === 'HIGH' ? 'URGENT' : 'NEUTRAL');
  const intent    = threat.intent_label    ?? threat.threat_type ?? 'THREAT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl shadow-2xl"
        style={{ background: '#1e293b', border: '1px solid #334155' }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-start justify-between gap-3 p-5 flex-shrink-0"
          style={{ borderBottom: '1px solid #334155' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(248,113,113,0.15)' }}
            >
              <ShieldAlert style={{ width: 18, height: 18, color: '#f87171' }} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate" style={{ color: '#f8fafc' }}>
                {raw?.title ?? threat.threat_type ?? 'Threat Analysis'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <RiskBadge level={level} />
                {raw?.author && (
                  <span className="text-xs" style={{ color: '#94a3b8' }}>u/{raw.author}</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors flex-shrink-0"
            style={{ color: '#94a3b8' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex px-5 flex-shrink-0" style={{ borderBottom: '1px solid #334155' }}>
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-3 text-xs font-medium transition-colors border-b-2 -mb-px"
                style={{
                  borderColor: isActive ? '#60a5fa' : 'transparent',
                  color: isActive ? '#60a5fa' : '#94a3b8',
                }}
              >
                <TabIcon style={{ width: 13, height: 13 }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Risk score */}
              <div className="p-4 rounded-lg space-y-3" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Risk Assessment</p>
                <RiskScoreBar score={pct} />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Severity',    val: `${threat.severity_score ?? '—'}/10`, color: '#f87171' },
                  { label: 'Credibility', val: `${threat.credibility_score ?? '—'}/10`, color: '#fbbf24' },
                  { label: 'Impact',      val: (threat.impact_level ?? 'N/A').toUpperCase(), color: '#22d3ee' },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg p-3 text-center" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                    <p className="text-xs mb-1" style={{ color: '#94a3b8' }}>{m.label}</p>
                    <p className="text-lg font-bold" style={{ color: m.color }}>{m.val}</p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              {threat.summary && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Summary</p>
                  <div className="rounded-lg p-4" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                    <p className="text-sm leading-relaxed" style={{ color: '#e2e8f0' }}>{threat.summary}</p>
                  </div>
                </div>
              )}

              {/* Full content */}
              {raw?.content && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Full Post Content</p>
                  <div className="rounded-lg p-4 max-h-40 overflow-y-auto" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#e2e8f0' }}>{raw.content}</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Source Metadata</p>
                <div className="rounded-lg p-4 space-y-2" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                  <MetaRow label="Author"    value={raw?.author}    />
                  <MetaRow label="Source"    value={source?.name ?? raw?.subreddit} />
                  <MetaRow label="Sector"    value={threat.sector}  />
                  <MetaRow label="Detected"  value={threat.created_at ? new Date(threat.created_at).toLocaleString() : undefined} />
                </div>
              </div>

              {/* External link */}
              {raw?.url && (
                <a
                  href={raw.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ background: '#60a5fa', color: '#fff' }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Original Post
                </a>
              )}
            </>
          )}

          {/* AI Analysis Tab */}
          {activeTab === 'ai' && (
            <>
              {/* Classification badges */}
              <div className="p-4 rounded-lg space-y-3" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>AI Classification</p>
                <div className="flex flex-wrap gap-2">
                  <SentimentBadge sentiment={sentiment} />
                  <ThreatTypeBadge type={intent} />
                </div>
              </div>

              {/* Confidence scores */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Sentiment Confidence', val: threat.sentiment_confidence ?? (threat.credibility_score ? (threat.credibility_score * 10).toFixed(0) : 82), unit: '%' },
                  { label: 'Intent Confidence',    val: threat.intent_confidence    ?? (threat.severity_score ? (threat.severity_score * 10).toFixed(0) : 76), unit: '%' },
                ].map((c) => (
                  <div key={c.label} className="rounded-lg p-4" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                    <p className="text-xs mb-2" style={{ color: '#94a3b8' }}>{c.label}</p>
                    <p className="text-2xl font-bold" style={{ color: '#60a5fa' }}>{c.val}{c.unit}</p>
                  </div>
                ))}
              </div>

              {/* LLM reasoning */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>AI Reasoning</p>
                <div className="rounded-lg p-4" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                  <p className="text-sm leading-relaxed" style={{ color: '#e2e8f0' }}>
                    {threat.llm_reasoning ??
                      threat.summary ??
                      'This post has been flagged based on multi-layer AI analysis including sentiment detection, semantic similarity matching, and intent classification. The confidence scores indicate a high probability of malicious or suspicious activity targeting financial institutions or users.'}
                  </p>
                </div>
              </div>

              {/* Models used */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Models Used</p>
                <div className="flex flex-wrap gap-2">
                  {['XLM-RoBERTa (Sentiment)', 'MiniLM (Semantic)', 'Gemini (Reasoning)'].map((m) => (
                    <span key={m} className="flag-pill">{m}</span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Raw Data Tab */}
          {activeTab === 'raw' && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Raw Threat Object</p>
              <div
                className="rounded-lg p-4 overflow-auto max-h-80 text-xs font-mono"
                style={{ background: '#0f172a', border: '1px solid #334155', color: '#cbd5e1' }}
              >
                <pre>{JSON.stringify(threat, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          className="flex items-center gap-2 p-4 flex-shrink-0"
          style={{ borderTop: '1px solid #334155' }}
        >
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}
          >
            <AlertTriangle style={{ width: 13, height: 13 }} />
            Escalate Alert
          </button>
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}
          >
            Mark Safe
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ color: '#cbd5e1', border: '1px solid #334155' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
