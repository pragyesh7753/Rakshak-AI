/**
 * Domains service
 * Handles similar-domain monitoring queries.
 */
import { apiRequest } from '@/lib/api/client';

/**
 * Fetch similar/lookalike domains registered near the organisation's domain.
 */
export async function getSimilarDomains(getToken) {
  return apiRequest('/domains/similar', { getToken });
}

/**
 * Fetch activity log for a single similar domain.
 * @param {string} domainId
 */
export async function getDomainActivities(domainId, getToken) {
  return apiRequest(`/domains/${domainId}/activities`, { getToken });
}

/**
 * Fetch recent activity across all similar domains (global activity feed).
 * @param {number} limit
 */
export async function getGlobalDomainActivities(limit = 20, getToken) {
  return apiRequest('/domains/activities/global', {
    getToken,
    query: { limit },
  });
}
