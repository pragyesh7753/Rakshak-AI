import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import Sidebar from '@/shared/components/Sidebar'
import DashboardHeader from '@/features/dashboard/components/DashboardHeader'
import DashboardContent from '@/features/dashboard/components/DashboardContent'
import ThreatModal from '@/features/threats/components/ThreatModal'
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData'

export function DashboardPage() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
  } = useDashboardData()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-cyan-400" />
          <p className="text-gray-400">Loading Rakshak AI Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
      />

      <main className="w-full flex-1 overflow-auto">
        <DashboardHeader
          activeSection={activeSection}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

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
      </main>

      {showModal && selectedThreat && (
        <ThreatModal threat={selectedThreat} onClose={closeModal} />
      )}
    </div>
  )
}
