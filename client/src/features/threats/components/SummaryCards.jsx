'use client';

import { ShieldAlert, AlertTriangle, Globe, Mail, TrendingUp, TrendingDown } from 'lucide-react';

const CARD_CONFIG = [
  {
    key: 'totalThreats',
    label: 'Total Threats',
    sub: 'All features combined',
    icon: ShieldAlert,
    accentColor: '#60a5fa',
    iconBg: 'rgba(96,165,250,0.15)',
    valueColor: '#f8fafc',
    trendKey: null,
  },
  {
    key: 'highSeverity',
    label: 'High Risk Alerts',
    sub: 'Requires immediate action',
    icon: AlertTriangle,
    accentColor: '#f87171',
    iconBg: 'rgba(248,113,113,0.15)',
    valueColor: '#f87171',
    trendKey: null,
  },
  {
    key: 'activeSources',
    label: 'Domains Flagged',
    sub: 'Suspicious lookalikes',
    icon: Globe,
    accentColor: '#fbbf24',
    iconBg: 'rgba(251,191,36,0.15)',
    valueColor: '#fbbf24',
    trendKey: null,
  },
  {
    key: 'unreadAlerts',
    label: 'Unread Alerts',
    sub: 'Pending review',
    icon: Mail,
    accentColor: '#22d3ee',
    iconBg: 'rgba(34,211,238,0.15)',
    valueColor: '#22d3ee',
    trendKey: null,
  },
];

function StatCard({ config, value }) {
  const CardIcon = config.icon;
  const numVal = Number(value ?? 0);

  return (
    <div
      className="relative rounded-xl p-5 flex flex-col gap-4 overflow-hidden"
      style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderLeft: `3px solid ${config.accentColor}`,
      }}
    >
      {/* Top row: icon */}
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: config.iconBg }}
        >
          <CardIcon style={{ width: 20, height: 20, color: config.accentColor }} />
        </div>

        {/* Subtle trend chip */}
        <span
          className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded"
          style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}
        >
          <TrendingUp style={{ width: 10, height: 10 }} />
          Live
        </span>
      </div>

      {/* Metric */}
      <div>
        <p
          className="text-3xl font-bold tabular-nums"
          style={{ color: config.valueColor, letterSpacing: '-0.02em' }}
        >
          {numVal.toLocaleString()}
        </p>
        <p className="text-sm font-medium mt-0.5" style={{ color: '#cbd5e1' }}>
          {config.label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
          {config.sub}
        </p>
      </div>
    </div>
  );
}

export default function SummaryCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {CARD_CONFIG.map((cfg) => (
        <StatCard key={cfg.key} config={cfg} value={stats?.[cfg.key]} />
      ))}
    </div>
  );
}
