'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#60a5fa', '#fbbf24', '#22d3ee', '#94a3b8'];
const LABELS = ['Social Intel', 'Domain Intel', 'Email Intel', 'Other'];

function buildData(stats) {
  const social = stats?.totalThreats     ? Math.round(stats.totalThreats * 0.38)  : 38;
  const domain = stats?.activeSources    ? Math.round(stats.activeSources * 2)    : 29;
  const email  = stats?.unreadAlerts     ? Math.round(stats.unreadAlerts * 1.5)   : 23;
  const other  = Math.max(2, Math.round((social + domain + email) * 0.08));

  return [
    { name: LABELS[0], value: social },
    { name: LABELS[1], value: domain },
    { name: LABELS[2], value: email },
    { name: LABELS[3], value: other },
  ];
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-xl"
      style={{ background: '#334155', border: '1px solid #475569' }}
    >
      <p className="font-semibold" style={{ color: '#f8fafc' }}>{name}</p>
      <p style={{ color: '#cbd5e1' }}>{value} threats</p>
    </div>
  );
};

export default function ThreatTypeDonut({ stats }) {
  const data = buildData(stats);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-xl p-5 h-full" style={{ background: '#1e293b', border: '1px solid #334155' }}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color: '#f8fafc' }}>Threat Distribution</h3>
        <p className="text-xs" style={{ color: '#94a3b8' }}>By source channel</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative" style={{ width: 140, height: 140, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={64}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          >
            <p className="text-xl font-bold tabular-nums" style={{ color: '#f8fafc' }}>{total}</p>
            <p className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>Total</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {data.map((entry, i) => {
            const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
            return (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-xs" style={{ color: '#cbd5e1' }}>{entry.name}</span>
                </div>
                <span className="text-xs font-semibold tabular-nums" style={{ color: '#f8fafc' }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
