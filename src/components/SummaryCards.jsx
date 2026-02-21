import { ShieldAlert, AlertTriangle, Bell, Radio } from 'lucide-react';

const cards = [
  {
    key: 'totalThreats',
    label: 'Total Threats',
    icon: ShieldAlert,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
  },
  {
    key: 'highSeverity',
    label: 'High Severity',
    icon: AlertTriangle,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20',
  },
  {
    key: 'unreadAlerts',
    label: 'Unread Alerts',
    icon: Bell,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
  },
  {
    key: 'activeSources',
    label: 'Active Sources',
    icon: Radio,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
  },
];

export default function SummaryCards({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ key, label, icon: Icon, color, bg, border }) => (
        <div
          key={key}
          className={`rounded-xl border ${border} bg-gray-900 p-5 flex flex-col gap-3`}
        >
          <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {stats ? stats[key] ?? '—' : '—'}
            </p>
            <p className="text-sm text-gray-400 mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
