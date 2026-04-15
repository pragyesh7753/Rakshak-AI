/**
 * Threats service
 * Handles threat-related backend API queries.
 */
import { apiRequest } from '@/lib/api/client';

/**
 * Fetch aggregate summary statistics for the dashboard header cards.
 */
export async function getSummaryStats(getToken) {
  return apiRequest('/threats/summary', { getToken });
}

/**
 * Fetch a paginated list of recent threats ordered by newest first.
 * @param {number} limit
 * @param {number} offset
 */
export async function getRecentThreats(limit = 10, offset = 0, getToken) {
  return apiRequest('/threats', {
    getToken,
    query: { limit, offset },
  });
}

/**
 * Fetch full details of a single threat including source information.
 * @param {string} threatId
 */
export async function getThreatDetails(threatId, getToken) {
  return apiRequest(`/threats/${threatId}`, { getToken });
}
