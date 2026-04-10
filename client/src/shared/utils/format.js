import { formatDistanceToNow } from 'date-fns';

/**
 * Formats a timestamp string as a relative time (e.g. "2 minutes ago").
 * Returns "Unknown time" if the timestamp is invalid.
 * @param {string | Date} timestamp
 * @returns {string}
 */
export function formatRelativeTime(timestamp) {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    return 'Unknown time';
  }
}

/**
 * Parses a log message string that may start with a tag like [LIVE], [COMPLETED], [ERROR].
 * Returns the tag, its colour class, and the rest of the message.
 * @param {string} message
 * @returns {{ tag: string | null, tagColor: string, message: string }}
 */
export function parseLogMessage(message) {
  const tagMatch = message.match(/^\[(.*?)\]/);
  if (tagMatch) {
    const tag = tagMatch[1];
    const remainingMessage = message.substring(tagMatch[0].length).trim();

    let tagColor = 'text-cyan-400';
    if (tag === 'ERROR' || tag === 'FAILED') tagColor = 'text-red-400';
    else if (tag === 'LIVE') tagColor = 'text-yellow-400';
    else if (tag === 'COMPLETED') tagColor = 'text-green-400';

    return { tag, tagColor, message: remainingMessage };
  }
  return { tag: null, tagColor: '', message };
}
