'use client';

import { useState } from 'react';
import Sidebar from '@/shared/components/Sidebar';
import DashboardHeader from '@/features/dashboard/components/DashboardHeader';
import DashboardContent from '@/features/dashboard/components/DashboardContent';
import ThreatModal from '@/features/threats/components/ThreatModal';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { SkeletonStatCard } from '@/shared/components/SkeletonLoader';

export function DashboardPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    user,
    loading,
    refreshing,
    stats,
    threats,
    selectedThreat,
    showModal,
    alerts,
    emailIntelligenceResults,
    organization,
    logs,
    logSummary,
    pipelineStarting,
    pipelineMessage,
    page,
    threatsPerPage,
    setPage,
    handleRefresh,
    handleThreatClick,
    handleAlertClick,
    handleStartPipeline,
    handleSystemRefresh,
    closeModal,
  } = useDashboardData();

  const unreadAlertCount = alerts.filter((a) => !a.is_read).length;

  const userEmail = user?.email ?? user?.primaryEmailAddress?.emailAddress ?? '';
  const userInitials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'RA';

  if (loading) {
    return (
      <div className="flex h-screen w-full overflow-hidden" style={{ background: '#0f172a' }}>
        {/* Skeleton sidebar */}
        <aside className="hidden lg:flex flex-col w-64 flex-shrink-0" style={{ background: '#1e293b', borderRight: '1px solid #334155' }}>
          <div className="p-5" style={{ borderBottom: '1px solid #334155' }}>
            <div className="skeleton h-9 w-32 rounded-lg" />
          </div>
          <div className="p-4 space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="skeleton h-9 rounded-lg" />
            ))}
          </div>
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Skeleton header */}
          <div className="px-6 py-4 flex items-center gap-4" style={{ background: '#1e293b', borderBottom: '1px solid #334155', height: 64 }}>
            <div className="skeleton h-5 w-48 rounded" />
            <div className="flex-1" />
            <div className="skeleton h-8 w-8 rounded-full" />
          </div>
          {/* Skeleton cards */}
          <div className="p-6 space-y-6 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: '#0f172a' }}>
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        unreadAlertCount={unreadAlertCount}
      />

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashboardHeader
          activeSection={activeSection}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          unreadAlertCount={unreadAlertCount}
          userInitials={userInitials}
        />

        <div className="flex-1 overflow-auto">
          <DashboardContent
            activeSection={activeSection}
            stats={stats}
            threats={threats}
            alerts={alerts}
            emailIntelligenceResults={emailIntelligenceResults}
            organization={organization}
            logs={logs}
            logSummary={logSummary}
            pipelineStarting={pipelineStarting}
            pipelineMessage={pipelineMessage}
            page={page}
            threatsPerPage={threatsPerPage}
            onThreatClick={handleThreatClick}
            onAlertClick={handleAlertClick}
            onPageChange={setPage}
            onStartPipeline={handleStartPipeline}
            onSystemRefresh={handleSystemRefresh}
          />
        </div>
      </main>

      {showModal && selectedThreat && (
        <ThreatModal threat={selectedThreat} onClose={closeModal} />
      )}
    </div>
  );
}
