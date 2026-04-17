/**
 * RiskBadge — reusable badge for HIGH / MEDIUM / LOW / SAFE risk levels.
 * Uses CSS utility classes from globals.css.
 */
export function RiskBadge({ level, className = '' }) {
  const normalized = String(level ?? '').toUpperCase();

  const cls =
    normalized === 'HIGH'   ? 'badge-high'   :
    normalized === 'MEDIUM' ? 'badge-medium' :
    normalized === 'LOW'    ? 'badge-low'    :
    normalized === 'SAFE'   ? 'badge-safe'   :
    'badge-neutral';

  const dot =
    normalized === 'HIGH'   ? '#f87171' :
    normalized === 'MEDIUM' ? '#fbbf24' :
    (normalized === 'LOW' || normalized === 'SAFE') ? '#34d399' :
    '#cbd5e1';

  return (
    <span className={`${cls} ${className}`}>
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: dot }}
      />
      {normalized || 'UNKNOWN'}
    </span>
  );
}
