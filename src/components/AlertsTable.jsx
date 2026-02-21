import { Bell, BellOff } from 'lucide-react';

const severityColor = (score) => {
  if (score >= 9) return 'text-red-400';
  if (score >= 7) return 'text-orange-400';
  if (score >= 5) return 'text-yellow-400';
  return 'text-green-400';
};

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AlertsTable({ alerts, onAlertClick }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">No alerts found.</div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          onClick={() => onAlertClick(alert)}
          className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:bg-gray-800/60 ${
            alert.is_read
              ? 'bg-gray-900 border-gray-800 opacity-60'
              : 'bg-gray-900 border-cyan-500/30 hover:border-cyan-500/50'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              alert.is_read ? 'bg-gray-800' : 'bg-cyan-500/20'
            }`}
          >
            {alert.is_read ? (
              <BellOff className="w-4 h-4 text-gray-500" />
            ) : (
              <Bell className="w-4 h-4 text-cyan-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white truncate">
                {alert.threats?.threat_type ?? 'Unknown Threat'}
              </span>
              {!alert.is_read && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Sector: {alert.threats?.sector ?? '—'}
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className={`text-sm font-semibold ${severityColor(alert.threats?.severity_score)}`}>
              {alert.threats?.severity_score ?? '—'}/10
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {alert.created_at ? timeAgo(alert.created_at) : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
