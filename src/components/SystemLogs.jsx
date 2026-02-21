import { CheckCircle2, XCircle, Loader2, Activity } from 'lucide-react';

const statusConfig = {
  success: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
  running: { icon: Loader2, color: 'text-cyan-400 animate-spin', bg: 'bg-cyan-400/10' },
  processing: { icon: Activity, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
};

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function SystemLogs({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">No logs available.</div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
        <Activity className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-medium text-white">Processing Logs</h3>
        <span className="ml-auto text-xs text-gray-500">{logs.length} entries</span>
      </div>

      <div className="divide-y divide-gray-800/60">
        {logs.map((log) => {
          const cfg = statusConfig[log.status] ?? statusConfig.processing;
          const Icon = cfg.icon;
          return (
            <div key={log.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-800/40 transition">
              <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">
                    {log.job_type}
                  </span>
                  <span className={`text-xs font-medium ${cfg.color}`}>
                    {log.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 font-mono leading-relaxed break-words">
                  {log.message}
                </p>
              </div>
              <span className="text-xs text-gray-600 shrink-0 mt-0.5">
                {log.created_at ? timeAgo(log.created_at) : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
