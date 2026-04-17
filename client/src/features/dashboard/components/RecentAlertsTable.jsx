'use client';

import { MessageCircleWarning, Globe, Mail, ExternalLink } from 'lucide-react';
import { RiskBadge } from '@/shared/components/RiskBadge';
import { getSeverityLabel } from '@/shared/utils/severity';

function typeIcon(type) {
  if (!type) return <MessageCircleWarning style={{ width: 14, height: 14, color: '#60a5fa' }} />;
  const t = String(type).toLowerCase();
  if (t.includes('domain')) return <Globe style={{ width: 14, height: 14, color: '#fbbf24' }} />;
  if (t.includes('email'))  return <Mail  style={{ width: 14, height: 14, color: '#22d3ee' }} />;
  return <MessageCircleWarning style={{ width: 14, height: 14, color: '#60a5fa' }} />;
}

function typeBg(type) {
  if (!type) return 'rgba(96,165,250,0.12)';
  const t = String(type).toLowerCase();
  if (t.includes('domain')) return 'rgba(251,191,36,0.12)';
  if (t.includes('email'))  return 'rgba(34,211,238,0.12)';
  return 'rgba(96,165,250,0.12)';
}

function typeLabel(type) {
  if (!type) return 'Social';
  const t = String(type).toLowerCase();
  if (t.includes('domain')) return 'Domain';
  if (t.includes('email'))  return 'Email';
  return 'Social';
}

function relativeTime(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (isNaN(diff)) return '—';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function riskFromScore(score) {
  const s = Number(score ?? 0);
  if (s >= 7) return 'HIGH';
  if (s >= 4) return 'MEDIUM';
  return 'LOW';
}

/**
 * Recent Alerts Table for the Dashboard overview.
 * Renders from the threats feed — high-risk rows get red accent border.
 */
export default function RecentAlertsTable({ threats = [], alerts = [], onThreatClick, onAlertClick }) {
  // Combine threats + alerts for a unified view, prefer real alerts if available
  const rows = alerts.length > 0
    ? alerts.slice(0, 8).map((a) => ({
        id: a.id,
        type: a.alert_type ?? 'Social',
        summary: a.message ?? a.title ?? 'Alert detected',
        riskLevel: a.severity ?? a.risk_level ?? 'MEDIUM',
        time: a.created_at ?? a.createdAt,
        onClick: () => onAlertClick?.(a),
      }))
    : threats.slice(0, 8).map((t) => ({
        id: t.id,
        type: t.threat_type ?? 'Social',
        summary: t.summary ?? t.raw_posts?.title ?? 'Threat detected',
        riskLevel: riskFromScore(t.severity_score),
        time: t.created_at ?? t.raw_posts?.created_at,
        onClick: () => onThreatClick?.(t.id),
      }));

  if (rows.length === 0) {
    return (
      <div className="rounded-xl p-10 text-center" style={{ background: '#1e293b', border: '1px solid #334155' }}>
        <p className="text-sm" style={{ color: '#94a3b8' }}>No recent alerts</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#1e293b', border: '1px solid #334155' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #334155' }}>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#f8fafc' }}>Recent Alerts</h3>
          <p className="text-xs" style={{ color: '#94a3b8' }}>{rows.length} most recent across all features</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
              {['Type', 'Summary', 'Risk Level', 'Time', ''].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: '#64748b' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isHigh = row.riskLevel === 'HIGH';
              return (
                <tr
                  key={row.id}
                  onClick={row.onClick}
                  className="cursor-pointer transition-colors"
                  style={{
                    borderBottom: '1px solid #334155',
                    borderLeft: isHigh ? '3px solid #f87171' : '3px solid transparent',
                    background: isHigh ? 'rgba(248,113,113,0.04)' : 'transparent',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = isHigh ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isHigh ? 'rgba(248,113,113,0.04)' : 'transparent'; }}
                >
                  {/* Type */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium"
                      style={{ background: typeBg(row.type) }}
                    >
                      {typeIcon(row.type)}
                      <span style={{ color: '#cbd5e1' }}>{typeLabel(row.type)}</span>
                    </div>
                  </td>

                  {/* Summary */}
                  <td className="px-5 py-3.5 max-w-xs">
                    <p className="text-xs truncate" style={{ color: '#e2e8f0' }} title={row.summary}>
                      {row.summary}
                    </p>
                  </td>

                  {/* Risk */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <RiskBadge level={row.riskLevel} />
                  </td>

                  {/* Time */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-xs" style={{ color: '#94a3b8' }}>{relativeTime(row.time)}</span>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <ExternalLink style={{ width: 13, height: 13, color: '#64748b' }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
