/**
 * Alerts service
 * Handles alert queries and mutations.
 */
import { apiRequest } from '@/lib/api/client';

const mockAlerts = () => {
  const now = new Date();
  return [
    { id: '1', is_read: false, created_at: new Date(now - 30 * 60000).toISOString(),   threats: { id: '1', threat_type: 'Ransomware',         sector: 'Healthcare', severity_score: 9  } },
    { id: '2', is_read: false, created_at: new Date(now - 60 * 60000).toISOString(),   threats: { id: '2', threat_type: 'Zero-Day Exploit',    sector: 'Technology', severity_score: 10 } },
    { id: '3', is_read: true,  created_at: new Date(now - 120 * 60000).toISOString(),  threats: { id: '3', threat_type: 'Phishing',            sector: 'Technology', severity_score: 7  } },
    { id: '4', is_read: false, created_at: new Date(now - 180 * 60000).toISOString(),  threats: { id: '4', threat_type: 'Supply Chain Attack', sector: 'Technology', severity_score: 9  } },
    { id: '5', is_read: true,  created_at: new Date(now - 240 * 60000).toISOString(),  threats: { id: '5', threat_type: 'DDoS',                sector: 'Finance',    severity_score: 8  } },
  ];
};

/**
 * Fetch alerts for the authenticated organisation, newest first.
 */
export async function getAlerts(getToken) {
  try {
    return await apiRequest('/alerts', { getToken });
  } catch (error) {
    console.error('[alerts.service] getAlerts:', error);
    return mockAlerts();
  }
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
