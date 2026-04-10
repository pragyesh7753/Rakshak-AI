/**
 * System logs service
 * Handles processing log queries.
 */
import { createClient } from '@/lib/supabase/client';

function isMockMode() {
  const url = import.meta.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return !(url.startsWith('http') && key.length > 20);
}

const buildMockLogs = () => {
  const now = new Date();
  return [
    { id: '1',  job_type: 'reddit_scraper',        status: 'running',    message: '[LIVE] Scraping r/cybersecurity - Processing thread #1847 | Posts: 24/150 | Rate limit: 87% available',               created_at: new Date(now - 15000).toISOString() },
    { id: '2',  job_type: 'ai_analysis',           status: 'processing', message: '[LIVE] Gemini AI analyzing post batch #42 | Threat detection: 3 potential matches | Confidence: 0.87',              created_at: new Date(now - 30000).toISOString() },
    { id: '3',  job_type: 'threat_scoring',        status: 'success',    message: '[COMPLETED] Threat score calculation finished | Processed: 12 threats | Avg severity: 7.2/10 | Duration: 1.2s',     created_at: new Date(now - 45000).toISOString() },
    { id: '4',  job_type: 'darkweb_monitor',       status: 'success',    message: '[COMPLETED] Tor network scan complete | Forums checked: 8 | New posts: 47 | Threats detected: 2',                   created_at: new Date(now - 2 * 60000).toISOString() },
    { id: '5',  job_type: 'credential_leak_scan',  status: 'success',    message: '[COMPLETED] Scanned 1,247 credentials across 15 breach databases | Compromised: 0 | Clean: 1,247',                  created_at: new Date(now - 3 * 60000).toISOString() },
    { id: '6',  job_type: 'reddit_scraper',        status: 'failed',     message: '[ERROR] Rate limit exceeded on endpoint /r/netsec | HTTP 429 | Retry scheduled in 120s | Backoff: exponential',      created_at: new Date(now - 5 * 60000).toISOString() },
    { id: '7',  job_type: 'alert_generation',      status: 'success',    message: '[COMPLETED] Generated 5 new alerts | Critical: 2, High: 3 | Organizations notified: 3 | Email queue: dispatched',   created_at: new Date(now - 7 * 60000).toISOString() },
    { id: '8',  job_type: 'vulnerability_sync',    status: 'success',    message: '[COMPLETED] NVD database synchronized | New CVEs: 37 | Updated: 12 | Critical severity: 8 | Last sync: success',     created_at: new Date(now - 10 * 60000).toISOString() },
    { id: '9',  job_type: 'twitter_monitor',       status: 'success',    message: '[COMPLETED] Twitter API polling finished | Tweets analyzed: 3,421 | Security keywords matched: 89 | Threats: 4',    created_at: new Date(now - 12 * 60000).toISOString() },
    { id: '10', job_type: 'threat_intel_feed',     status: 'success',    message: '[COMPLETED] External threat feeds ingested | Sources: 5 | IOCs collected: 1,829 | Malware hashes: 347',             created_at: new Date(now - 15 * 60000).toISOString() },
    { id: '11', job_type: 'ml_model_inference',    status: 'success',    message: '[COMPLETED] ML threat classification model run | Batch size: 150 | Accuracy: 94.2% | False positives: 3',           created_at: new Date(now - 18 * 60000).toISOString() },
    { id: '12', job_type: 'ioc_enrichment',        status: 'success',    message: '[COMPLETED] IOC enrichment via VirusTotal API | IPs checked: 64 | Malicious: 12 | URLs scanned: 89',               created_at: new Date(now - 20 * 60000).toISOString() },
    { id: '13', job_type: 'database_cleanup',      status: 'success',    message: '[COMPLETED] Database maintenance completed | Old records purged: 1,247 | Indexes optimized: 8 | Disk freed: 2.4GB', created_at: new Date(now - 25 * 60000).toISOString() },
    { id: '14', job_type: 'github_monitor',        status: 'success',    message: '[COMPLETED] GitHub security advisories checked | New advisories: 15 | Affected repos: 234 | Critical: 3',          created_at: new Date(now - 30 * 60000).toISOString() },
    { id: '15', job_type: 'threat_correlation',    status: 'success',    message: '[COMPLETED] Cross-source threat correlation analysis | Patterns matched: 7 | Campaign clusters: 2 | Confidence: high', created_at: new Date(now - 35 * 60000).toISOString() },
    { id: '16', job_type: 'reddit_scraper',        status: 'success',    message: '[COMPLETED] r/cybersecurity scan finished | Posts scraped: 150 | Comments: 1,284 | Threats flagged: 8',            created_at: new Date(now - 40 * 60000).toISOString() },
    { id: '17', job_type: 'webhook_delivery',      status: 'success',    message: '[COMPLETED] Alert webhooks dispatched | Endpoints: 5 | Successful: 5 | Failed: 0 | Avg latency: 145ms',            created_at: new Date(now - 45 * 60000).toISOString() },
    { id: '18', job_type: 'data_pipeline',         status: 'success',    message: '[COMPLETED] ETL pipeline execution | Raw records: 15,847 | Processed: 15,823 | Failed: 24 | Success rate: 99.8%', created_at: new Date(now - 50 * 60000).toISOString() },
    { id: '19', job_type: 'threat_deduplication',  status: 'success',    message: '[COMPLETED] Duplicate threat detection | Total analyzed: 8,421 | Duplicates removed: 127 | Unique threats: 8,294', created_at: new Date(now - 55 * 60000).toISOString() },
    { id: '20', job_type: 'backup_job',            status: 'success',    message: '[COMPLETED] Database backup to S3 | Size: 4.7GB | Compression: 68% | Duration: 42s | Integrity: verified',         created_at: new Date(now - 60 * 60000).toISOString() },
  ];
};

/**
 * Fetch recent background-worker processing logs.
 * @param {number} limit
 */
export async function getProcessingLogs(limit = 20) {
  if (isMockMode()) return buildMockLogs().slice(0, limit);

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('processing_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error('[logs.service] getProcessingLogs:', error);
    return [];
  }
}
