import { apiRequest } from '@/lib/api/client';

/**
 * Fetch organization-scoped email intelligence analysis records.
 * @param {number} limit
 */
export async function getEmailIntelligenceResults(limit = 30, getToken) {
  return apiRequest('/email/intelligence', {
    getToken,
    query: { limit },
  });
}
