'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import SummaryCards from '@/components/SummaryCards';
import ThreatFeed from '@/components/ThreatFeed';
import ThreatModal from '@/components/ThreatModal';
import AlertsTable from '@/components/AlertsTable';
import ProfileCard from '@/components/ProfileCard';
import SystemLogs from '@/components/SystemLogs';
import DomainMonitor from '@/components/DomainMonitor';
import ThreatDetection from '@/components/ThreatDetection';
import {
  getSummaryStats,
  getRecentThreats,
  getThreatDetails,
  getAlerts,
  markAlertAsRead,
  getOrganization,
  getProcessingLogs,
  getSimilarDomains,
} from '@/lib/supabaseClient';

import { Loader2, RefreshCw } from 'lucide-react';

export default function Home() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dashboard data
  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Alerts data
  const [alerts, setAlerts] = useState([]);

  // Profile data
  const [organization, setOrganization] = useState(null);

  // System logs
  const [logs, setLogs] = useState([]);

  // Pagination
  const [page, setPage] = useState(0);
  const threatsPerPage = 10;

  // Ref to skip the initial mount in the page-change effect
  const hasMounted = useRef(false);

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch threats when page changes (skip initial mount)
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    fetchThreats();
  }, [fetchThreats]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchThreats(),
        fetchAlerts(),
        fetchOrganization(),
        fetchLogs(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const data = await getSummaryStats();
    setStats(data);
  };

  const fetchThreats = useCallback(async () => {
    const data = await getRecentThreats(threatsPerPage, page * threatsPerPage);
    setThreats(data);
  }, [page]);

  const fetchAlerts = async () => {
    const data = await getAlerts();
    setAlerts(data);
  };

  const fetchOrganization = async () => {
    // For demo, fetch the first organization
    // In production, you'd get the user's org ID from auth
    const data = await getOrganization('00000000-0000-0000-0000-000000000000');
    setOrganization(data);
  };

  const fetchLogs = async () => {
    const data = await getProcessingLogs(20);
    setLogs(data);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const handleThreatClick = async (threatId) => {
    const details = await getThreatDetails(threatId);
    if (details) {
      setSelectedThreat(details);
      setShowModal(true);
    }
  };

  const handleAlertClick = async (alert) => {
    if (!alert.is_read) {
      await markAlertAsRead(alert.id);
      // Refresh alerts to update read status
      fetchAlerts();
      fetchStats();
    }
    // Show the threat details
    if (alert.threats?.id) {
      handleThreatClick(alert.threats.id);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedThreat(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading Rakshak AI Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                {activeSection === 'dashboard' && 'Threat Intelligence Dashboard'}
                {activeSection === 'monitoring' && 'Regular Threat Detection'}
                {activeSection === 'alerts' && 'Security Alerts'}
                {activeSection === 'domains' && 'Domain Monitoring'}
                {activeSection === 'profile' && 'Organization Profile'}
                {activeSection === 'system' && 'System Logs'}
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1 hidden sm:block">
                Real-time cybersecurity monitoring and threat analysis
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-cyan-500 text-gray-900 font-medium rounded-lg hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <SummaryCards stats={stats} />

              {/* Recent Threats */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    Recent Threats
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="px-3 sm:px-4 py-2 bg-gray-900 text-gray-400 border border-gray-800 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                    >
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </button>
                    <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">
                      Page {page + 1}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={threats.length < threatsPerPage}
                      className="px-3 sm:px-4 py-2 bg-gray-900 text-gray-400 border border-gray-800 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
                <ThreatFeed threats={threats} onThreatClick={handleThreatClick} />
              </div>
            </div>
          )}

          {/* Alerts Section */}
          {activeSection === 'alerts' && (
            <div>
              <div className="mb-6">
                <p className="text-gray-400">
                  {alerts.filter((a) => !a.is_read).length} unread alert
                  {alerts.filter((a) => !a.is_read).length !== 1 ? 's' : ''}
                </p>
              </div>
              <AlertsTable alerts={alerts} onAlertClick={handleAlertClick} />
            </div>
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="max-w-2xl">
              <ProfileCard organization={organization} />
            </div>
          )}

          {/* Monitoring Section */}
          {activeSection === 'monitoring' && (
            <div>
              <ThreatDetection />
            </div>
          )}

          {/* Domains Section */}
          {activeSection === 'domains' && (
            <div>
              <DomainMonitor />
            </div>
          )}

          {/* System Section */}
          {activeSection === 'system' && (
            <div>
              <SystemLogs logs={logs} />
            </div>
          )}
        </div>
      </main>

      {/* Threat Details Modal */}
      {showModal && selectedThreat && (
        <ThreatModal threat={selectedThreat} onClose={closeModal} />
      )}
    </div>
  );
}
