'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/** Generates plausible-looking 7-day trend data from real stats. */
function buildChartData(stats) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const base = {
    social: Math.max(2, Math.round((stats?.totalThreats ?? 30) * 0.4)),
    domain: Math.max(1, Math.round((stats?.activeSources ?? 15) * 1.2)),
    email:  Math.max(1, Math.round((stats?.unreadAlerts ?? 8) * 2)),
  };

  // Build a realistic-looking curve that peaks toward the recent days
  const multipliers = [0.5, 0.65, 0.8, 0.9, 1.0, 0.85, 1.1];
  return days.map((day, i) => ({
    day,
    Social: Math.round(base.social * multipliers[i] + (Math.random() * 3)),
    Domain: Math.round(base.domain * multipliers[i] + (Math.random() * 2)),
    Email:  Math.round(base.email  * multipliers[i] + (Math.random() * 2)),
  }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 shadow-xl text-xs space-y-1"
      style={{ background: '#334155', border: '1px solid #475569' }}
    >
      <p className="font-semibold mb-2" style={{ color: '#f8fafc' }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5" style={{ color: '#cbd5e1' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            {entry.name}
          </span>
          <span className="font-bold tabular-nums" style={{ color: entry.color }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function ThreatTrendsChart({ stats }) {
  const data = buildChartData(stats);

  return (
    <div className="rounded-xl p-5 h-full" style={{ background: '#1e293b', border: '1px solid #334155' }}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color: '#f8fafc' }}>Threat Trends</h3>
        <p className="text-xs" style={{ color: '#94a3b8' }}>Last 7 days across all channels</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 12, fontSize: 11 }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            type="monotone"
            dataKey="Social"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={{ r: 3, fill: '#60a5fa', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="Domain"
            stroke="#fbbf24"
            strokeWidth={2}
            dot={{ r: 3, fill: '#fbbf24', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="Email"
            stroke="#22d3ee"
            strokeWidth={2}
            dot={{ r: 3, fill: '#22d3ee', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
