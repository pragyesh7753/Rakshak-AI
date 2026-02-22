'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getSummaryStats, getRecentThreats, getThreatDetails } from '@/features/threats/services/threats.service';
import { getAlerts, markAlertAsRead } from '@/features/alerts/services/alerts.service';
import { getOrganization } from '@/features/organization/services/organization.service';
import { getProcessingLogs } from '@/features/system/services/logs.service';

const THREATS_PER_PAGE = 10;

/**
 * Centralised data-fetching hook for the dashboard.
 * Keeps the page component lean and purely presentational.
 */
export function useDashboardData() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [alerts, setAlerts] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [logs, setLogs] = useState([]);

  const [page, setPage] = useState(0);
  const hasMounted = useRef(false);

  // ---------------------------------------------------------------------------
  // Individual fetchers
  // ---------------------------------------------------------------------------

  const fetchStats = useCallback(async () => {
    const data = await getSummaryStats();
    setStats(data);
  }, []);

  const fetchThreats = useCallback(async () => {
    const data = await getRecentThreats(THREATS_PER_PAGE, page * THREATS_PER_PAGE);
    setThreats(data);
  }, [page]);

  const fetchAlerts = useCallback(async () => {
    const data = await getAlerts();
    setAlerts(data);
  }, []);

  const fetchOrganization = useCallback(async (userId) => {
    const data = await getOrganization(userId ?? '00000000-0000-0000-0000-000000000000');
    setOrganization(data);
  }, []);

  const fetchLogs = useCallback(async () => {
    const data = await getProcessingLogs(20);
    setLogs(data);
  }, []);

  // ---------------------------------------------------------------------------
  // Aggregate fetcher (initial load + refresh)
  // ---------------------------------------------------------------------------

  const fetchAllData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      await Promise.all([
        fetchStats(),
        fetchThreats(),
        fetchAlerts(),
        fetchOrganization(currentUser?.id),
        fetchLogs(),
      ]);
    } catch (error) {
      console.error('[useDashboardData] fetchAllData:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchThreats, fetchAlerts, fetchOrganization, fetchLogs]);

  // Initial load
  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch threats when page changes (skip on first mount to avoid double-fetch)
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    fetchThreats();
  }, [fetchThreats]);

  // ---------------------------------------------------------------------------
  // Action handlers
  // ---------------------------------------------------------------------------

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
      // Refresh alerts and stats in parallel — no need to await sequentially
      Promise.all([fetchAlerts(), fetchStats()]);
    }
    if (alert.threats?.id) {
      handleThreatClick(alert.threats.id);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedThreat(null);
  };

  return {
    // State
    user,
    loading,
    refreshing,
    stats,
    threats,
    selectedThreat,
    showModal,
    alerts,
    organization,
    logs,
    page,
    threatsPerPage: THREATS_PER_PAGE,
    // Actions
    setPage,
    handleRefresh,
    handleThreatClick,
    handleAlertClick,
    closeModal,
  };
}
