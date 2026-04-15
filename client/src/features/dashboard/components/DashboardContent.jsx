'use client';

import SummaryCards from '@/features/threats/components/SummaryCards';
import ThreatFeed from '@/features/threats/components/ThreatFeed';
import AlertsTable from '@/features/alerts/components/AlertsTable';
import ProfileCard from '@/features/organization/components/ProfileCard';
import SystemLogs from '@/features/system/components/SystemLogs';
import DomainMonitor from '@/features/domains/components/DomainMonitor';
import ThreatDetection from '@/features/monitoring/components/ThreatDetection';

/**
 * Routes to the correct section component based on the active sidebar selection.
 * Keeps the page component free of conditional rendering logic.
 */
export default function DashboardContent({
  activeSection,
  stats,
  threats,
  alerts,
  organization,
  logs,
  logSummary,
  pipelineStarting,
  pipelineMessage,
  page,
  threatsPerPage,
  onThreatClick,
  onAlertClick,
  onPageChange,
  onStartPipeline,
  onSystemRefresh,
}) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* ── Dashboard overview ──────────────────────────────────────────────── */}
      {activeSection === 'dashboard' && (
        <div className="space-y-8">
          <SummaryCards stats={stats} />

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Recent Threats</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-3 sm:px-4 py-2 bg-gray-900 text-gray-400 border border-gray-800 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>
                <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">Page {page + 1}</span>
                <button
                  onClick={() => onPageChange(page + 1)}
                  disabled={threats.length < threatsPerPage}
                  className="px-3 sm:px-4 py-2 bg-gray-900 text-gray-400 border border-gray-800 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                >
                  Next
                </button>
              </div>
            </div>
            <ThreatFeed threats={threats} onThreatClick={onThreatClick} />
          </div>
        </div>
      )}

      {/* ── Alerts ──────────────────────────────────────────────────────────── */}
      {activeSection === 'alerts' && (
        <div>
          <p className="text-gray-400 mb-6">
            {alerts.filter((a) => !a.is_read).length} unread alert
            {alerts.filter((a) => !a.is_read).length !== 1 ? 's' : ''}
          </p>
          <AlertsTable alerts={alerts} onAlertClick={onAlertClick} />
        </div>
      )}

      {/* ── Profile ─────────────────────────────────────────────────────────── */}
      {activeSection === 'profile' && (
        <div className="max-w-2xl">
          <ProfileCard organization={organization} />
        </div>
      )}

      {/* ── Monitoring ──────────────────────────────────────────────────────── */}
      {activeSection === 'monitoring' && <ThreatDetection />}

      {/* ── Domains ─────────────────────────────────────────────────────────── */}
      {activeSection === 'domains' && <DomainMonitor />}

      {/* ── System ──────────────────────────────────────────────────────────── */}
      {activeSection === 'system' && (
        <SystemLogs
          logs={logs}
          summary={logSummary}
          onStartPipeline={onStartPipeline}
          onRefresh={onSystemRefresh}
          pipelineStarting={pipelineStarting}
          pipelineMessage={pipelineMessage}
        />
      )}
    </div>
  );
}
