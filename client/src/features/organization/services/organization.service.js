/**
 * Organisation service
 * Handles organisation profile reads.
 * Bug fixed: query.eq() result was previously not assigned back, so the
 * .eq('id', organizationId) filter was silently ignored.
 */
import { createClient } from '@/lib/supabase/client';

const PLACEHOLDER_ID = '00000000-0000-0000-0000-000000000000';

function isMockMode() {
  const url = import.meta.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return !(url.startsWith('http') && key.length > 20);
}

/**
 * Fetch an organisation row by user ID.
 * Falls back to the first row when ID is a placeholder (dev convenience).
 * @param {string | null} organizationId
 */
export async function getOrganization(organizationId) {
  if (isMockMode()) {
    return {
      id: organizationId,
      org_name: 'CyberTech Industries',
      sector: 'Technology',
      domain: 'cybertech.example.com',
      keywords: ['ransomware', 'data breach', 'vulnerability', 'exploit', 'phishing'],
    };
  }

  try {
    const supabase = createClient();
    let query = supabase.from('organizations').select('*');

    // Fix: assign the filtered query back to the variable
    if (organizationId && organizationId !== PLACEHOLDER_ID) {
      query = query.eq('id', organizationId);
    }

    const { data, error } = await query.limit(1).maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[organization.service] getOrganization:', error);
    return null;
  }
}
