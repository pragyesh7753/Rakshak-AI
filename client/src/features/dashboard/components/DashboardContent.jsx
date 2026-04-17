'use client';

import SummaryCards from '@/features/threats/components/SummaryCards';
import ThreatFeed from '@/features/threats/components/ThreatFeed';
import ThreatTrendsChart from '@/features/dashboard/components/ThreatTrendsChart';
import ThreatTypeDonut from '@/features/dashboard/components/ThreatTypeDonut';
import RecentAlertsTable from '@/features/dashboard/components/RecentAlertsTable';
import PipelineStatus from '@/features/dashboard/components/PipelineStatus';
import AlertsTable from '@/features/alerts/components/AlertsTable';
import ProfileCard from '@/features/organization/components/ProfileCard';
import SystemLogs from '@/features/system/components/SystemLogs';
import DomainMonitor from '@/features/domains/components/DomainMonitor';
import EmailIntelligencePanel from '@/features/email-intelligence/components/EmailIntelligencePanel';

/**
 * Routes content to the correct section based on active sidebar selection.
 * All new sections and dashboard charts are wired here.
 */
export default function DashboardContent({
  activeSection,
  stats,
  threats,
  alerts,
  emailIntelligenceResults,
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
    <div className="p-4 sm:p-6 space-y-6">

      {/* ── Dashboard Overview ───────────────────────────────────────────────── */}
      {activeSection === 'dashboard' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <SummaryCards stats={stats} />

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3">
              <ThreatTrendsChart stats={stats} />
            </div>
            <div className="lg:col-span-2">
              <ThreatTypeDonut stats={stats} />
            </div>
          </div>

          {/* Alerts Table + Pipeline Status */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <RecentAlertsTable
                threats={threats}
                alerts={alerts}
                onThreatClick={onThreatClick}
                onAlertClick={onAlertClick}
              />
            </div>
            <div className="lg:col-span-1">
              <PipelineStatus
                onStartPipeline={onStartPipeline}
                pipelineStarting={pipelineStarting}
                pipelineMessage={pipelineMessage}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Social Intelligence (Threat Feed) ───────────────────────────────── */}
      {activeSection === 'social-intelligence' && (
        <div className="space-y-5">
          {/* Section header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#f8fafc' }}>
                Social Media Threats
              </h2>
              <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
                AI-analyzed Reddit posts filtered for cybersecurity threats
              </p>
            </div>
            {/* Pagination */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 text-xs rounded-lg transition-colors disabled:opacity-40"
                style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1' }}
              >
                ← Prev
              </button>
              <span className="text-xs px-2" style={{ color: '#94a3b8' }}>Page {page + 1}</span>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={threats.length < threatsPerPage}
                className="px-3 py-1.5 text-xs rounded-lg transition-colors disabled:opacity-40"
                style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1' }}
              >
                Next →
              </button>
            </div>
          </div>

          <ThreatFeed threats={threats} onThreatClick={onThreatClick} />
        </div>
      )}

      {/* ── Domain Intelligence ──────────────────────────────────────────────── */}
      {activeSection === 'domains' && <DomainMonitor />}

      {/* ── Email Intelligence ───────────────────────────────────────────────── */}
      {activeSection === 'email-intelligence' && (
        <EmailIntelligencePanel results={emailIntelligenceResults} />
      )}

      {/* ── Alerts ──────────────────────────────────────────────────────────── */}
      {activeSection === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold" style={{ color: '#f8fafc' }}>Security Alerts</h2>
            {alerts.filter((a) => !a.is_read).length > 0 && (
              <span
                className="px-2 py-0.5 text-xs font-semibold rounded-full"
                style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}
              >
                {alerts.filter((a) => !a.is_read).length} unread
              </span>
            )}
          </div>
          <AlertsTable alerts={alerts} onAlertClick={onAlertClick} />
        </div>
      )}

      {/* ── Organization Profile ────────────────────────────────────────────── */}
      {activeSection === 'profile' && (
        <div className="max-w-2xl">
          <ProfileCard organization={organization} />
        </div>
      )}

      {/* ── System Logs ─────────────────────────────────────────────────────── */}
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
