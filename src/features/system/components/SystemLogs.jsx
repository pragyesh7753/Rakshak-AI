'use client';

import { CheckCircle, XCircle, Clock, AlertCircle, Radio } from 'lucide-react';
import { formatRelativeTime, parseLogMessage } from '@/shared/utils/format';

function getStatusIcon(status) {
  switch (status?.toLowerCase()) {
    case 'success':
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'failed':
    case 'error':
      return <XCircle className="w-5 h-5 text-red-400" />;
    case 'running':
    case 'processing':
      return <Radio className="w-5 h-5 text-yellow-400 animate-pulse" />;
    default:
      return <AlertCircle className="w-5 h-5 text-gray-400" />;
  }
}

function getStatusBadgeClasses(status) {
  switch (status?.toLowerCase()) {
    case 'success':
    case 'completed':
      return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'failed':
    case 'error':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'running':
    case 'processing':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
}

export default function SystemLogs({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-400 mb-2">No Logs Found</h3>
        <p className="text-sm text-gray-500">No system logs available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg">
      <div className="p-4 sm:p-6 border-b border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2 flex-wrap">
              System Processing Logs
              <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">Live</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Real-time system activity • {logs.length} entries</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500 hidden sm:inline">Auto-refresh</span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-800 max-h-150 overflow-y-auto bg-black/20">
        {logs.map((log, index) => {
          const { tag, tagColor, message } = parseLogMessage(log.message);
          const isLive = log.status?.toLowerCase() === 'running' || log.status?.toLowerCase() === 'processing';

          return (
            <div
              key={index}
              className={`p-3 sm:p-4 hover:bg-gray-800/50 transition-all ${isLive ? 'bg-yellow-500/5 border-l-2 border-yellow-500' : ''}`}
            >
              <div className="flex items-start gap-2 sm:gap-4">
                <div className="shrink-0 mt-1">{getStatusIcon(log.status)}</div>

                <div className="flex-1 min-w-0 font-mono text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-gray-500 text-xs whitespace-nowrap">
                          {new Date(log.created_at).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span className="text-cyan-400 font-semibold text-xs truncate">[{log.job_type}]</span>
                        {tag && <span className={`font-bold text-xs ${tagColor}`}>[{tag}]</span>}
                      </div>
                      <p className="text-gray-300 leading-relaxed text-xs wrap-break-words">{message || log.message}</p>
                    </div>
                    <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full border shrink-0 ${getStatusBadgeClasses(log.status)}`}>
                      {log.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-gray-600 text-xs">{formatRelativeTime(log.created_at)}</span>
                    {isLive && (
                      <span className="text-yellow-400 text-xs flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 sm:p-4 border-t border-gray-800 bg-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
          <span>Showing {logs.length} recent entries</span>
          <span className="font-mono">Updated {formatRelativeTime(new Date().toISOString())}</span>
        </div>
      </div>
    </div>
  );
}
