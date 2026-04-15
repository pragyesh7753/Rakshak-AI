/**
 * Alerts service
 * Handles alert queries and mutations.
 */
import { apiRequest } from '@/lib/api/client';

/**
 * Fetch alerts for the authenticated organisation, newest first.
 */
export async function getAlerts(getToken) {
  return apiRequest('/alerts', { getToken });
}

/**
 * Mark a single alert as read.
 * @param {string} alertId
 * @returns {Promise<boolean>}
 */
export async function markAlertAsRead(alertId, getToken) {
  try {
    await apiRequest(`/alerts/${alertId}/read`, {
      method: 'PATCH',
      getToken,
    });
    return true;
  } catch (error) {
    console.error('[alerts.service] markAlertAsRead:', error);
    return false;
  }
}
