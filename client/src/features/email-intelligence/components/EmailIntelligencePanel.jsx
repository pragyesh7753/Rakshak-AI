'use client';

import { Link as LinkIcon, MailWarning, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toRiskScore(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return clamp(Math.round(numeric), 0, 100);
}

function riskTone(score) {
  if (score >= 75) {
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  }
  if (score >= 40) {
    return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
  }
  return 'text-green-400 bg-green-500/10 border-green-500/30';
}

function actionTone(action) {
  if (action === 'Block') {
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  }
  if (action === 'Flag') {
    return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
  }
  return 'text-green-400 bg-green-500/10 border-green-500/20';
}

function formatTimestamp(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return 'Unknown time';
  }

  return date.toLocaleString();
}

function summarize(results) {
  const rows = Array.isArray(results) ? results : [];

  const highRisk = rows.filter((item) => toRiskScore(item?.riskScore) >= 75).length;
  const blocked = rows.filter((item) => String(item?.recommendedAction ?? '') === 'Block').length;
  const flagged = rows.filter((item) => String(item?.recommendedAction ?? '') === 'Flag').length;
  const safe = rows.filter((item) => String(item?.recommendedAction ?? '') === 'Allow').length;

  return {
    total: rows.length,
    highRisk,
    blocked,
    flagged,
    safe,
  };
}

function SummaryCard({ title, value, icon: Icon, tone }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-gray-400">{title}</p>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function EmailIntelligencePanel({ results }) {
  const rows = Array.isArray(results) ? results : [];
  const stats = summarize(rows);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <SummaryCard title="Total Analyzed" value={stats.total} icon={MailWarning} tone="text-cyan-400" />
        <SummaryCard title="High Risk" value={stats.highRisk} icon={ShieldAlert} tone="text-red-400" />
        <SummaryCard title="Blocked" value={stats.blocked} icon={ShieldX} tone="text-red-400" />
        <SummaryCard title="Flagged" value={stats.flagged} icon={ShieldAlert} tone="text-yellow-400" />
        <SummaryCard title="Safe" value={stats.safe} icon={ShieldCheck} tone="text-green-400" />
      </div>

      <div className="bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Recent Forwarded Email Analysis</h3>
            <p className="text-sm text-gray-400 mt-1">
              Results are organization-scoped and generated from forwarded suspicious emails.
            </p>
          </div>
        </div>

        {rows.length === 0 && (
          <div className="px-6 py-10 text-center text-gray-500">
            No email intelligence records found yet. Forward suspicious emails to populate this panel.
          </div>
        )}

        {rows.length > 0 && (
          <div className="divide-y divide-gray-800">
            {rows.map((item) => {
              const score = toRiskScore(item?.riskScore);
              const links = Array.isArray(item?.extractedLinks) ? item.extractedLinks : [];
              const flags = Array.isArray(item?.flags) ? item.flags : [];

              return (
                <div key={item?.id ?? `${item?.originalSender}-${item?.createdAt}`} className="px-6 py-5 hover:bg-gray-900/40 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 rounded-md border border-cyan-500/30 text-cyan-300 bg-cyan-500/10">
                          {item?.threatType || 'Suspicious'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-md border ${actionTone(String(item?.recommendedAction ?? 'Flag'))}`}>
                          {String(item?.recommendedAction ?? 'Flag')}
                        </span>
                        <span className="text-xs text-gray-500">{formatTimestamp(item?.createdAt)}</span>
                      </div>

                      <p className="text-sm text-gray-300 break-all">
                        <span className="text-gray-500">Sender: </span>
                        {item?.originalSender || 'Unknown'}
                      </p>

                      <p className="text-sm text-white mt-1 font-medium">
                        {item?.originalSubject || 'No subject captured'}
                      </p>

                      <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                        {item?.analysis || 'No analysis text available for this record.'}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {flags.slice(0, 6).map((flag) => (
                          <span key={`${item?.id}-${flag}`} className="text-[11px] px-2 py-1 rounded-md bg-gray-900 border border-gray-700 text-gray-300">
                            {flag}
                          </span>
                        ))}
                      </div>

                      {links.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {links.slice(0, 2).map((link) => (
                            <a
                              key={`${item?.id}-${link}`}
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1 break-all"
                            >
                              <LinkIcon className="w-3 h-3" />
                              {link}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center lg:items-end gap-2 lg:flex-col">
                      <div className={`px-3 py-2 rounded-lg border text-sm font-semibold ${riskTone(score)}`}>
                        Risk {score}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
