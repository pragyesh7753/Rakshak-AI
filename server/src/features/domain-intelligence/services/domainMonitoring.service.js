import axios from "axios";
import whois from "whois-json";
import { DOMAIN_INTELLIGENCE_NETWORK_TIMEOUT_MS } from "../config/domainIntelligence.config.js";
import { normalizeDomain } from "../utils/domainNormalization.js";

const WHOIS_NO_MATCH_PATTERNS = [
  "no match",
  "not found",
  "no data found",
  "status: free",
  "domain not found",
  "no entries found",
  "available for registration",
];

function parseDateSafe(value) {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const parsed = parseDateSafe(item);
      if (parsed) {
        return parsed;
      }
    }
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

function resolveWhoisCreationDate(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  for (const [key, value] of Object.entries(payload)) {
    const normalizedKey = String(key).trim().toLowerCase();
    if (
      normalizedKey.includes("creation") ||
      normalizedKey.includes("created") ||
      normalizedKey.includes("registered")
    ) {
      const parsed = parseDateSafe(value);
      if (parsed) {
        return parsed;
      }
    }
  }

  return null;
}

function inferWhoisExists(payload) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const serialized = JSON.stringify(payload).toLowerCase();
  if (!serialized || serialized === "{}") {
    return false;
  }

  if (WHOIS_NO_MATCH_PATTERNS.some((token) => serialized.includes(token))) {
    return false;
  }

  if (resolveWhoisCreationDate(payload)) {
    return true;
  }

  const hasDomainKey = Object.keys(payload).some((key) => {
    const normalizedKey = String(key).trim().toLowerCase();
    return normalizedKey.includes("domain") || normalizedKey.includes("registrar");
  });

  return hasDomainKey;
}

export async function checkWhois(domain) {
  const normalizedDomain = normalizeDomain(domain);

  if (!normalizedDomain) {
    return {
      exists: false,
      creationDate: null,
      raw: null,
    };
  }

  try {
    const payload = await whois(normalizedDomain, {
      timeout: DOMAIN_INTELLIGENCE_NETWORK_TIMEOUT_MS,
      follow: 2,
      verbose: false,
    });

    return {
      exists: inferWhoisExists(payload),
      creationDate: resolveWhoisCreationDate(payload),
      raw: payload,
    };
  } catch (error) {
    return {
      exists: false,
      creationDate: null,
      raw: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function extractCrtTimestamp(item) {
  return (
    parseDateSafe(item?.entry_timestamp) ??
    parseDateSafe(item?.not_before) ??
    parseDateSafe(item?.not_after)
  );
}

function extractCrtMatches(rows, domain) {
  const normalizedDomain = normalizeDomain(domain);
  const matchMap = new Map();

  for (const row of rows) {
    const rawNameValue = String(row?.name_value ?? "");
    const rawCommonName = String(row?.common_name ?? "");
    const names = [
      ...rawNameValue.split(/\s+/g),
      ...rawNameValue.split(/\n+/g),
      rawCommonName,
    ]
      .map((value) => normalizeDomain(value.replace(/^\*\./, "")))
      .filter(Boolean);

    const timestamp = extractCrtTimestamp(row);

    for (const entry of names) {
      if (entry === normalizedDomain || normalizedDomain.endsWith(`.${entry}`)) {
        const key = `${entry}|${timestamp ? timestamp.toISOString() : "none"}`;
        if (!matchMap.has(key)) {
          matchMap.set(key, {
            domain: entry,
            timestamp,
          });
        }
      }
    }
  }

  return [...matchMap.values()].sort((left, right) => {
    const leftTime = left.timestamp ? left.timestamp.getTime() : 0;
    const rightTime = right.timestamp ? right.timestamp.getTime() : 0;
    return rightTime - leftTime;
  });
}

export async function checkCrtSh(domain) {
  const normalizedDomain = normalizeDomain(domain);
  if (!normalizedDomain) {
    return { entries: [] };
  }

  try {
    const response = await axios.get(
      `https://crt.sh/?q=${encodeURIComponent(normalizedDomain)}&output=json`,
      {
        timeout: DOMAIN_INTELLIGENCE_NETWORK_TIMEOUT_MS,
        headers: {
          "User-Agent": "rakshak-ai-domain-intelligence/1.0",
        },
      }
    );

    let payload = response.data;
    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch (_error) {
        payload = [];
      }
    }

    const rows = Array.isArray(payload) ? payload : [];
    const entries = extractCrtMatches(rows, normalizedDomain).slice(0, 25);

    return { entries };
  } catch (error) {
    return {
      entries: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function monitorDomain(domain) {
  const normalizedDomain = normalizeDomain(domain);

  const [whoisResult, crtResult] = await Promise.all([
    checkWhois(normalizedDomain),
    checkCrtSh(normalizedDomain),
  ]);

  const certDates = crtResult.entries
    .map((item) => item.timestamp)
    .filter((value) => value instanceof Date)
    .sort((left, right) => left.getTime() - right.getTime());

  const registeredAt = whoisResult.creationDate ?? certDates[0] ?? null;

  return {
    domain: normalizedDomain,
    exists: Boolean(whoisResult.exists || crtResult.entries.length > 0),
    registeredAt,
    whois: {
      exists: Boolean(whoisResult.exists),
      creationDate: whoisResult.creationDate,
    },
    crt: {
      entries: crtResult.entries,
    },
  };
}
