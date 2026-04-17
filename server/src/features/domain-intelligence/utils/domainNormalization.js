export function normalizeDomain(value) {
  let domain = String(value ?? "").trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//i, "");
  domain = domain.split("/")[0].split("?")[0].split("#")[0].trim();
  domain = domain.replace(/^www\./i, "");
  domain = domain.replace(/[^a-z0-9.-]/g, "");
  domain = domain.replace(/\.{2,}/g, ".");
  domain = domain.replace(/^\.+|\.+$/g, "");
  return domain;
}

export function splitDomain(baseDomain) {
  const normalized = normalizeDomain(baseDomain);
  const parts = normalized.split(".").filter(Boolean);

  if (parts.length === 0) {
    return {
      normalized: "",
      label: "",
      tld: "com",
      apex: "",
    };
  }

  if (parts.length === 1) {
    return {
      normalized,
      label: parts[0],
      tld: "com",
      apex: `${parts[0]}.com`,
    };
  }

  const tld = parts[parts.length - 1];
  const secondLevel = parts[parts.length - 2];

  return {
    normalized,
    label: parts[0],
    tld,
    apex: `${secondLevel}.${tld}`,
  };
}

export function extractDomainTokens(baseDomain) {
  const normalized = normalizeDomain(baseDomain);
  const parts = normalized.split(".").filter(Boolean);
  const values = [parts[0], parts[parts.length - 2], parts[parts.length - 3]];

  return [
    ...new Set(
      values
        .map((token) => String(token ?? "").trim().toLowerCase())
        .filter((token) => token.length >= 3)
    ),
  ];
}

export function sanitizeKeyword(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 30);
}

export function escapeRegex(value) {
  return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
