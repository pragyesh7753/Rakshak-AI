/**
 * Threats service
 * Handles all threat-related Supabase queries.
 * Uses the SSR-aware browser client so RLS auth cookies are forwarded.
 */
import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Mock data (used when Supabase is not configured)
// ---------------------------------------------------------------------------
const MOCK_THREATS = [
  {
    id: '1',
    threat_type: 'Ransomware',
    sector: 'Healthcare',
    severity_score: 9,
    credibility_score: 8,
    impact_level: 'critical',
    summary:
      'Highly sophisticated ransomware campaign targeting healthcare sector with advanced encryption and data exfiltration capabilities.',
    raw_posts: {
      id: '1',
      title: 'New Ransomware Campaign Targeting Healthcare',
      content: 'A sophisticated ransomware campaign has been detected targeting healthcare organizations...',
      author: 'security_researcher_42',
      url: 'https://reddit.com/r/cybersecurity/example1',
    },
  },
  {
    id: '2',
    threat_type: 'Zero-Day Exploit',
    sector: 'Technology',
    severity_score: 10,
    credibility_score: 9,
    impact_level: 'critical',
    summary:
      'Critical zero-day vulnerability in enterprise software with active exploitation. Requires immediate attention.',
    raw_posts: {
      id: '2',
      title: 'Critical Zero-Day Vulnerability Discovered',
      content: 'A critical zero-day vulnerability has been discovered in widely-used enterprise software...',
      author: 'anonymous_researcher',
      url: 'https://darkweb.example/thread/12345',
    },
  },
  {
    id: '3',
    threat_type: 'Phishing',
    sector: 'Technology',
    severity_score: 7,
    credibility_score: 7,
    impact_level: 'high',
    summary: 'AI-powered phishing campaign using sophisticated social engineering techniques.',
    raw_posts: {
      id: '3',
      title: 'Phishing Campaign Using AI-Generated Content',
      content: 'Security teams have identified a new phishing campaign using AI-generated emails...',
      author: 'infosec_analyst',
      url: 'https://reddit.com/r/cybersecurity/example2',
    },
  },
  {
    id: '4',
    threat_type: 'Supply Chain Attack',
    sector: 'Technology',
    severity_score: 9,
    credibility_score: 8,
    impact_level: 'critical',
    summary: 'Major supply chain compromise affecting software development tools.',
    raw_posts: {
      id: '4',
      title: 'Supply Chain Attack on Software Vendors',
      content: 'Multiple software vendors have been compromised through a supply chain attack...',
      author: '@cybersec_news',
      url: 'https://twitter.com/security/status/12345',
    },
  },
  {
    id: '5',
    threat_type: 'DDoS',
    sector: 'Finance',
    severity_score: 8,
    credibility_score: 7,
    impact_level: 'high',
    summary:
      'Large-scale DDoS attacks targeting financial institutions using new botnet infrastructure.',
    raw_posts: {
      id: '5',
      title: 'DDoS Attacks Targeting Financial Sector',
      content: 'A series of distributed denial-of-service attacks have been launched...',
      author: 'network_defender',
      url: 'https://reddit.com/r/cybersecurity/example3',
    },
  },
];

function isMockMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return !(url.startsWith('http') && key.length > 20);
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Fetch aggregate summary statistics for the dashboard header cards.
 */
export async function getSummaryStats() {
  if (isMockMode()) {
    return { totalThreats: 42, highSeverity: 8, unreadAlerts: 5, activeSources: 3 };
  }

  try {
    const supabase = createClient();

    const [
      { count: totalThreats },
      { count: highSeverity },
      { count: unreadAlerts },
      { count: activeSources },
    ] = await Promise.all([
      supabase.from('threats').select('id', { count: 'exact', head: true }),
      supabase.from('threats').select('id', { count: 'exact', head: true }).gte('severity_score', 7),
      supabase.from('alerts').select('id', { count: 'exact', head: true }).eq('is_read', false),
      supabase.from('threat_sources').select('id', { count: 'exact', head: true }),
    ]);

    return {
      totalThreats: totalThreats ?? 0,
      highSeverity: highSeverity ?? 0,
      unreadAlerts: unreadAlerts ?? 0,
      activeSources: activeSources ?? 0,
    };
  } catch (error) {
    console.error('[threats.service] getSummaryStats:', error);
    return { totalThreats: 0, highSeverity: 0, unreadAlerts: 0, activeSources: 0 };
  }
}

/**
 * Fetch a paginated list of recent threats ordered by newest first.
 * @param {number} limit
 * @param {number} offset
 */
export async function getRecentThreats(limit = 10, offset = 0) {
  if (isMockMode()) return MOCK_THREATS.slice(offset, offset + limit);

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('threats')
      .select(`
        id,
        threat_type,
        sector,
        severity_score,
        credibility_score,
        impact_level,
        summary,
        raw_post_id,
        raw_posts (
          id,
          title,
          content,
          url,
          author,
          source_id
        )
      `)
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error('[threats.service] getRecentThreats:', error);
    return [];
  }
}

/**
 * Fetch full details of a single threat including source information.
 * @param {string} threatId
 */
export async function getThreatDetails(threatId) {
  if (isMockMode()) {
    return {
      id: threatId,
      threat_type: 'Ransomware',
      sector: 'Healthcare',
      severity_score: 9,
      credibility_score: 8,
      impact_level: 'critical',
      summary:
        'Highly sophisticated ransomware campaign targeting healthcare sector with advanced encryption and data exfiltration capabilities. Multiple organizations affected.',
      raw_posts: {
        id: '1',
        title: 'New Ransomware Campaign Targeting Healthcare',
        content:
          'A sophisticated ransomware campaign has been detected targeting healthcare organizations. The malware uses advanced encryption and exfiltrates data before encryption. Multiple hospitals have been affected across the region.',
        url: 'https://reddit.com/r/cybersecurity/example1',
        author: 'security_researcher_42',
        source_id: '1',
        threat_sources: { id: '1', name: 'Reddit r/cybersecurity', type: 'forum' },
      },
    };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('threats')
      .select(`
        id,
        threat_type,
        sector,
        severity_score,
        credibility_score,
        impact_level,
        summary,
        raw_posts (
          id,
          title,
          content,
          url,
          author,
          source_id,
          threat_sources (
            id,
            name,
            type
          )
        )
      `)
      .eq('id', threatId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[threats.service] getThreatDetails:', error);
    return null;
  }
}
