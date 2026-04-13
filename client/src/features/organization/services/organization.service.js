/**
 * Organisation service
 * Handles organisation profile reads.
 */
import { apiRequest } from '@/lib/api/client';

/**
 * Fetch an organisation row by user ID.
 * @param {() => Promise<string | null>} getToken
 */
export async function getOrganization(getToken) {
  try {
    return await apiRequest('/organizations/me', { getToken });
  } catch (error) {
    console.error('[organization.service] getOrganization:', error);
    return null;
  }
}

/**
 * Create or update the signed-in user's organization profile.
 * @param {{ org_name: string, sector: string, domain: string, keywords?: string[] }} payload
 * @param {() => Promise<string | null>} getToken
 */
export async function upsertOrganization(payload, getToken) {
  return apiRequest('/organizations/me', {
    method: 'POST',
    body: payload,
    getToken,
  });
}
