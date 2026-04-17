'use client';

import { useState, useEffect } from 'react';
import { Globe, Search, AlertTriangle, CheckCircle, ShieldAlert, Clock, RefreshCw, X, ExternalLink, Loader2 } from 'lucide-react';
import { getSimilarDomains, getDomainActivities, getGlobalDomainActivities } from '@/features/domains/services/domains.service';
import { useAuthedApi } from '@/hooks/use-authed-api';
import { RiskBadge } from '@/shared/components/RiskBadge';
import { SkeletonTableRow } from '@/shared/components/SkeletonLoader';

/** Map domain similarity_score (0–1) to a risk level */
function domainRisk(domain) {
  const sim  = Number(domain.similarity_score ?? 0);
  const ageD = domain.domain_age_days ?? 999;

  if (sim >= 0.9 || ageD < 14) return 'HIGH';
  if (sim >= 0.75 || ageD < 60) return 'MEDIUM';
  return 'LOW';
}

/** Score 0–100 derived from similarity + age */
function riskScore(domain) {
  const sim  = Number(domain.similarity_score ?? 0) * 60;
  const ageD = domain.domain_age_days ?? 365;
  const agePts = ageD < 7 ? 40 : ageD < 30 ? 25 : ageD < 90 ? 10 : 0;
  return Math.min(100, Math.round(sim + agePts));
}

function rowBorderStyle(risk) {
  if (risk === 'HIGH')   return { borderLeft: '3px solid #f87171', background: 'rgba(248,113,113,0.04)' };
  if (risk === 'MEDIUM') return { borderLeft: '3px solid #fbbf24', background: 'rgba(251,191,36,0.03)' };
  return { borderLeft: '3px solid transparent' };
}

/** Domain Detail Modal */
function DomainDetailModal({ domain, activities = [], loading, onClose }) {
  if (!domain) return null;

  const risk  = domainRisk(domain);
  const score = riskScore(domain);
  const suspicious = activities.filter((a) => a.is_suspicious);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl shadow-2xl"
        style={{ background: '#1e293b', border: '1px solid #334155' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-5 flex-shrink-0" style={{ borderBottom: '1px solid #334155' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(248,113,113,0.15)' }}>
              <Globe style={{ width: 18, height: 18, color: '#f87171' }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold font-mono" style={{ color: '#f8fafc' }}>{domain.domain_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <RiskBadge level={risk} />
                <span className="text-xs font-bold" style={{ color: '#f87171' }}>{score}/100</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ color: '#94a3b8' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Flags */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Why Flagged</p>
            <div className="space-y-2">
              {[
                domain.similarity_score >= 0.9 && '⚠ Very high similarity to target domain',
                domain.domain_age_days != null && domain.domain_age_days < 14 && `⚠ Very new domain — registered ${domain.domain_age_days} days ago`,
                domain.ssl_detected && '⚠ Active SSL certificate (may be used to appear legitimate)',
                suspicious.length > 0 && `⚠ ${suspicious.length} suspicious activit${suspicious.length === 1 ? 'y' : 'ies'} detected`,
                !domain.ssl_detected && '✓ No SSL certificate detected',
              ].filter(Boolean).map((flag, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-3 rounded-lg" style={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }}>
                  {flag}
                </div>
              ))}
            </div>
          </div>

          {/* Domain Info */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Domain Data</p>
            <div className="rounded-lg p-4 space-y-2.5" style={{ background: '#0f172a', border: '1px solid #334155' }}>
              {[
                ['Similarity Score', `${Math.round((domain.similarity_score ?? 0) * 100)}%`],
                ['Domain Age',       domain.domain_age_days != null ? `${domain.domain_age_days} days` : domain.registration_date ?? 'Unknown'],
                ['Registered',       domain.registration_date ?? 'Unknown'],
                ['SSL Detected',     domain.ssl_detected ? 'Yes' : 'No'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span style={{ color: '#94a3b8' }}>{k}</span>
                  <span className="font-medium" style={{ color: '#e2e8f0' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activities */}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="animate-spin w-5 h-5" style={{ color: '#60a5fa' }} />
            </div>
          )}
          {!loading && activities.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>
                Recent Activities ({activities.length})
              </p>
              <div className="space-y-2">
                {activities.slice(0, 5).map((act) => (
                  <div
                    key={act.id}
                    className="rounded-lg p-3 text-xs"
                    style={{
                      background: '#0f172a',
                      border: act.is_suspicious ? '1px solid rgba(248,113,113,0.3)' : '1px solid #334155',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium" style={{ color: '#e2e8f0' }}>{act.activity_type}</span>
                      {act.is_suspicious && (
                        <span style={{ color: '#f87171' }} className="flex items-center gap-1">
                          <AlertTriangle style={{ width: 11, height: 11 }} /> Suspicious
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#94a3b8' }}>{act.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 p-4 flex-shrink-0" style={{ borderTop: '1px solid #334155' }}>
          <button
            className="px-4 py-2 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}
          >
            Add to Watchlist
          </button>
          <button
            className="px-4 py-2 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}
          >
            Block Domain
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium"
            style={{ color: '#cbd5e1', border: '1px solid #334155' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/** Main DomainMonitor page component */
export default function DomainMonitor() {
  const { callService } = useAuthedApi();
  const [domains,          setDomains]          = useState([]);
  const [globalLogs,       setGlobalLogs]       = useState([]);
  const [selectedDomain,   setSelectedDomain]   = useState(null);
  const [activities,       setActivities]       = useState([]);
  const [riskFilter,       setRiskFilter]       = useState('ALL');
  const [loading,          setLoading]          = useState(true);
  const [loadingActivities,setLoadingActivities]= useState(false);
  const [loadingLogs,      setLoadingLogs]      = useState(false);
  const [showModal,        setShowModal]        = useState(false);
  const [error,            setError]            = useState('');

  useEffect(() => {
    fetchDomains();
    fetchGlobalLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchGlobalLogs() {
    setLoadingLogs(true);
    try {
      const data = await callService(getGlobalDomainActivities, 20);
      setGlobalLogs(Array.isArray(data) ? data : []);
    } catch {
      setGlobalLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  }

  async function fetchDomains() {
    setLoading(true);
    setError('');
    try {
      const data = await callService(getSimilarDomains);
      const normalized = Array.isArray(data) ? data : [];
      setDomains(normalized);
    } catch (err) {
      setError(String(err?.message ?? 'Failed to load similar domains'));
    } finally {
      setLoading(false);
    }
  }

  async function handleViewDetails(domain, e) {
    e?.stopPropagation();
    setSelectedDomain(domain);
    setShowModal(true);
    setLoadingActivities(true);
    try {
      const data = await callService(getDomainActivities, domain.id);
      setActivities(Array.isArray(data) ? data : []);
    } catch {
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  }

  const FILTERS = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];

  const filtered = domains.filter((d) => {
    if (riskFilter === 'ALL') return true;
    return domainRisk(d) === riskFilter;
  });

  const counts = {
    ALL:    domains.length,
    HIGH:   domains.filter((d) => domainRisk(d) === 'HIGH').length,
    MEDIUM: domains.filter((d) => domainRisk(d) === 'MEDIUM').length,
    LOW:    domains.filter((d) => domainRisk(d) === 'LOW').length,
  };

  const TABLE_HEADERS = ['Domain', 'Similarity', 'Age (Days)', 'SSL', 'Risk Score', 'Risk Level', 'Actions'];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#f8fafc' }}>Domain Intelligence</h2>
          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
            Typosquatting, lookalike domains, and malicious infrastructure detection
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg" style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1' }}>
            <Globe style={{ width: 13, height: 13, color: '#fbbf24' }} />
            {domains.length} domains monitored
          </div>
          <button
            onClick={fetchDomains}
            className="p-2 rounded-lg transition-colors"
            style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8' }}
          >
            <RefreshCw style={{ width: 14, height: 14 }} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* Risk filter tabs */}
      <div className="flex items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setRiskFilter(f)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            style={
              riskFilter === f
                ? { background: '#60a5fa', color: '#fff' }
                : { background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1' }
            }
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Domains table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#1e293b', border: '1px solid #334155' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap"
                    style={{ color: '#64748b' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonTableRow key={i} cols={7} />
                ))
              }
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm" style={{ color: '#94a3b8' }}>
                    No domains found for this risk level.
                  </td>
                </tr>
              )}
              {!loading && filtered.map((domain) => {
                const risk  = domainRisk(domain);
                const score = riskScore(domain);
                const sim   = Math.round((domain.similarity_score ?? 0) * 100);
                const ageDays = domain.domain_age_days ?? '—';
                const ssl   = domain.ssl_detected;

                return (
                  <tr
                    key={domain.id}
                    style={{ borderBottom: '1px solid #334155', ...rowBorderStyle(risk) }}
                    className="transition-colors"
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = rowBorderStyle(risk).background ?? 'transparent'; }}
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-xs font-mono font-medium" style={{ color: '#e2e8f0' }}>
                        {domain.domain_name}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-xs font-semibold" style={{ color: sim >= 90 ? '#f87171' : '#cbd5e1' }}>
                        {sim}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-xs" style={{ color: '#cbd5e1' }}>{ageDays}</span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {ssl ? (
                        <span className="flex items-center gap-1 text-xs" style={{ color: '#34d399' }}>
                          <CheckCircle style={{ width: 12, height: 12 }} /> Yes
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs" style={{ color: '#94a3b8' }}>
                          <X style={{ width: 12, height: 12 }} /> No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-1.5 w-16 rounded-full overflow-hidden"
                          style={{ background: '#334155' }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${score}%`,
                              background: risk === 'HIGH' ? '#f87171' : risk === 'MEDIUM' ? '#fbbf24' : '#34d399',
                              transition: 'width 0.5s ease',
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold tabular-nums" style={{ color: '#cbd5e1' }}>{score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <RiskBadge level={risk} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <button
                        onClick={(e) => handleViewDetails(domain, e)}
                        className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                        style={{ border: '1px solid #334155', color: '#60a5fa', background: 'transparent' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(96,165,250,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {!loading && (
          <div
            className="px-5 py-3 flex items-center justify-between text-xs"
            style={{ borderTop: '1px solid #334155', color: '#94a3b8' }}
          >
            <span>Showing {filtered.length} of {domains.length} domains</span>
            <span className="flex items-center gap-1">
              <Clock style={{ width: 11, height: 11 }} /> Updated just now
            </span>
          </div>
        )}
      </div>

      {/* Global Logs Table (condensed) */}
      {globalLogs.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #334155' }}>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: '#f8fafc' }}>Global Activity Log</h3>
              <p className="text-xs" style={{ color: '#94a3b8' }}>Live detections across all monitored domains</p>
            </div>
            <button
              onClick={fetchGlobalLogs}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#94a3b8', border: '1px solid #334155' }}
            >
              <RefreshCw style={{ width: 13, height: 13 }} className={loadingLogs ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
                  {['Timestamp', 'Domain', 'Activity', 'Description', 'Risk', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: '#64748b' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {globalLogs.map((log) => (
                  <tr key={log.id} className="transition-colors" style={{ borderBottom: '1px solid #334155' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td className="px-4 py-3 whitespace-nowrap font-mono" style={{ color: '#94a3b8' }}>
                      {new Date(log.detected_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono font-medium" style={{ color: '#e2e8f0' }}>
                      {log.domain_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold" style={{ color: '#cbd5e1' }}>
                      {log.activity_type}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="truncate" style={{ color: '#94a3b8' }}>{log.description}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <RiskBadge level={(log.severity ?? '').toUpperCase() === 'HIGH' ? 'HIGH' : (log.severity ?? '').toUpperCase() === 'MEDIUM' ? 'MEDIUM' : 'LOW'} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {log.is_suspicious ? (
                        <span className="flex items-center gap-1 font-bold" style={{ color: '#f87171' }}>
                          <ShieldAlert style={{ width: 11, height: 11 }} /> MALICIOUS
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-semibold" style={{ color: '#34d399' }}>
                          <CheckCircle style={{ width: 11, height: 11 }} /> Benign
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Domain Detail Modal */}
      {showModal && selectedDomain && (
        <DomainDetailModal
          domain={selectedDomain}
          activities={activities}
          loading={loadingActivities}
          onClose={() => { setShowModal(false); setSelectedDomain(null); setActivities([]); }}
        />
      )}
    </div>
  );
}
