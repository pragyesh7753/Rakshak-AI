/**
 * Monitoring service
 * Handles system security status and threat log queries.
 */
import { apiRequest } from '@/lib/api/client';

/**
 * Fetch the current system security health overview.
 */
export async function getSystemSecurityStatus(getToken) {
  return apiRequest('/monitoring/security-status', { getToken });
}

/**
 * Fetch recent security threat events (brute-force, injections, etc.).
 * @param {number} limit
 */
export async function getSecurityThreatLogs(limit = 20, getToken) {
  return apiRequest('/monitoring/security-logs', {
    getToken,
    query: { limit },
  });
}
