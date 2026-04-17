/**
 * Shared severity helpers — single source of truth across all features.
 */

/**
 * Returns a Tailwind background colour class for a numeric severity score (1–10).
 * @param {number} score
 * @returns {string}
 */
export function getSeverityColor(score) {
  if (score >= 7) return 'bg-red-500';
  if (score >= 4) return 'bg-yellow-500';
  return 'bg-green-500';
}

/**
 * Returns a human-readable severity label for a numeric severity score (1–10).
 * @param {number} score
 * @returns {'High' | 'Medium' | 'Low'}
 */
export function getSeverityLabel(score) {
  if (score >= 7) return 'High';
  if (score >= 4) return 'Medium';
  return 'Low';
}

/**
 * Returns Tailwind classes for a string severity level used in domain/monitoring.
 * @param {'high'|'medium'|'low'} severity
 * @returns {string}
 */
export function getSeverityBadgeClasses(severity) {
  switch (severity?.toLowerCase()) {
    case 'high':
      return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'medium':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'low':
      return 'text-green-400 bg-green-400/10 border-green-400/20';
    default:
      return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
}

/**
 * Returns Tailwind classes for a risk level string used in monitoring threat logs.
 * @param {'Critical'|'High'|'Medium'|'Low'} risk
 * @returns {string}
 */
export function getRiskBadgeClasses(risk) {
  switch (risk) {
    case 'Critical':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'High':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'Medium':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'Low':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}
