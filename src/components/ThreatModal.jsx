import { X, ExternalLink, Shield, Target, Activity } from 'lucide-react';

const impactColors = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function ThreatModal({ threat, onClose }) {
  if (!threat) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-800">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded border ${
                  impactColors[threat.impact_level] ?? impactColors.low
                }`}
              >
                {threat.impact_level?.toUpperCase()}
              </span>
              <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                {threat.threat_type}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-white">
              {threat.raw_posts?.title ?? 'Threat Details'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Scores */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Shield, label: 'Severity', value: `${threat.severity_score}/10`, color: 'text-red-400' },
              { icon: Activity, label: 'Credibility', value: `${threat.credibility_score}/10`, color: 'text-cyan-400' },
              { icon: Target, label: 'Sector', value: threat.sector, color: 'text-yellow-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-gray-800 rounded-xl p-4 text-center">
                <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
                <p className="text-sm font-semibold text-white">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Summary</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{threat.summary}</p>
          </div>

          {/* Source post */}
          {threat.raw_posts?.content && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Source Content</h3>
              <div className="bg-gray-800 rounded-xl p-4 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {threat.raw_posts.content}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            {threat.raw_posts?.author && (
              <span>Posted by <span className="text-gray-300">{threat.raw_posts.author}</span></span>
            )}
            {threat.raw_posts?.threat_sources?.name && (
              <span>Source: <span className="text-gray-300">{threat.raw_posts.threat_sources.name}</span></span>
            )}
            {threat.raw_posts?.url && (
              <a
                href={threat.raw_posts.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition"
              >
                View original <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
