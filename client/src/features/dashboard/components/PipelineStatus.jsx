'use client';

import { Play, CheckCircle2, Loader2 } from 'lucide-react';

const SERVICES = [
  { key: 'social',  label: 'Social Scraper',   desc: 'Reddit threat pipeline' },
  { key: 'domain',  label: 'Domain Monitor',   desc: 'Typosquatting detection' },
  { key: 'email',   label: 'Email Parser',     desc: 'Forwarding webhook' },
];

export default function PipelineStatus({
  onStartPipeline,
  pipelineStarting = false,
  pipelineMessage = '',
}) {
  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{ background: '#1e293b', border: '1px solid #334155' }}
    >
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold" style={{ color: '#f8fafc' }}>Pipeline Status</h3>
        <p className="text-xs" style={{ color: '#94a3b8' }}>Background intelligence services</p>
      </div>

      {/* Service statuses */}
      <div className="space-y-2.5">
        {SERVICES.map((svc) => (
          <div key={svc.key} className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: '#e2e8f0' }}>{svc.label}</p>
              <p className="text-[10px]" style={{ color: '#94a3b8' }}>{svc.desc}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 style={{ width: 13, height: 13, color: '#34d399' }} />
              <span className="text-[11px] font-semibold" style={{ color: '#34d399' }}>Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #334155' }} />

      {/* Trigger button */}
      <button
        id="pipeline-trigger-btn"
        onClick={onStartPipeline}
        disabled={pipelineStarting}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
        style={{ background: '#60a5fa', color: '#fff' }}
      >
        {pipelineStarting ? (
          <Loader2 className="animate-spin" style={{ width: 13, height: 13 }} />
        ) : (
          <Play style={{ width: 13, height: 13 }} />
        )}
        {pipelineStarting ? 'Starting…' : 'Trigger Manual Scan'}
      </button>

      {pipelineMessage && (
        <p className="text-[11px] text-center" style={{ color: '#94a3b8' }}>{pipelineMessage}</p>
      )}
    </div>
  );
}
