'use client';

import { useState, useEffect } from 'react';
import { getSystemSecurityStatus, getSecurityThreatLogs } from '@/lib/supabaseClient';
import { Shield, ShieldAlert, ShieldCheck, Activity, Users, Globe, Lock, AlertTriangle, CheckCircle, XCircle, MoreVertical, RefreshCw, Filter, Download } from 'lucide-react';

export default function ThreatDetection() {
    const [statusData, setStatusData] = useState(null);
    const [threatLogs, setThreatLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [status, logs] = await Promise.all([
            getSystemSecurityStatus(),
            getSecurityThreatLogs()
        ]);
        setStatusData(status);
        setThreatLogs(logs);
        setLoading(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Safe': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'Warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'Critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const getRiskBadge = (risk) => {
        switch (risk) {
            case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'Low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-24">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Section: Health Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Overall Status Card */}
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        {statusData.status === 'Safe' ? <ShieldCheck className="w-32 h-32 text-green-400" /> :
                            statusData.status === 'Warning' ? <ShieldAlert className="w-32 h-32 text-yellow-400" /> :
                                <Shield className="w-32 h-32 text-red-400" />}
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-widest">System Security Status</h3>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className={`text-4xl font-extrabold tracking-tight ${statusData.status === 'Safe' ? 'text-green-400' :
                                            statusData.status === 'Warning' ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                        {statusData.status}
                                    </span>
                                    <span className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase ${getStatusColor(statusData.status)}`}>
                                        Intervention {statusData.status === 'Safe' ? 'Not Required' : 'Recommended'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-5xl font-black text-white">{statusData.score}</div>
                                <div className="text-xs text-gray-500 font-bold uppercase mt-1">Health Score</div>
                            </div>
                        </div>

                        {/* Summary Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Active Threats', value: statusData.metrics.activeThreats, icon: ShieldAlert, color: 'text-red-400' },
                                { label: 'Blocked IPs', value: statusData.metrics.blockedIPs, icon: Lock, color: 'text-blue-400' },
                                { label: 'Failed Logins', value: statusData.metrics.failedLogins, icon: Users, color: 'text-yellow-400' },
                                { label: 'API Anomalies', value: statusData.metrics.apiAnomalies, icon: Activity, color: 'text-cyan-400' },
                            ].map((item, i) => (
                                <div key={i} className="bg-gray-950/50 border border-gray-800/50 p-4 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <item.icon className={`w-4 h-4 ${item.color}`} />
                                        <span className="text-xs text-gray-500 font-bold uppercase">{item.label}</span>
                                    </div>
                                    <div className="text-2xl font-bold text-white">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Traffic Trend Sim */}
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        Traffic Pattern (24h)
                    </h3>
                    <div className="flex-1 flex items-end gap-2 h-40">
                        {statusData.trafficTrend.map((t, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div
                                    className="w-full bg-cyan-400/20 border-t-2 border-cyan-400 rounded-t-sm group-hover:bg-cyan-400/40 transition-all cursor-crosshair relative"
                                    style={{ height: `${(t.value / 200) * 100}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                        {t.value} req/s
                                    </div>
                                </div>
                                <span className="text-[10px] text-gray-500 font-bold">{t.time}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-6 leading-relaxed">
                        Detecting unusual spikes at 16:00. Correlating with brute force logs.
                    </p>
                </div>
            </div>

            {/* Bottom Section: Logs and IPs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Detailed Threat Log */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Lock className="w-5 h-5 text-cyan-400" />
                            Live Threat Detection Log
                        </h3>
                        <div className="flex items-center gap-2">
                            <button className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                                <Filter className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-900/50 border-b border-gray-800">
                                    <tr className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                                        <th className="px-6 py-4">Threat Event</th>
                                        <th className="px-6 py-4">Target</th>
                                        <th className="px-6 py-4">Risk</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {threatLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-900/40 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center">
                                                        {log.risk === 'Critical' ? <ShieldAlert className="w-5 h-5 text-red-500" /> : <Shield className="w-5 h-5 text-gray-400" />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{log.type}</div>
                                                        <div className="text-[10px] text-gray-500 font-mono flex items-center gap-2 mt-1">
                                                            <span className="px-1.5 py-0.5 bg-gray-900 rounded">{log.ip}</span>
                                                            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-xs font-mono text-gray-400 bg-gray-900 px-2 py-1 rounded border border-gray-800">{log.resource}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase ${getRiskBadge(log.risk)}`}>
                                                    {log.risk}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                                                    <div className={`w-2 h-2 rounded-full ${log.status === 'Active' ? 'bg-red-500' : 'bg-cyan-500'}`}></div>
                                                    {log.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">BLOCK</button>
                                                    <button className="p-2 hover:bg-gray-900 rounded-lg text-gray-500"><MoreVertical className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Suspicious IPs List */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <Users className="w-5 h-5 text-red-400" />
                        Suspicious IPs
                    </h3>
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4">
                        {statusData.suspiciousIPs.map((ip, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-950/50 border border-gray-800/80 rounded-2xl hover:border-gray-700 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                                        <Globe className="w-4 h-4 text-gray-500 group-hover:text-red-500" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{ip.ip}</div>
                                        <div className="text-[10px] text-gray-500 mt-1">{ip.location} • {ip.attempts} Attempts</div>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border ${ip.risk === 'Critical' ? 'text-red-400 border-red-500/20' :
                                        ip.risk === 'High' ? 'text-orange-400 border-orange-500/20' : 'text-gray-400 border-gray-800'
                                    }`}>
                                    {ip.risk}
                                </span>
                            </div>
                        ))}
                        <button className="w-full py-3 bg-gray-950 text-gray-500 text-xs font-bold rounded-xl border border-gray-800 hover:bg-gray-900 hover:text-white transition-all mt-2">
                            VIEW ALL SUSPICIOUS ACTIVITY
                        </button>
                    </div>

                    {/* Quick Response Panel */}
                    <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-3xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldAlert className="w-5 h-5 text-red-500" />
                            <h4 className="text-sm font-bold text-white">Emergency Lockdown</h4>
                        </div>
                        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                            Detected cluster of critical threats. Activate total network isolation?
                        </p>
                        <button className="w-full py-3 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 uppercase tracking-widest">
                            INITIATE LOCKDOWN
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
