/**
 * Skeleton loaders for different content shapes.
 * All use the .skeleton CSS class defined in globals.css (shimmer animation).
 */

/** Single line of text */
export function SkeletonLine({ width = '100%', height = 14, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: 4 }}
    />
  );
}

/** Stat card skeleton — matches SummaryCard layout */
export function SkeletonStatCard() {
  return (
    <div className="soc-card space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <SkeletonLine width={80} height={12} />
          <SkeletonLine width={48} height={32} />
        </div>
        <div className="skeleton w-10 h-10 rounded-lg" />
      </div>
      <SkeletonLine width={100} height={10} />
    </div>
  );
}

/** Full row card skeleton — matches ThreatFeed / email card */
export function SkeletonCard({ rows = 3 }) {
  return (
    <div className="soc-card space-y-3">
      <div className="flex items-center gap-2">
        <SkeletonLine width={60} height={20} />
        <SkeletonLine width={80} height={20} />
      </div>
      <SkeletonLine width="90%" height={16} />
      {Array.from({ length: rows - 1 }).map((_, i) => (
        <SkeletonLine key={i} width={i % 2 === 0 ? '75%' : '60%'} height={12} />
      ))}
      <div className="flex items-center justify-between pt-2">
        <SkeletonLine width={120} height={10} />
        <SkeletonLine width={64} height={28} />
      </div>
    </div>
  );
}

/** Table row skeleton */
export function SkeletonTableRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonLine width={i === 0 ? 140 : i === cols - 1 ? 60 : 80} height={12} />
        </td>
      ))}
    </tr>
  );
}

/** Feed of skeleton cards */
export function SkeletonFeed({ count = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} rows={3} />
      ))}
    </div>
  );
}
