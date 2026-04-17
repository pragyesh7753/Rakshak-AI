import {
  DOMAIN_INTELLIGENCE_BASE_KEYWORDS,
  DOMAIN_INTELLIGENCE_HIGH_RISK_THRESHOLD,
  DOMAIN_INTELLIGENCE_SIMILARITY_THRESHOLD,
} from "../config/domainIntelligence.config.js";
import {
  normalizeDomain,
  sanitizeKeyword,
} from "../utils/domainNormalization.js";
import { calculateDomainSimilarity } from "../utils/similarity.js";

function toValidDate(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function calculateAgeDays(value) {
  const date = toValidDate(value);
  if (!date) {
    return null;
  }

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) {
    return 0;
  }

  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

function containsSuspiciousKeyword(domain, keywords) {
  const normalizedDomain = normalizeDomain(domain);
  if (!normalizedDomain) {
    return false;
  }

  const mergedKeywords = [
    ...new Set([
      ...DOMAIN_INTELLIGENCE_BASE_KEYWORDS,
      ...(Array.isArray(keywords) ? keywords : []),
    ]),
  ]
    .map((token) => sanitizeKeyword(token))
    .filter((token) => token.length >= 3)
    .sort((left, right) => right.length - left.length);

  return mergedKeywords.some((token) => normalizedDomain.includes(token));
}

export function calculateRisk(domainData) {
  const organizationDomain = normalizeDomain(domainData?.organizationDomain);
  const suspiciousDomain = normalizeDomain(domainData?.domain);

  const similarity = calculateDomainSimilarity(suspiciousDomain, organizationDomain);
  const domainAgeDays = calculateAgeDays(domainData?.registeredAt);
  const socialMentions = Number(domainData?.social?.mentions ?? 0);
  const phishingPosts = Number(domainData?.social?.phishingPosts ?? 0);

  const flags = new Set();
  let score = 0;

  if (domainAgeDays !== null && domainAgeDays < 7) {
    score += 40;
    flags.add("new_domain");
  }

  if (similarity >= DOMAIN_INTELLIGENCE_SIMILARITY_THRESHOLD) {
    score += 30;
    flags.add("typosquatting");
  }

  if (containsSuspiciousKeyword(suspiciousDomain, domainData?.keywords)) {
    score += 20;
    flags.add("keyword_attack");
  }

  if (socialMentions > 0) {
    score += 30;
    flags.add("social_spread");

    if (phishingPosts > 0) {
      flags.add("active_phishing");
    }
  }

  score = Math.min(100, Math.max(0, score));

  const severity =
    score >= DOMAIN_INTELLIGENCE_HIGH_RISK_THRESHOLD
      ? "high"
      : score >= 40
        ? "medium"
        : "low";

  return {
    score,
    severity,
    flags: [...flags],
    similarity,
    domainAgeDays,
  };
}
