/**
 * ThreatTypeBadge — reusable badge for threat/intent classification types.
 * Supports: PHISHING, SCAM, BEC, THREAT, IMPERSONATION, SAFE, INFO, NEUTRAL, + any custom string.
 */
export function ThreatTypeBadge({ type, className = '' }) {
  const normalized = String(type ?? '').toUpperCase().replace(/\s+/g, '_');

  const cls =
    normalized === 'PHISHING'      ? 'badge-phishing'     :
    normalized === 'SCAM'          ? 'badge-scam'         :
    normalized === 'BEC'           ? 'badge-bec'          :
    normalized === 'THREAT'        ? 'badge-threat'       :
    normalized === 'IMPERSONATION' ? 'badge-impersonation':
    normalized === 'SAFE'          ? 'badge-safe'         :
    normalized === 'INFO'          ? 'badge-info'         :
    'badge-neutral';

  return (
    <span className={`${cls} ${className}`}>
      {String(type ?? 'UNKNOWN').toUpperCase()}
    </span>
  );
}

/**
 * SentimentBadge — for social media sentiment analysis output.
 * Supports: PANIC, URGENT, AGGRESSIVE, NEUTRAL
 */
export function SentimentBadge({ sentiment, className = '' }) {
  const normalized = String(sentiment ?? '').toUpperCase();

  const cls =
    normalized === 'PANIC'      ? 'badge-panic'      :
    normalized === 'URGENT'     ? 'badge-urgent'     :
    normalized === 'AGGRESSIVE' ? 'badge-aggressive' :
    'badge-neutral';

  return (
    <span className={`${cls} ${className}`}>
      {normalized || 'UNKNOWN'}
    </span>
  );
}
