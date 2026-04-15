'use client';

import { useState, useEffect } from 'react';
import { getSimilarDomains, getDomainActivities, getGlobalDomainActivities } from '@/features/domains/services/domains.service';
import { useAuthedApi } from '@/hooks/use-authed-api';
import { getSeverityBadgeClasses } from '@/shared/utils/severity';
import { Globe, AlertTriangle, CheckCircle, ShieldAlert, Clock, ListFilter, Terminal } from 'lucide-react';

export default function DomainMonitor() {
  const { callService } = useAuthedApi();
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [activities, setActivities] = useState([]);
  const [globalLogs, setGlobalLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDomains();
    fetchGlobalLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGlobalLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await callService(getGlobalDomainActivities, 15);
      setGlobalLogs(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setGlobalLogs([]);
      setError(String(fetchError?.message ?? 'Failed to load global domain logs'));
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleDomainClick = async (domain) => {
    setSelectedDomain(domain);
    setLoadingActivities(true);
    try {
      const data = await callService(getDomainActivities, domain.id);
      setActivities(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setActivities([]);
      setError(String(fetchError?.message ?? 'Failed to load domain activities'));
    } finally {
      setLoadingActivities(false);
    }
  };

  const fetchDomains = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await callService(getSimilarDomains);
      const normalized = Array.isArray(data) ? data : [];
      setDomains(normalized);
      if (normalized.length > 0) {
        handleDomainClick(normalized[0]);
      } else {
        setSelectedDomain(null);
        setActivities([]);
      }
    } catch (fetchError) {
      setDomains([]);
      setSelectedDomain(null);
      setActivities([]);
      setError(String(fetchError?.message ?? 'Failed to load similar domains'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
      </div>
    );
  }

  if (error && domains.length === 0 && globalLogs.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Domains List */}
      <div className="lg:col-span-1 space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          Similar Domains
        </h3>
        <div className="space-y-3">
          {domains.map((domain) => (
            <button
              key={domain.id}
              onClick={() => handleDomainClick(domain)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedDomain?.id === domain.id
                  ? 'bg-gray-800 border-cyan-500/50 ring-1 ring-cyan-500/50'
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium text-white break-all">{domain.domain_name}</span>
                {domain.similarity_score >= 0.9 && (
                  <span className="shrink-0 bg-red-500/10 text-red-500 text-[10px] px-2 py-0.5 rounded border border-red-500/20 font-bold uppercase tracking-wider">
                    High Similarity
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {Math.round(domain.similarity_score * 100)}% Match
                </div>
                <div>Reg: {domain.registration_date}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Activities Section */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            Domain Activities
            {selectedDomain && (
              <span className="text-gray-400 text-sm font-normal ml-2">for {selectedDomain.domain_name}</span>
            )}
          </h3>
        </div>

        {loadingActivities ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`p-4 rounded-xl border ${activity.is_suspicious ? 'bg-gray-900 border-red-500/20' : 'bg-gray-900 border-gray-800'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-white">{activity.activity_type}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${getSeverityBadgeClasses(activity.severity)}`}>
                        {activity.severity}
                      </span>
                      {activity.is_suspicious && (
                        <span className="flex items-center gap-1 text-red-400 text-xs font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          Suspicious Activity
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-2">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {new Date(activity.detected_at).toLocaleString()}
                    </div>
                  </div>
                  {activity.is_suspicious && (
                    <div className="p-2 bg-red-400/10 rounded-lg">
                      <ShieldAlert className="w-6 h-6 text-red-400" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500/20 mx-auto mb-4" />
            <p className="text-gray-400">No recent activities detected for this domain.</p>
          </div>
        )}
      </div>

      {/* Global Activity Logs */}
      <div className="lg:col-span-3 mt-12 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Terminal className="w-6 h-6 text-cyan-400" />
            Global Activity Logs
            <span className="text-xs font-normal text-gray-500 bg-gray-800 px-2 py-1 rounded ml-2">Live Detections</span>
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Auto-refreshing every 60s
            </span>
            <button
              onClick={fetchGlobalLogs}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
              title="Refresh Logs"
            >
              <ListFilter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loadingLogs ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
          </div>
        ) : (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-800/50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    {['Timestamp', 'Target Domain', 'Activity Type', 'Description', 'Risk Level', 'Detection'].map((h) => (
                      <th key={h} className="px-6 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {globalLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-800/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                        {new Date(log.detected_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">{log.domain_name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-gray-300">{log.activity_type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">{log.description}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-1 rounded border font-bold uppercase tracking-wider ${getSeverityBadgeClasses(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.is_suspicious ? (
                          <span className="flex items-center gap-1.5 text-red-500 text-xs font-bold animate-pulse">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            MALICIOUS
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-green-500 text-xs font-bold">
                            <CheckCircle className="w-3.5 h-3.5" />
                            BENIGN
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {globalLogs.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-gray-500">No logs detected in the last 24 hours.</p>
              </div>
            )}
            <div className="bg-gray-800/30 px-6 py-3 border-t border-gray-800 flex items-center justify-between">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                showing {globalLogs.length} recent detections
              </p>
              <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                View Full Archive →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
