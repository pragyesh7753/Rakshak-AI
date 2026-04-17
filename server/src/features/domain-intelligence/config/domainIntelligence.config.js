function toPositiveInt(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback;
  }
  return Math.floor(numeric);
}

function toRatio(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.min(1, Math.max(0, numeric));
}

export const DOMAIN_INTELLIGENCE_CRON =
  process.env.DOMAIN_INTELLIGENCE_CRON ?? "0 */6 * * *";

export const DOMAIN_INTELLIGENCE_RUN_ON_START =
  process.env.RUN_DOMAIN_INTELLIGENCE_ON_START === "true";

export const DOMAIN_INTELLIGENCE_MAX_CANDIDATES_PER_ORG = toPositiveInt(
  process.env.DOMAIN_INTELLIGENCE_MAX_CANDIDATES_PER_ORG,
  120
);

export const DOMAIN_INTELLIGENCE_NETWORK_TIMEOUT_MS = toPositiveInt(
  process.env.DOMAIN_INTELLIGENCE_NETWORK_TIMEOUT_MS,
  12000
);

export const DOMAIN_INTELLIGENCE_SOCIAL_SAMPLE_LIMIT = toPositiveInt(
  process.env.DOMAIN_INTELLIGENCE_SOCIAL_SAMPLE_LIMIT,
  5
);

export const DOMAIN_INTELLIGENCE_SOCIAL_SCAN_LIMIT = toPositiveInt(
  process.env.DOMAIN_INTELLIGENCE_SOCIAL_SCAN_LIMIT,
  80
);

export const DOMAIN_INTELLIGENCE_SIMILARITY_THRESHOLD = toRatio(
  process.env.DOMAIN_INTELLIGENCE_SIMILARITY_THRESHOLD,
  0.82
);

export const DOMAIN_INTELLIGENCE_HIGH_RISK_THRESHOLD = toPositiveInt(
  process.env.DOMAIN_INTELLIGENCE_HIGH_RISK_THRESHOLD,
  70
);

export const DOMAIN_INTELLIGENCE_TLDS = ["com", "in", "net"];

export const DOMAIN_INTELLIGENCE_BASE_KEYWORDS = [
  "login",
  "verify",
  "secure",
  "support",
  "update",
  "account",
  "signin",
  "wallet",
  "otp",
  "portal",
];

export const DOMAIN_INTELLIGENCE_FLAG_VALUES = [
  "typosquatting",
  "keyword_attack",
  "new_domain",
  "social_spread",
  "active_phishing",
];
