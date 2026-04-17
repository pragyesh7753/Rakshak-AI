import {
  DOMAIN_INTELLIGENCE_BASE_KEYWORDS,
  DOMAIN_INTELLIGENCE_TLDS,
} from "../config/domainIntelligence.config.js";
import { sanitizeKeyword, splitDomain } from "../utils/domainNormalization.js";

function normalizeLabel(label) {
  return String(label ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 30);
}

function withTlds(label, tlds) {
  const cleanLabel = normalizeLabel(label);
  if (cleanLabel.length < 3) {
    return [];
  }

  return tlds
    .map((tld) => `${cleanLabel}.${tld}`)
    .filter((domain) => domain.length >= 6 && domain.length <= 253);
}

function buildTypoLabels(label) {
  const clean = normalizeLabel(label);
  const chars = clean.split("");
  const generated = new Set();

  for (let index = 0; index < chars.length; index += 1) {
    if (chars.length > 4) {
      const removed = `${chars.slice(0, index).join("")}${chars.slice(index + 1).join("")}`;
      generated.add(removed);
    }

    const duplicated = `${chars.slice(0, index + 1).join("")}${chars[index]}${chars
      .slice(index + 1)
      .join("")}`;
    generated.add(duplicated);

    if (index < chars.length - 1) {
      const swapped = [...chars];
      [swapped[index], swapped[index + 1]] = [swapped[index + 1], swapped[index]];
      generated.add(swapped.join(""));
    }
  }

  return [...generated]
    .map((value) => normalizeLabel(value))
    .filter((value) => value.length >= 3)
    .sort((left, right) => left.localeCompare(right));
}

function buildKeywordLabels(label, keywords) {
  const cleanLabel = normalizeLabel(label);
  const generated = new Set();

  for (const keyword of keywords) {
    const token = sanitizeKeyword(keyword);
    if (token.length < 3 || token === cleanLabel) {
      continue;
    }

    generated.add(`${cleanLabel}${token}`);
    generated.add(`${token}${cleanLabel}`);
    generated.add(`${cleanLabel}-${token}`);
    generated.add(`${token}-${cleanLabel}`);
  }

  return [...generated]
    .map((value) => value.replace(/-/g, ""))
    .map((value) => normalizeLabel(value))
    .filter((value) => value.length >= 3)
    .sort((left, right) => left.localeCompare(right));
}

export function generateDomains(baseDomain, keywords = []) {
  const { label, tld, normalized } = splitDomain(baseDomain);
  const cleanLabel = normalizeLabel(label);

  if (!cleanLabel) {
    return [];
  }

  const normalizedTlds = [
    ...new Set([
      ...DOMAIN_INTELLIGENCE_TLDS,
      String(tld ?? "").toLowerCase(),
    ]),
  ]
    .map((value) => value.replace(/[^a-z]/g, ""))
    .filter((value) => value.length >= 2)
    .sort((left, right) => left.localeCompare(right));

  const normalizedKeywords = [
    ...new Set([
      ...DOMAIN_INTELLIGENCE_BASE_KEYWORDS,
      ...(Array.isArray(keywords) ? keywords : []),
    ]),
  ]
    .map((value) => sanitizeKeyword(value))
    .filter((value) => value.length >= 3)
    .sort((left, right) => left.localeCompare(right));

  const typoLabels = buildTypoLabels(cleanLabel);
  const keywordLabels = buildKeywordLabels(cleanLabel, normalizedKeywords);

  const domains = new Set();

  for (const entry of typoLabels) {
    for (const domain of withTlds(entry, normalizedTlds)) {
      domains.add(domain);
    }
  }

  for (const entry of keywordLabels) {
    for (const domain of withTlds(entry, normalizedTlds)) {
      domains.add(domain);
    }
  }

  domains.delete(normalized);

  return [...domains].sort((left, right) => left.localeCompare(right));
}
