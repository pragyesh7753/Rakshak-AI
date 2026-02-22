/**
 * Alerts service
 * Handles alert queries and mutations.
 */
import { createClient } from '@/lib/supabase/client';

function isMockMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return !(url.startsWith('http') && key.length > 20);
}

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
 * @param {string | null} organizationId
 */
export async function getAlerts(organizationId = null) {
  if (isMockMode()) return mockAlerts();

  try {
    const supabase = createClient();
    let query = supabase
      .from('alerts')
      .select(`
        id,
        is_read,
        created_at,
        threats (
          id,
          threat_type,
          sector,
          severity_score
        )
      `)
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error('[alerts.service] getAlerts:', error);
    return [];
  }
}

/**
 * Mark a single alert as read.
 * @param {string} alertId
 * @returns {Promise<boolean>}
 */
export async function markAlertAsRead(alertId) {
  if (isMockMode()) {
    console.log(`[mock] Alert ${alertId} marked as read`);
    return true;
  }

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', alertId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[alerts.service] markAlertAsRead:', error);
    return false;
  }
}
