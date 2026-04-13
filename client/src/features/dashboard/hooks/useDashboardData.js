'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getSummaryStats, getRecentThreats, getThreatDetails } from '@/features/threats/services/threats.service';
import { getAlerts, markAlertAsRead } from '@/features/alerts/services/alerts.service';
import { getOrganization } from '@/features/organization/services/organization.service';
import { getProcessingLogs } from '@/features/system/services/logs.service';
import { useAuthedApi } from '@/hooks/use-authed-api';

const THREATS_PER_PAGE = 10;

/**
 * Centralised data-fetching hook for the dashboard.
 * Keeps the page component lean and purely presentational.
 */
export function useDashboardData() {
  const { callService, isAuthLoaded, isSignedIn } = useAuthedApi();
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();

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
    const data = await callService(getSummaryStats);
    setStats(data);
  }, [callService]);

  const fetchThreats = useCallback(async () => {
    const data = await callService(getRecentThreats, THREATS_PER_PAGE, page * THREATS_PER_PAGE);
    setThreats(data);
  }, [callService, page]);

  const fetchAlerts = useCallback(async () => {
    const data = await callService(getAlerts);
    setAlerts(data);
  }, [callService]);

  const fetchOrganization = useCallback(async () => {
    const data = await callService(getOrganization);
    setOrganization(data);
  }, [callService]);

  const fetchLogs = useCallback(async () => {
    const data = await callService(getProcessingLogs, 20);
    setLogs(data);
  }, [callService]);

  // ---------------------------------------------------------------------------
  // Aggregate fetcher (initial load + refresh)
  // ---------------------------------------------------------------------------

  const fetchAllData = useCallback(async () => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    try {
      setUser(
        clerkUser
          ? {
              id: clerkUser.id,
              email: clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses?.[0]?.emailAddress,
            }
          : null
      );

      await Promise.all([
        fetchStats(),
        fetchThreats(),
        fetchAlerts(),
        fetchOrganization(),
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
    if (!isAuthLoaded || !isUserLoaded) {
      return;
    }
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoaded, isUserLoaded, isSignedIn, clerkUser?.id]);

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
    const details = await callService(getThreatDetails, threatId);
    if (details) {
      setSelectedThreat(details);
      setShowModal(true);
    }
  };

  const handleAlertClick = async (alert) => {
    if (!alert.is_read) {
      await callService(markAlertAsRead, alert.id);
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
