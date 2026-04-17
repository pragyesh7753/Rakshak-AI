function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toScore(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return clamp(Math.round(parsed), 0, 100);
}

function normalizeThreatType(value) {
  const lower = String(value ?? "").trim().toLowerCase();
  if (lower === "phishing") return "Phishing";
  if (lower === "impersonation") return "Impersonation";
  if (lower === "safe") return "Safe";
  return "Suspicious";
}

function normalizeFlags(values) {
  const seen = new Set();
  const normalized = [];

  for (const value of Array.isArray(values) ? values : []) {
    const token = String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_ -]/g, "")
      .replace(/\s+/g, "_")
      .slice(0, 60);

    if (!token || seen.has(token)) {
      continue;
    }

    seen.add(token);
    normalized.push(token);
  }

  return normalized;
}

export function buildEmailThreatPrompt(input) {
  const payload = {
    organization: {
      id: String(input?.organizationId ?? ""),
      name: String(input?.organizationName ?? ""),
      domain: String(input?.organizationDomain ?? ""),
      sector: String(input?.organizationSector ?? ""),
    },
    sender: {
      email: String(input?.senderEmail ?? ""),
      domain: String(input?.senderDomain ?? ""),
    },
    email: {
      subject: String(input?.subject ?? "").slice(0, 300),
      content: String(input?.content ?? "").slice(0, 4500),
      links: Array.isArray(input?.links) ? input.links.slice(0, 20) : [],
    },
    rule_based_signals: {
      domain_flags: Array.isArray(input?.domainFlags) ? input.domainFlags : [],
      heuristic_flags: Array.isArray(input?.heuristicFlags) ? input.heuristicFlags : [],
      domain_similarity: Number(input?.domainSimilarity ?? 0),
    },
  };

  return `
You are a cybersecurity email threat analyst.

Analyze the forwarded suspicious email using the structured input below.

Input JSON:
${JSON.stringify(payload, null, 2)}

Return STRICT JSON only (no markdown, no prose) with this exact schema:
{
  "phishingIntent": 0,
  "urgencyScore": 0,
  "impersonationScore": 0,
  "socialEngineeringScore": 0,
  "threatType": "Phishing | Impersonation | Safe | Suspicious",
  "flags": ["flag_token"],
  "analysis": "1-3 concise sentences"
}

Scoring guidance:
- 0 means no evidence.
- 100 means very strong evidence.
- Focus on phishing intent, urgency pressure, impersonation claims, and social engineering manipulation.
- If uncertain, choose conservative mid confidence and explain why.
`;
}

export function extractJsonPayloadFromModelResponse(rawText) {
  const cleaned = String(rawText ?? "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  if (!cleaned) {
    throw new Error("Model response was empty");
  }

  if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
    return JSON.parse(cleaned);
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON payload found in model response");
  }

  return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
}

export function normalizeAiAssessment(payload) {
  return {
    phishingIntent: toScore(payload?.phishingIntent, 0),
    urgencyScore: toScore(payload?.urgencyScore, 0),
    impersonationScore: toScore(payload?.impersonationScore, 0),
    socialEngineeringScore: toScore(payload?.socialEngineeringScore, 0),
    threatType: normalizeThreatType(payload?.threatType),
    flags: normalizeFlags(payload?.flags),
    analysis: String(payload?.analysis ?? "").trim().slice(0, 2000),
  };
}
