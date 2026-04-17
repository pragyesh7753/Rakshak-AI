/**
 * RiskScoreBar — displays a numeric risk score with a colored progress bar.
 *
 * @param {number}  score     — 0–100 (or 0.0–1.0, auto-normalised)
 * @param {boolean} compact   — if true, renders a smaller single-line version
 * @param {string}  className
 */
export function RiskScoreBar({ score = 0, compact = false, className = '' }) {
  // Normalise 0.0–1.0 → 0–100
  const numeric = Number(score);
  const pct = numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric);
  const clamped = Math.min(100, Math.max(0, pct));

  const level =
    clamped >= 70 ? 'HIGH' :
    clamped >= 40 ? 'MEDIUM' :
    'LOW';

  const barColor =
    level === 'HIGH'   ? '#f87171' :
    level === 'MEDIUM' ? '#fbbf24' :
    '#34d399';

  const textColor =
    level === 'HIGH'   ? '#f87171' :
    level === 'MEDIUM' ? '#fbbf24' :
    '#34d399';

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm font-bold tabular-nums" style={{ color: textColor, minWidth: 32 }}>
          {clamped}%
        </span>
        <div className="risk-bar-track flex-1" style={{ minWidth: 60 }}>
          <div
            className={`risk-bar-fill-${level.toLowerCase()}`}
            style={{ width: `${clamped}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold tabular-nums" style={{ color: textColor }}>
          {(clamped / 100).toFixed(2)}
        </span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded"
          style={{ color: textColor, background: `${barColor}20`, border: `1px solid ${barColor}40` }}
        >
          {level}
        </span>
      </div>
      <div className="risk-bar-track">
        <div
          className={`risk-bar-fill-${level.toLowerCase()}`}
          style={{ width: `${clamped}%`, transition: 'width 0.6s ease' }}
        />
      </div>
    </div>
  );
}
