'use client';

import { getSeverityColor, getSeverityLabel } from '@/shared/utils/severity';
import { formatRelativeTime } from '@/shared/utils/format';

export default function AlertsTable({ alerts, onAlertClick }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-400 mb-2">No Alerts</h3>
        <p className="text-sm text-gray-500">You have no alerts at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              {['Status', 'Threat Type', 'Sector', 'Severity', 'Time'].map((heading) => (
                <th key={heading} className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {alerts.map((alert) => (
              <tr
                key={alert.id}
                onClick={() => onAlertClick(alert)}
                className="hover:bg-gray-800 cursor-pointer transition-all"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {alert.is_read ? (
                    <span className="px-3 py-1 text-xs font-medium text-gray-400 bg-gray-800 rounded-full">Read</span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-medium text-white bg-cyan-500 rounded-full">Unread</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-white">{alert.threats?.threat_type || 'Unknown'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-400">{alert.threats?.sector || 'N/A'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-medium text-white rounded-full ${getSeverityColor(alert.threats?.severity_score ?? 0)}`}>
                    {getSeverityLabel(alert.threats?.severity_score ?? 0)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-400">{formatRelativeTime(alert.created_at)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-800">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => onAlertClick(alert)}
            className="p-4 hover:bg-gray-800 active:bg-gray-800 cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white mb-1 truncate">{alert.threats?.threat_type || 'Unknown'}</h4>
                <p className="text-xs text-gray-400">{alert.threats?.sector || 'N/A'}</p>
              </div>
              {alert.is_read ? (
                <span className="px-3 py-1 text-xs font-medium text-gray-400 bg-gray-800 rounded-full shrink-0">Read</span>
              ) : (
                <span className="px-3 py-1 text-xs font-medium text-white bg-cyan-500 rounded-full shrink-0">Unread</span>
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className={`px-3 py-1 text-xs font-medium text-white rounded-full ${getSeverityColor(alert.threats?.severity_score ?? 0)}`}>
                {getSeverityLabel(alert.threats?.severity_score ?? 0)}
              </span>
              <span className="text-xs text-gray-500">{formatRelativeTime(alert.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
