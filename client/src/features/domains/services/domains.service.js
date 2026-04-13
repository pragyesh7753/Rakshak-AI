/**
 * Domains service
 * Handles similar-domain monitoring queries.
 */
import { apiRequest } from '@/lib/api/client';

const MOCK_DOMAINS = [
  { id: 'd1', domain_name: 'cybertech-support.com',  similarity_score: 0.85, registration_date: '2024-01-15', status: 'active' },
  { id: 'd2', domain_name: 'cybertech-login.net',    similarity_score: 0.92, registration_date: '2024-02-10', status: 'active' },
  { id: 'd3', domain_name: 'cybertach.com',          similarity_score: 0.78, registration_date: '2023-11-20', status: 'parked' },
  { id: 'd4', domain_name: 'cyber-tech-portal.io',   similarity_score: 0.88, registration_date: '2024-03-01', status: 'active' },
  { id: 'd5', domain_name: 'cybertech-verify.com',   similarity_score: 0.95, registration_date: '2024-03-05', status: 'active' },
];

const MOCK_ACTIVITIES = {
  d1: [
    { id: 'a1', activity_type: 'DNS Update',       description: "Updated MX records to point to suspiciously similar mail server.", severity: 'medium', is_suspicious: true,  detected_at: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 'a2', activity_type: 'SSL Issued',        description: "Let's Encrypt certificate issued for domain.",                     severity: 'low',    is_suspicious: false, detected_at: new Date(Date.now() - 3600000 * 96).toISOString() },
  ],
  d2: [
    { id: 'a3', activity_type: 'Cloning Detected',  description: 'Webpage content matches 95% of official login page.',              severity: 'high',   is_suspicious: true,  detected_at: new Date(Date.now() - 3600000 * 5).toISOString() },
    { id: 'a4', activity_type: 'Traffic Spike',     description: 'Sudden increase in traffic from social media referrals.',          severity: 'medium', is_suspicious: true,  detected_at: new Date(Date.now() - 3600000 * 36).toISOString() },
  ],
  d3: [
    { id: 'a5', activity_type: 'Domain Parked',     description: 'Standard parking page detected with advertising links.',           severity: 'low',    is_suspicious: false, detected_at: new Date(Date.now() - 3600000 * 120).toISOString() },
  ],
  d4: [
    { id: 'a6', activity_type: 'New API Endpoint',  description: 'Exposed /api/v1/login endpoint with unsecured configurations.',    severity: 'high',   is_suspicious: true,  detected_at: new Date(Date.now() - 3600000 * 24).toISOString() },
    { id: 'a7', activity_type: 'Content Update',    description: 'Portal content updated with official branding.',                   severity: 'medium', is_suspicious: true,  detected_at: new Date(Date.now() - 3600000 * 48).toISOString() },
  ],
  d5: [
    { id: 'a8', activity_type: 'Phishing Detected', description: 'AI analysis confirmed phishing page targeting employee credentials.', severity: 'high', is_suspicious: true, detected_at: new Date(Date.now() - 3600000 * 12).toISOString() },
    { id: 'a9', activity_type: 'DGA Pattern',       description: 'Domain name follows a pseudo-random generated pattern used by C2 servers.', severity: 'high', is_suspicious: true, detected_at: new Date(Date.now() - 3600000 * 72).toISOString() },
  ],
};

/**
 * Fetch similar/lookalike domains registered near the organisation's domain.
 */
export async function getSimilarDomains(getToken) {
  try {
    return await apiRequest('/domains/similar', { getToken });
  } catch (error) {
    console.error('[domains.service] getSimilarDomains:', error);
    return MOCK_DOMAINS;
  }
}

/**
 * Fetch activity log for a single similar domain.
 * @param {string} domainId
 */
export async function getDomainActivities(domainId, getToken) {
  try {
    return await apiRequest(`/domains/${domainId}/activities`, { getToken });
  } catch (error) {
    console.error('[domains.service] getDomainActivities:', error);
    return MOCK_ACTIVITIES[domainId] ?? [];
  }
}

/**
 * Fetch recent activity across all similar domains (global activity feed).
 * @param {number} limit
 */
export async function getGlobalDomainActivities(limit = 20, getToken) {
  try {
    return await apiRequest('/domains/activities/global', {
      getToken,
      query: { limit },
    });
  } catch (error) {
    console.error('[domains.service] getGlobalDomainActivities:', error);
    const all = [
      { id: 'a1', domain_name: 'cybertech-support.com', activity_type: 'DNS Update',       description: 'Updated MX records to point to suspiciously similar mail server.', severity: 'medium', is_suspicious: true,  detected_at: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: 'a3', domain_name: 'cybertech-login.net',   activity_type: 'Cloning Detected',  description: 'Webpage content matches 95% of official login page.',              severity: 'high',   is_suspicious: true,  detected_at: new Date(Date.now() - 3600000 * 5).toISOString() },
      { id: 'a8', domain_name: 'cybertech-verify.com',  activity_type: 'Phishing Detected', description: 'AI analysis confirmed phishing page targeting employee credentials.', severity: 'high', is_suspicious: true,  detected_at: new Date(Date.now() - 3600000 * 12).toISOString() },
      { id: 'a6', domain_name: 'cyber-tech-portal.io',  activity_type: 'New API Endpoint',  description: 'Exposed /api/v1/login endpoint with unsecured configurations.',    severity: 'high',   is_suspicious: true,  detected_at: new Date(Date.now() - 3600000 * 24).toISOString() },
      { id: 'a4', domain_name: 'cybertech-login.net',   activity_type: 'Traffic Spike',     description: 'Sudden increase in traffic from social media referrals.',          severity: 'medium', is_suspicious: true,  detected_at: new Date(Date.now() - 3600000 * 36).toISOString() },
      { id: 'a7', domain_name: 'cyber-tech-portal.io',  activity_type: 'Content Update',    description: 'Portal content updated with official branding.',                   severity: 'medium', is_suspicious: true,  detected_at: new Date(Date.now() - 3600000 * 48).toISOString() },
      { id: 'a2', domain_name: 'cybertech-support.com', activity_type: 'SSL Issued',        description: "Let's Encrypt certificate issued for domain.",                     severity: 'low',    is_suspicious: false, detected_at: new Date(Date.now() - 3600000 * 96).toISOString() },
      { id: 'a5', domain_name: 'cybertach.com',         activity_type: 'Domain Parked',     description: 'Standard parking page detected with advertising links.',           severity: 'low',    is_suspicious: false, detected_at: new Date(Date.now() - 3600000 * 120).toISOString() },
    ];
    return all.slice(0, limit);
  }
}
