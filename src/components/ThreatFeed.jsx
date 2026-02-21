import { ExternalLink } from 'lucide-react';

const impactColors = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

function SeverityBar({ score }) {
  const pct = (score / 10) * 100;
  const color =
    score >= 9 ? 'bg-red-500' : score >= 7 ? 'bg-orange-500' : score >= 5 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-6 text-right">{score}</span>
    </div>
  );
}

export default function ThreatFeed({ threats, onThreatClick }) {
  if (!threats || threats.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">No threats found.</div>
    );
  }

  return (
    <div className="space-y-3">
      {threats.map((threat) => (
        <div
          key={threat.id}
          onClick={() => onThreatClick(threat.id)}
          className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-cyan-500/40 hover:bg-gray-800/60 transition-all group"
        >
          <div className="flex flex-wrap items-start gap-3 justify-between">
            {/* Left */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded border ${
                    impactColors[threat.impact_level] ?? impactColors.low
                  }`}
                >
                  {threat.impact_level?.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                  {threat.threat_type}
                </span>
                <span className="text-xs text-gray-500">#{threat.sector}</span>
              </div>

              <p className="text-sm text-gray-300 line-clamp-2">{threat.summary}</p>

              {threat.raw_posts?.title && (
                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  {threat.raw_posts.title}
                </p>
              )}
            </div>

            {/* Right - scores */}
            <div className="w-32 space-y-2 shrink-0">
              <div>
                <p className="text-xs text-gray-500 mb-1">Severity</p>
                <SeverityBar score={threat.severity_score} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Credibility</p>
                <SeverityBar score={threat.credibility_score} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
