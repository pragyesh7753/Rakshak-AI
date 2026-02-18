import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate Supabase configuration
const isConfigured = supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey && supabaseAnonKey.length > 20;

if (!isConfigured) {
  console.warn('⚠️  Supabase not configured properly. Using mock data for development.');
  console.warn('Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
}

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
export const useMockData = true; // Set to true to show mock data as requested

// Fetch summary statistics
export async function getSummaryStats() {
  if (useMockData) {
    return {
      totalThreats: 42,
      highSeverity: 8,
      unreadAlerts: 5,
      activeSources: 3,
    };
  }

  try {
    const { data: totalThreats, error: threatsError } = await supabase
      .from('threats')
      .select('id', { count: 'exact', head: true });

    const { data: highSeverity, error: highError } = await supabase
      .from('threats')
      .select('id', { count: 'exact', head: true })
      .gte('severity_score', 7);

    const { data: unreadAlerts, error: alertsError } = await supabase
      .from('alerts')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false);

    const { data: activeSources, error: sourcesError } = await supabase
      .from('threat_sources')
      .select('id', { count: 'exact', head: true });

    return {
      totalThreats: totalThreats || 0,
      highSeverity: highSeverity || 0,
      unreadAlerts: unreadAlerts || 0,
      activeSources: activeSources || 0,
    };
  } catch (error) {
    console.error('Error fetching summary stats:', error);
    return {
      totalThreats: 0,
      highSeverity: 0,
      unreadAlerts: 0,
      activeSources: 0,
    };
  }
}

// Fetch recent threats
export async function getRecentThreats(limit = 10, offset = 0) {
  if (useMockData) {
    const mockThreats = [
      {
        id: '1',
        threat_type: 'Ransomware',
        sector: 'Healthcare',
        severity_score: 9,
        credibility_score: 8,
        impact_level: 'critical',
        summary: 'Highly sophisticated ransomware campaign targeting healthcare sector with advanced encryption and data exfiltration capabilities.',
        raw_posts: {
          id: '1',
          title: 'New Ransomware Campaign Targeting Healthcare',
          content: 'A sophisticated ransomware campaign has been detected targeting healthcare organizations...',
          author: 'security_researcher_42',
          url: 'https://reddit.com/r/cybersecurity/example1'
        }
      },
      {
        id: '2',
        threat_type: 'Zero-Day Exploit',
        sector: 'Technology',
        severity_score: 10,
        credibility_score: 9,
        impact_level: 'critical',
        summary: 'Critical zero-day vulnerability in enterprise software with active exploitation. Requires immediate attention.',
        raw_posts: {
          id: '2',
          title: 'Critical Zero-Day Vulnerability Discovered',
          content: 'A critical zero-day vulnerability has been discovered in widely-used enterprise software...',
          author: 'anonymous_researcher',
          url: 'https://darkweb.example/thread/12345'
        }
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
          url: 'https://reddit.com/r/cybersecurity/example2'
        }
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
          url: 'https://twitter.com/security/status/12345'
        }
      },
      {
        id: '5',
        threat_type: 'DDoS',
        sector: 'Finance',
        severity_score: 8,
        credibility_score: 7,
        impact_level: 'high',
        summary: 'Large-scale DDoS attacks targeting financial institutions using new botnet infrastructure.',
        raw_posts: {
          id: '5',
          title: 'DDoS Attacks Targeting Financial Sector',
          content: 'A series of distributed denial-of-service attacks have been launched...',
          author: 'network_defender',
          url: 'https://reddit.com/r/cybersecurity/example3'
        }
      }
    ];
    return mockThreats.slice(offset, offset + limit);
  }

  try {
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
    return data || [];
  } catch (error) {
    console.error('Error fetching recent threats:', error);
    return [];
  }
}

// Fetch threat details
export async function getThreatDetails(threatId) {
  if (useMockData) {
    return {
      id: threatId,
      threat_type: 'Ransomware',
      sector: 'Healthcare',
      severity_score: 9,
      credibility_score: 8,
      impact_level: 'critical',
      summary: 'Highly sophisticated ransomware campaign targeting healthcare sector with advanced encryption and data exfiltration capabilities. Multiple organizations affected.',
      raw_posts: {
        id: '1',
        title: 'New Ransomware Campaign Targeting Healthcare',
        content: 'A sophisticated ransomware campaign has been detected targeting healthcare organizations. The malware uses advanced encryption and exfiltrates data before encryption. Multiple hospitals have been affected across the region. Security researchers have identified the threat actor as a known APT group with ties to organized crime. Indicators of compromise have been shared with the community.',
        url: 'https://reddit.com/r/cybersecurity/example1',
        author: 'security_researcher_42',
        source_id: '1',
        threat_sources: {
          id: '1',
          name: 'Reddit r/cybersecurity',
          type: 'forum'
        }
      }
    };
  }

  try {
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
    console.error('Error fetching threat details:', error);
    return null;
  }
}

// Fetch alerts
export async function getAlerts(organizationId = null) {
  if (useMockData) {
    const now = new Date();
    return [
      {
        id: '1',
        is_read: false,
        created_at: new Date(now - 30 * 60000).toISOString(),
        threats: {
          id: '1',
          threat_type: 'Ransomware',
          sector: 'Healthcare',
          severity_score: 9
        }
      },
      {
        id: '2',
        is_read: false,
        created_at: new Date(now - 60 * 60000).toISOString(),
        threats: {
          id: '2',
          threat_type: 'Zero-Day Exploit',
          sector: 'Technology',
          severity_score: 10
        }
      },
      {
        id: '3',
        is_read: true,
        created_at: new Date(now - 120 * 60000).toISOString(),
        threats: {
          id: '3',
          threat_type: 'Phishing',
          sector: 'Technology',
          severity_score: 7
        }
      },
      {
        id: '4',
        is_read: false,
        created_at: new Date(now - 180 * 60000).toISOString(),
        threats: {
          id: '4',
          threat_type: 'Supply Chain Attack',
          sector: 'Technology',
          severity_score: 9
        }
      },
      {
        id: '5',
        is_read: true,
        created_at: new Date(now - 240 * 60000).toISOString(),
        threats: {
          id: '5',
          threat_type: 'DDoS',
          sector: 'Finance',
          severity_score: 8
        }
      }
    ];
  }

  try {
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
    return data || [];
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}

// Mark alert as read
export async function markAlertAsRead(alertId) {
  if (useMockData) {
    console.log('Mock: Alert', alertId, 'marked as read');
    return true;
  }

  try {
    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', alertId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking alert as read:', error);
    return false;
  }
}

// Fetch organization details
export async function getOrganization(organizationId) {
  if (useMockData) {
    return {
      id: organizationId,
      org_name: 'CyberTech Industries',
      sector: 'Technology',
      domain: 'cybertech.example.com',
      keywords: ['ransomware', 'data breach', 'vulnerability', 'exploit', 'phishing']
    };
  }

  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
}

// Fetch processing logs
export async function getProcessingLogs(limit = 20) {
  if (useMockData) {
    const now = new Date();
    return [
      {
        id: '1',
        job_type: 'reddit_scraper',
        status: 'running',
        message: '[LIVE] Scraping r/cybersecurity - Processing thread #1847 | Posts: 24/150 | Rate limit: 87% available',
        created_at: new Date(now - 15000).toISOString()
      },
      {
        id: '2',
        job_type: 'ai_analysis',
        status: 'processing',
        message: '[LIVE] Gemini AI analyzing post batch #42 | Threat detection: 3 potential matches | Confidence: 0.87',
        created_at: new Date(now - 30000).toISOString()
      },
      {
        id: '3',
        job_type: 'threat_scoring',
        status: 'success',
        message: '[COMPLETED] Threat score calculation finished | Processed: 12 threats | Avg severity: 7.2/10 | Duration: 1.2s',
        created_at: new Date(now - 45000).toISOString()
      },
      {
        id: '4',
        job_type: 'darkweb_monitor',
        status: 'success',
        message: '[COMPLETED] Tor network scan complete | Forums checked: 8 | New posts: 47 | Threats detected: 2',
        created_at: new Date(now - 2 * 60000).toISOString()
      },
      {
        id: '5',
        job_type: 'credential_leak_scan',
        status: 'success',
        message: '[COMPLETED] Scanned 1,247 credentials across 15 breach databases | Compromised: 0 | Clean: 1,247',
        created_at: new Date(now - 3 * 60000).toISOString()
      },
      {
        id: '6',
        job_type: 'reddit_scraper',
        status: 'failed',
        message: '[ERROR] Rate limit exceeded on endpoint /r/netsec | HTTP 429 | Retry scheduled in 120s | Backoff: exponential',
        created_at: new Date(now - 5 * 60000).toISOString()
      },
      {
        id: '7',
        job_type: 'alert_generation',
        status: 'success',
        message: '[COMPLETED] Generated 5 new alerts | Critical: 2, High: 3 | Organizations notified: 3 | Email queue: dispatched',
        created_at: new Date(now - 7 * 60000).toISOString()
      },
      {
        id: '8',
        job_type: 'vulnerability_sync',
        status: 'success',
        message: '[COMPLETED] NVD database synchronized | New CVEs: 37 | Updated: 12 | Critical severity: 8 | Last sync: success',
        created_at: new Date(now - 10 * 60000).toISOString()
      },
      {
        id: '9',
        job_type: 'twitter_monitor',
        status: 'success',
        message: '[COMPLETED] Twitter API polling finished | Tweets analyzed: 3,421 | Security keywords matched: 89 | Threats: 4',
        created_at: new Date(now - 12 * 60000).toISOString()
      },
      {
        id: '10',
        job_type: 'threat_intel_feed',
        status: 'success',
        message: '[COMPLETED] External threat feeds ingested | Sources: 5 | IOCs collected: 1,829 | Malware hashes: 347',
        created_at: new Date(now - 15 * 60000).toISOString()
      },
      {
        id: '11',
        job_type: 'ml_model_inference',
        status: 'success',
        message: '[COMPLETED] ML threat classification model run | Batch size: 150 | Accuracy: 94.2% | False positives: 3',
        created_at: new Date(now - 18 * 60000).toISOString()
      },
      {
        id: '12',
        job_type: 'ioc_enrichment',
        status: 'success',
        message: '[COMPLETED] IOC enrichment via VirusTotal API | IPs checked: 64 | Malicious: 12 | URLs scanned: 89',
        created_at: new Date(now - 20 * 60000).toISOString()
      },
      {
        id: '13',
        job_type: 'database_cleanup',
        status: 'success',
        message: '[COMPLETED] Database maintenance completed | Old records purged: 1,247 | Indexes optimized: 8 | Disk freed: 2.4GB',
        created_at: new Date(now - 25 * 60000).toISOString()
      },
      {
        id: '14',
        job_type: 'github_monitor',
        status: 'success',
        message: '[COMPLETED] GitHub security advisories checked | New advisories: 15 | Affected repos: 234 | Critical: 3',
        created_at: new Date(now - 30 * 60000).toISOString()
      },
      {
        id: '15',
        job_type: 'threat_correlation',
        status: 'success',
        message: '[COMPLETED] Cross-source threat correlation analysis | Patterns matched: 7 | Campaign clusters: 2 | Confidence: high',
        created_at: new Date(now - 35 * 60000).toISOString()
      },
      {
        id: '16',
        job_type: 'reddit_scraper',
        status: 'success',
        message: '[COMPLETED] r/cybersecurity scan finished | Posts scraped: 150 | Comments: 1,284 | Threats flagged: 8',
        created_at: new Date(now - 40 * 60000).toISOString()
      },
      {
        id: '17',
        job_type: 'webhook_delivery',
        status: 'success',
        message: '[COMPLETED] Alert webhooks dispatched | Endpoints: 5 | Successful: 5 | Failed: 0 | Avg latency: 145ms',
        created_at: new Date(now - 45 * 60000).toISOString()
      },
      {
        id: '18',
        job_type: 'data_pipeline',
        status: 'success',
        message: '[COMPLETED] ETL pipeline execution | Raw records: 15,847 | Processed: 15,823 | Failed: 24 | Success rate: 99.8%',
        created_at: new Date(now - 50 * 60000).toISOString()
      },
      {
        id: '19',
        job_type: 'threat_deduplication',
        status: 'success',
        message: '[COMPLETED] Duplicate threat detection | Total analyzed: 8,421 | Duplicates removed: 127 | Unique threats: 8,294',
        created_at: new Date(now - 55 * 60000).toISOString()
      },
      {
        id: '20',
        job_type: 'backup_job',
        status: 'success',
        message: '[COMPLETED] Database backup to S3 | Size: 4.7GB | Compression: 68% | Duration: 42s | Integrity: verified',
        created_at: new Date(now - 60 * 60000).toISOString()
      }
    ];
  }

  try {
    const { data, error } = await supabase
      .from('processing_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching processing logs:', error);
    return [];
  }
}
// Fetch similar domains
export async function getSimilarDomains(organizationId = null) {
  if (useMockData) {
    return [
      {
        id: 'd1',
        domain_name: 'cybertech-support.com',
        similarity_score: 0.85,
        registration_date: '2024-01-15',
        status: 'active',
      },
      {
        id: 'd2',
        domain_name: 'cybertech-login.net',
        similarity_score: 0.92,
        registration_date: '2024-02-10',
        status: 'active',
      },
      {
        id: 'd3',
        domain_name: 'cybertach.com',
        similarity_score: 0.78,
        registration_date: '2023-11-20',
        status: 'parked',
      },
      {
        id: 'd4',
        domain_name: 'cyber-tech-portal.io',
        similarity_score: 0.88,
        registration_date: '2024-03-05',
        status: 'active',
      },
      {
        id: 'd5',
        domain_name: 'cybertech-verify.com',
        similarity_score: 0.95,
        registration_date: '2024-04-12',
        status: 'active',
      },
    ];
  }

  try {
    let query = supabase
      .from('similar_domains')
      .select('*')
      .order('similarity_score', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching similar domains:', error);
    return [];
  }
}

// Fetch activities for a specific domain
export async function getDomainActivities(domainId) {
  if (useMockData) {
    const activities = {
      'd1': [
        { id: 'a1', activity_type: 'DNS Update', description: 'Updated MX records to point to suspicious mail server (mx.malicious-host.su).', severity: 'medium', is_suspicious: true, detected_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString() },
        { id: 'a2', activity_type: 'SSL Issued', description: 'Let\'s Encrypt certificate issued for domain.', severity: 'low', is_suspicious: false, detected_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString() },
      ],
      'd2': [
        { id: 'a3', activity_type: 'Cloning Detected', description: 'Webpage content matches 95% of cybertech.example.com login page.', severity: 'high', is_suspicious: true, detected_at: new Date(Date.now() - 1 * 24 * 3600000).toISOString() },
        { id: 'a4', activity_type: 'Traffic Spike', description: 'Sudden increase in traffic from social media referrals (Facebook/WhatsApp).', severity: 'medium', is_suspicious: true, detected_at: new Date(Date.now() - 12 * 3600000).toISOString() },
      ],
      'd3': [
        { id: 'a5', activity_type: 'Domain Parked', description: 'Standard parking page detected with advertising links.', severity: 'low', is_suspicious: false, detected_at: new Date(Date.now() - 30 * 24 * 3600000).toISOString() },
      ],
      'd4': [
        { id: 'a6', activity_type: 'New API Endpoint', description: 'Exposed /api/v1/login endpoint with unsecured configurations.', severity: 'high', is_suspicious: true, detected_at: new Date(Date.now() - 3 * 3600000).toISOString() },
        { id: 'a7', activity_type: 'Content Update', description: 'Portal content updated with branding images from your official site.', severity: 'medium', is_suspicious: true, detected_at: new Date(Date.now() - 8 * 3600000).toISOString() },
      ],
      'd5': [
        { id: 'a8', activity_type: 'Phishing Detected', description: 'AI analysis confirmed phishing page targeting employee credentials.', severity: 'high', is_suspicious: true, detected_at: new Date(Date.now() - 2 * 3600000).toISOString() },
        { id: 'a9', activity_type: 'DGA Pattern', description: 'Domain name follows a pseudo-random generated pattern used by C2 servers.', severity: 'high', is_suspicious: true, detected_at: new Date(Date.now() - 5 * 3600000).toISOString() },
      ]
    };
    return activities[domainId] || [];
  }

  try {
    const { data, error } = await supabase
      .from('domain_activities')
      .select('*')
      .eq('domain_id', domainId)
      .order('detected_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching domain activities:', error);
    return [];
  }
}

// Fetch activities across all similar domains (for global logs)
export async function getGlobalDomainActivities(limit = 20) {
  if (useMockData) {
    const allActivities = [
      { id: 'a1', domain_name: 'cybertech-support.com', activity_type: 'DNS Update', description: 'Updated MX records to point to suspicious mail server (mx.malicious-host.su).', severity: 'medium', is_suspicious: true, detected_at: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: 'a3', domain_name: 'cybertech-login.net', activity_type: 'Cloning Detected', description: 'Webpage content matches 95% of official login page.', severity: 'high', is_suspicious: true, detected_at: new Date(Date.now() - 3600000 * 5).toISOString() },
      { id: 'a8', domain_name: 'cybertech-verify.com', activity_type: 'Phishing Detected', description: 'AI analysis confirmed phishing page targeting employee credentials.', severity: 'high', is_suspicious: true, detected_at: new Date(Date.now() - 3600000 * 12).toISOString() },
      { id: 'a6', domain_name: 'cyber-tech-portal.io', activity_type: 'New API Endpoint', description: 'Exposed /api/v1/login endpoint with unsecured configurations.', severity: 'high', is_suspicious: true, detected_at: new Date(Date.now() - 3600000 * 24).toISOString() },
      { id: 'a4', domain_name: 'cybertech-login.net', activity_type: 'Traffic Spike', description: 'Sudden increase in traffic from social media referrals (Facebook/WhatsApp).', severity: 'medium', is_suspicious: true, detected_at: new Date(Date.now() - 3600000 * 36).toISOString() },
      { id: 'a7', domain_name: 'cyber-tech-portal.io', activity_type: 'Content Update', description: 'Portal content updated with branding images from your official site.', severity: 'medium', is_suspicious: true, detected_at: new Date(Date.now() - 3600000 * 48).toISOString() },
      { id: 'a9', domain_name: 'cybertech-verify.com', activity_type: 'DGA Pattern', description: 'Domain name follows a pseudo-random generated pattern used by C2 servers.', severity: 'high', is_suspicious: true, detected_at: new Date(Date.now() - 3600000 * 72).toISOString() },
      { id: 'a2', domain_name: 'cybertech-support.com', activity_type: 'SSL Issued', description: 'Let\'s Encrypt certificate issued for domain.', severity: 'low', is_suspicious: false, detected_at: new Date(Date.now() - 3600000 * 96).toISOString() },
      { id: 'a5', domain_name: 'cybertach.com', activity_type: 'Domain Parked', description: 'Standard parking page detected with advertising links.', severity: 'low', is_suspicious: false, detected_at: new Date(Date.now() - 3600000 * 120).toISOString() },
    ];
    return allActivities.slice(0, limit);
  }

  try {
    const { data, error } = await supabase
      .from('domain_activities')
      .select('*, similar_domains(domain_name)')
      .order('detected_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data.map(item => ({
      ...item,
      domain_name: item.similar_domains?.domain_name
    })) || [];
  } catch (error) {
    console.error('Error fetching global activities:', error);
    return [];
  }
}

// Fetch system security status (Regular Threat Detection)
export async function getSystemSecurityStatus() {
  if (useMockData) {
    return {
      status: 'Warning',
      score: 84,
      metrics: {
        activeThreats: 12,
        blockedIPs: 154,
        failedLogins: 423,
        apiAnomalies: 5
      },
      trafficTrend: [
        { time: '00:00', value: 45 },
        { time: '04:00', value: 30 },
        { time: '08:00', value: 85 },
        { time: '12:00', value: 120 },
        { time: '16:00', value: 160 },
        { time: '20:00', value: 95 },
        { time: '23:59', value: 70 }
      ],
      suspiciousIPs: [
        { ip: '192.168.1.105', attempts: 45, location: 'Russia', risk: 'High' },
        { ip: '45.12.33.10', attempts: 23, location: 'China', risk: 'Medium' },
        { ip: '103.25.11.2', attempts: 120, location: 'India', risk: 'Critical' },
        { ip: '88.16.0.4', attempts: 12, location: 'Germany', risk: 'Low' }
      ]
    };
  }
  // In real implementation, this would fetch from a specialized security events table
  return null;
}

// Fetch detailed security threat logs
export async function getSecurityThreatLogs(limit = 20) {
  if (useMockData) {
    return [
      { id: 'sl1', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), ip: '103.25.11.2', type: 'SQL Injection', resource: '/api/v1/users', risk: 'Critical', status: 'Active' },
      { id: 'sl2', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), ip: '192.168.1.105', type: 'Brute Force', resource: '/login', risk: 'High', status: 'Blocked' },
      { id: 'sl3', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), ip: '45.12.33.10', type: 'XSS Attempt', resource: '/search', risk: 'Medium', status: 'Watchlist' },
      { id: 'sl4', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), ip: '203.0.113.5', type: 'Abnormal API Usage', resource: '/api/v1/data', risk: 'Low', status: 'Resolved' },
      { id: 'sl5', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), ip: '103.25.11.2', type: 'DDoS Pattern', resource: 'Gateway', risk: 'Critical', status: 'Mitigating' },
      { id: 'sl6', timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), ip: '88.16.0.4', type: 'Repeated Failed Login', resource: '/admin', risk: 'Medium', status: 'Active' },
    ];
  }
  return [];
}
