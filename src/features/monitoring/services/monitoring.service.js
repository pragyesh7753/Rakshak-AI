/**
 * Monitoring service
 * Handles system security status and threat log queries.
 * Note: getSystemSecurityStatus has no live Supabase implementation yet;
 * it always returns mock data until the `security_status` table is provisioned.
 */
import { createClient } from '@/lib/supabase/client';

function isMockMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return !(url.startsWith('http') && key.length > 20);
}

/**
 * Fetch the current system security health overview.
 * TODO: Replace mock with real `security_status` table query when available.
 */
export async function getSystemSecurityStatus() {
  return {
    status: 'Warning',
    score: 84,
    metrics: {
      activeThreats: 12,
      blockedIPs: 154,
      failedLogins: 423,
      apiAnomalies: 5,
    },
    trafficTrend: [
      { time: '00:00', value: 45  },
      { time: '04:00', value: 30  },
      { time: '08:00', value: 85  },
      { time: '12:00', value: 120 },
      { time: '16:00', value: 160 },
      { time: '20:00', value: 95  },
      { time: '23:59', value: 70  },
    ],
    suspiciousIPs: [
      { ip: '192.168.1.105', attempts: 45,  location: 'Russia',  risk: 'High'     },
      { ip: '45.12.33.10',   attempts: 23,  location: 'China',   risk: 'Medium'   },
      { ip: '103.25.11.2',   attempts: 120, location: 'India',   risk: 'Critical' },
      { ip: '88.16.0.4',     attempts: 12,  location: 'Germany', risk: 'Low'      },
    ],
  };
}

/**
 * Fetch recent security threat events (brute-force, injections, etc.).
 * @param {number} limit
 */
export async function getSecurityThreatLogs(limit = 20) {
  if (isMockMode()) {
    return [
      { id: 'sl1', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),   ip: '103.25.11.2',  type: 'SQL Injection',        resource: '/api/v1/users', risk: 'Critical', status: 'Active'    },
      { id: 'sl2', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),  ip: '192.168.1.105',type: 'Brute Force',           resource: '/login',        risk: 'High',     status: 'Blocked'   },
      { id: 'sl3', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),  ip: '45.12.33.10',  type: 'XSS Attempt',           resource: '/search',       risk: 'Medium',   status: 'Watchlist' },
      { id: 'sl4', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), ip: '203.0.113.5',  type: 'Abnormal API Usage',    resource: '/api/v1/data',  risk: 'Low',      status: 'Resolved'  },
      { id: 'sl5', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), ip: '103.25.11.2',  type: 'DDoS Pattern',          resource: 'Gateway',       risk: 'Critical', status: 'Mitigating'},
      { id: 'sl6', timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), ip: '88.16.0.4',    type: 'Repeated Failed Login', resource: '/admin',        risk: 'Medium',   status: 'Active'    },
    ];
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('security_threat_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error('[monitoring.service] getSecurityThreatLogs:', error);
    return [];
  }
}
