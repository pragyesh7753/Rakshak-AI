const FORWARDED_MARKER_REGEX = /^\s*-{2,}\s*forwarded message\s*-{2,}\s*$/i;
const HEADER_LINE_REGEX = /^([A-Za-z][A-Za-z-]*):\s*(.*)$/;
const EMAIL_REGEX = /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i;

function normalizeMultilineText(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function sanitizeHeaderValue(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function extractEmailFromText(value) {
  const match = String(value ?? "").match(EMAIL_REGEX);
  return match ? String(match[1]).toLowerCase() : "";
}

function findForwardedHeaderStart(lines) {
  for (let index = 0; index < lines.length; index += 1) {
    if (FORWARDED_MARKER_REGEX.test(lines[index])) {
      return index + 1;
    }
  }

  for (let index = 0; index < lines.length; index += 1) {
    if (!/^\s*from\s*:/i.test(lines[index])) {
      continue;
    }

    const end = Math.min(lines.length, index + 8);
    for (let cursor = index; cursor < end; cursor += 1) {
      if (/^\s*subject\s*:/i.test(lines[cursor])) {
        return index;
      }
    }
  }

  return -1;
}

function parseHeaderBlock(lines, startIndex) {
  const headers = {};
  let currentHeader = "";
  let bodyStartIndex = lines.length;

  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index];

    if (!line.trim()) {
      if (Object.keys(headers).length > 0) {
        bodyStartIndex = index + 1;
        break;
      }
      continue;
    }

    const headerMatch = line.match(HEADER_LINE_REGEX);
    if (headerMatch) {
      const headerName = String(headerMatch[1] ?? "").trim().toLowerCase();
      const headerValue = String(headerMatch[2] ?? "").trim();

      currentHeader = headerName;
      if (!headers[headerName]) {
        headers[headerName] = headerValue;
      } else {
        headers[headerName] = `${headers[headerName]} ${headerValue}`.trim();
      }
      continue;
    }

    if (currentHeader && /^\s+/.test(line)) {
      headers[currentHeader] = `${headers[currentHeader]} ${line.trim()}`.trim();
      continue;
    }

    if (Object.keys(headers).length > 0) {
      bodyStartIndex = index;
      break;
    }
  }

  return { headers, bodyStartIndex };
}

function findHeaderValueAnywhere(text, headerName) {
  const escapedHeader = String(headerName ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(?:^|\\n)\\s*${escapedHeader}\\s*:\\s*(.+)$`, "im");
  const match = String(text ?? "").match(pattern);
  return match ? sanitizeHeaderValue(match[1]) : "";
}

function stripForwardingNoise(lines) {
  const cleaned = [];

  for (const line of lines) {
    const unquoted = String(line ?? "").replace(/^\s*>+\s?/, "").trimEnd();

    if (!unquoted.trim()) {
      cleaned.push("");
      continue;
    }

    if (FORWARDED_MARKER_REGEX.test(unquoted)) {
      continue;
    }

    cleaned.push(unquoted);
  }

  const normalized = [];
  let previousEmpty = false;

  for (const line of cleaned) {
    const isEmpty = line.trim().length === 0;
    if (isEmpty && previousEmpty) {
      continue;
    }

    previousEmpty = isEmpty;
    normalized.push(line);
  }

  return normalized.join("\n").trim();
}

export function parseForwardedEmail(payload = {}) {
  const fallbackSubject = sanitizeHeaderValue(
    String(payload.subject ?? "").replace(/^\s*(fw|fwd)\s*:\s*/i, "")
  );
  const rawBody = String(payload.body ?? "");
  const normalizedText = normalizeMultilineText(rawBody);
  const lines = normalizedText.split("\n");

  const headerStart = findForwardedHeaderStart(lines);

  let headers = {};
  let bodyStartIndex = 0;

  if (headerStart >= 0) {
    const parsedHeaders = parseHeaderBlock(lines, headerStart);
    headers = parsedHeaders.headers;
    bodyStartIndex = parsedHeaders.bodyStartIndex;
  }

  const originalSender =
    extractEmailFromText(headers.from) ||
    extractEmailFromText(findHeaderValueAnywhere(normalizedText, "From"));

  const originalSubject =
    sanitizeHeaderValue(headers.subject) ||
    findHeaderValueAnywhere(normalizedText, "Subject") ||
    fallbackSubject;

  const contentLines = lines.slice(Math.max(0, bodyStartIndex));
  const cleanContent = stripForwardingNoise(contentLines) || stripForwardingNoise(lines);

  return {
    originalSender,
    originalSubject,
    cleanContent,
  };
}
