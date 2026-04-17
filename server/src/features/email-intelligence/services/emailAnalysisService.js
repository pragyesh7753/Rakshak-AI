import { GoogleGenAI } from "@google/genai";
import { Organization } from "../../../models/Organization.js";
import { checkWhois } from "../../domain-intelligence/services/domainMonitoring.service.js";
import { calculateRisk as calculateDomainRisk } from "../../domain-intelligence/services/riskScoring.service.js";
import { normalizeDomain } from "../../domain-intelligence/utils/domainNormalization.js";
import { calculateDomainSimilarity } from "../../domain-intelligence/utils/similarity.js";
import { generateGroqReasoning, isGroqConfigured } from "../../threat-pipeline/clients/groqClient.js";
import {
  buildEmailThreatPrompt,
  extractJsonPayloadFromModelResponse,
  normalizeAiAssessment,
} from "../utils/aiPrompt.js";
import { EmailIntelligenceResult } from "../models/EmailIntelligenceResult.js";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3-flash-preview";
const EMAIL_ORG_ALIAS_CACHE_TTL_MS = Math.max(
  5_000,
  Number(process.env.EMAIL_ORG_ALIAS_CACHE_TTL_MS ?? 60_000)
);
const LINK_REGEX = /\bhttps?:\/\/[^\s<>")']+/gi;
const EMAIL_REGEX = /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i;

const SHORTENER_DOMAINS = new Set([
  "bit.ly",
  "t.co",
  "tinyurl.com",
  "rb.gy",
  "goo.gl",
  "ow.ly",
  "shorturl.at",
]);

const URGENCY_PATTERNS = [
  /\burgent\b/i,
  /\bimmediate(?:ly)?\b/i,
  /\bwithin\s+\d+\s*(?:hours?|minutes?)\b/i,
  /\baction\s+required\b/i,
  /\baccount\s+(?:will\s+be\s+)?(?:suspend|locked|disabled)\b/i,
  /\blast\s+warning\b/i,
];

const FINANCIAL_PATTERNS = [
  /\bwire\s+transfer\b/i,
  /\bbank\s+details\b/i,
  /\bpayment\b/i,
  /\binvoice\b/i,
  /\bgift\s+card\b/i,
  /\bupi\b/i,
  /\bbeneficiary\b/i,
];

const CREDENTIAL_PATTERNS = [
  /\blogin\b/i,
  /\bverify\s+(?:your\s+)?(?:account|identity|password)\b/i,
  /\breset\s+(?:your\s+)?password\b/i,
  /\bcredential(?:s)?\b/i,
  /\bone[ -]?time\s+password\b/i,
  /\botp\b/i,
];

const IMPERSONATION_PATTERNS = [
  /\bceo\b/i,
  /\bcfo\b/i,
  /\bfinance\s+head\b/i,
  /\bdirector\b/i,
  /\bhuman\s+resources\b/i,
  /\bpayroll\b/i,
  /\bit\s+admin\b/i,
];

let organizationAliasCache = new Map();
let organizationAliasCacheExpiresAt = 0;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function weightedAverage(parts) {
  const valid = (Array.isArray(parts) ? parts : []).filter(
    (item) => Number.isFinite(item?.value) && Number.isFinite(item?.weight) && item.weight > 0
  );

  if (valid.length === 0) {
    return 0;
  }

  const weightedSum = valid.reduce((sum, item) => sum + item.value * item.weight, 0);
  const totalWeight = valid.reduce((sum, item) => sum + item.weight, 0);

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

function uniqueValues(values) {
  return [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
}

function normalizeAlias(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "");
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractApexLabel(domain) {
  const normalized = normalizeDomain(domain);
  if (!normalized) {
    return "";
  }

  const parts = normalized.split(".").filter(Boolean);
  if (parts.length === 0) {
    return "";
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return parts[parts.length - 2];
}

function mapOrganizationForLookup(doc) {
  if (!doc) {
    return null;
  }

  return {
    id: String(doc._id ?? ""),
    clerkUserId: String(doc.clerkUserId ?? ""),
    orgName: String(doc.orgName ?? ""),
    domain: String(doc.domain ?? "").trim().toLowerCase(),
    sector: String(doc.sector ?? ""),
    keywords: Array.isArray(doc.keywords) ? doc.keywords : [],
    seedKeywords: Array.isArray(doc.seedKeywords) ? doc.seedKeywords : [],
  };
}

function buildOrganizationAliases(organization) {
  const apexLabel = extractApexLabel(organization?.domain);
  const aliases = uniqueValues([
    normalizeAlias(organization?.id),
    normalizeAlias(organization?.clerkUserId),
    normalizeAlias(apexLabel),
    normalizeAlias(slugify(organization?.orgName)),
    normalizeAlias(String(organization?.domain ?? "").split(".")[0]),
  ]).filter((value) => value.length >= 2);

  return aliases;
}

async function loadOrganizationAliasCache(options = {}) {
  const force = Boolean(options?.force);
  const now = Date.now();
  if (!force && organizationAliasCache.size > 0 && now < organizationAliasCacheExpiresAt) {
    return organizationAliasCache;
  }

  const organizations = await Organization.find({})
    .select("_id clerkUserId orgName domain sector keywords seedKeywords")
    .lean();

  const nextCache = new Map();

  for (const organizationDoc of organizations) {
    const organization = mapOrganizationForLookup(organizationDoc);
    if (!organization) {
      continue;
    }

    const aliases = buildOrganizationAliases(organization);
    for (const alias of aliases) {
      if (!nextCache.has(alias)) {
        nextCache.set(alias, organization);
      }
    }
  }

  organizationAliasCache = nextCache;
  organizationAliasCacheExpiresAt = Date.now() + EMAIL_ORG_ALIAS_CACHE_TTL_MS;

  return organizationAliasCache;
}

function sanitizeUrl(url) {
  return String(url ?? "").replace(/[),.;!?]+$/g, "").trim();
}

function extractLinks(text) {
  const matches = String(text ?? "").match(LINK_REGEX) ?? [];
  const links = matches
    .map((entry) => sanitizeUrl(entry))
    .filter((entry) => entry.startsWith("http://") || entry.startsWith("https://"));

  return uniqueValues(links);
}

function getUrlDomain(url) {
  try {
    return normalizeDomain(new URL(String(url ?? "")).hostname);
  } catch (_error) {
    return "";
  }
}

function extractSenderDomain(email) {
  const match = String(email ?? "").toLowerCase().match(EMAIL_REGEX);
  if (!match) {
    return "";
  }

  const domainPart = String(match[1]).split("@")[1];
  return normalizeDomain(domainPart);
}

function countMatchedPatterns(text, patterns) {
  const matches = [];

  for (const pattern of Array.isArray(patterns) ? patterns : []) {
    if (pattern.test(text)) {
      matches.push(String(pattern));
    }
  }

  return {
    count: matches.length,
    matches,
  };
}

function isSubdomainOf(domain, baseDomain) {
  const normalizedDomain = normalizeDomain(domain);
  const normalizedBase = normalizeDomain(baseDomain);

  if (!normalizedDomain || !normalizedBase) {
    return false;
  }

  return (
    normalizedDomain === normalizedBase ||
    normalizedDomain.endsWith(`.${normalizedBase}`)
  );
}

function runHeuristicChecks({
  subject,
  content,
  links,
  senderDomain,
  organizationDomain,
  organizationName,
}) {
  const combinedText = `${String(subject ?? "")}\n${String(content ?? "")}`.trim();
  const normalizedText = combinedText.toLowerCase();

  const urgent = countMatchedPatterns(normalizedText, URGENCY_PATTERNS);
  const financial = countMatchedPatterns(normalizedText, FINANCIAL_PATTERNS);
  const credential = countMatchedPatterns(normalizedText, CREDENTIAL_PATTERNS);
  const impersonation = countMatchedPatterns(normalizedText, IMPERSONATION_PATTERNS);

  const flags = [];
  let score = 0;

  if (urgent.count > 0) {
    score += Math.min(24, urgent.count * 6);
    flags.push("urgent_language");
  }

  if (financial.count > 0) {
    score += Math.min(30, 16 + financial.count * 5);
    flags.push("financial_request");
  }

  if (credential.count > 0) {
    score += Math.min(28, 12 + credential.count * 5);
    flags.push("credential_harvest");
  }

  if (impersonation.count > 0) {
    score += Math.min(20, 8 + impersonation.count * 4);
    flags.push("impersonation_claim");
  }

  const linkDomains = uniqueValues((Array.isArray(links) ? links : []).map((link) => getUrlDomain(link)));

  const shortenedLinkCount = linkDomains.filter((domain) => SHORTENER_DOMAINS.has(domain)).length;
  if (shortenedLinkCount > 0) {
    score += Math.min(12, shortenedLinkCount * 6);
    flags.push("shortened_link");
  }

  const linkDomainMismatches = linkDomains.filter((domain) => {
    if (!domain || !senderDomain) {
      return false;
    }
    return !isSubdomainOf(domain, senderDomain);
  });

  if (linkDomainMismatches.length > 0) {
    score += Math.min(24, 12 + linkDomainMismatches.length * 4);
    flags.push("link_domain_mismatch");
  }

  const lookalikeLinks = linkDomains.filter((domain) => {
    if (!domain || !organizationDomain || domain === organizationDomain) {
      return false;
    }

    return calculateDomainSimilarity(domain, organizationDomain) >= 0.82;
  });

  if (lookalikeLinks.length > 0) {
    score += Math.min(26, 14 + lookalikeLinks.length * 4);
    flags.push("brand_lookalike_link");
  }

  const orgNameToken = String(organizationName ?? "").trim().toLowerCase();
  if (
    orgNameToken &&
    orgNameToken.length >= 3 &&
    normalizedText.includes(orgNameToken) &&
    senderDomain &&
    organizationDomain &&
    senderDomain !== organizationDomain
  ) {
    score += 10;
    flags.push("brand_name_mention_mismatch");
  }

  return {
    score: clamp(Math.round(score), 0, 100),
    flags: uniqueValues(flags),
    signals: {
      urgentMatches: urgent.count,
      financialMatches: financial.count,
      credentialMatches: credential.count,
      impersonationMatches: impersonation.count,
      linkDomainMismatches,
      lookalikeLinks,
    },
  };
}

function getGeminiApiKey() {
  return String(process.env.GEMINI_API_KEY ?? "").trim();
}

function isPlaceholderValue(value) {
  const lower = String(value ?? "").toLowerCase();
  return lower.includes("your_") || lower.includes("replace") || lower.includes("paste");
}

function isGeminiConfigured() {
  const apiKey = getGeminiApiKey();
  return apiKey.length > 0 && !isPlaceholderValue(apiKey);
}

function getGeminiText(response) {
  if (typeof response?.text === "string" && response.text.trim().length > 0) {
    return response.text;
  }

  const parts = response?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => String(part?.text ?? "").trim())
    .filter(Boolean)
    .join("\n");
}

async function runGeminiAnalysis(prompt) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });

  const parsedPayload = extractJsonPayloadFromModelResponse(getGeminiText(response));
  return normalizeAiAssessment(parsedPayload);
}

async function runGroqAnalysis(prompt) {
  const text = await generateGroqReasoning(prompt);
  const payload = extractJsonPayloadFromModelResponse(text);
  return normalizeAiAssessment(payload);
}

async function runAiAnalysis(context, options = {}) {
  if (typeof options.aiAnalyzer === "function") {
    const customResult = await options.aiAnalyzer(context);
    return normalizeAiAssessment(customResult ?? {});
  }

  if (isGeminiConfigured()) {
    try {
      return await runGeminiAnalysis(context.prompt);
    } catch (error) {
      console.error("[email-intelligence] Gemini analysis failed:", error);
    }
  }

  if (isGroqConfigured()) {
    try {
      return await runGroqAnalysis(context.prompt);
    } catch (error) {
      console.error("[email-intelligence] Groq analysis failed:", error);
    }
  }

  return null;
}

function calculateAiRiskScore(aiAssessment) {
  if (!aiAssessment) {
    return null;
  }

  const value = weightedAverage([
    { value: Number(aiAssessment.phishingIntent ?? 0), weight: 0.45 },
    { value: Number(aiAssessment.urgencyScore ?? 0), weight: 0.2 },
    { value: Number(aiAssessment.impersonationScore ?? 0), weight: 0.2 },
    { value: Number(aiAssessment.socialEngineeringScore ?? 0), weight: 0.15 },
  ]);

  return clamp(Math.round(value), 0, 100);
}

function deriveThreatType({ riskScore, flags, aiAssessment }) {
  if (riskScore <= 20 && flags.length === 0) {
    return "Safe";
  }

  if ((aiAssessment?.phishingIntent ?? 0) >= 60) {
    return "Phishing";
  }

  if (
    flags.includes("credential_harvest") ||
    flags.includes("financial_request") ||
    flags.includes("brand_lookalike_link")
  ) {
    return "Phishing";
  }

  if ((aiAssessment?.impersonationScore ?? 0) >= 60 || flags.includes("impersonation_claim")) {
    return "Impersonation";
  }

  if (riskScore < 30) {
    return "Safe";
  }

  return "Suspicious";
}

function deriveRecommendedAction(riskScore, threatType) {
  if (riskScore >= 75) {
    return "Block";
  }

  const normalizedThreatType = String(threatType ?? "").trim().toLowerCase();
  if (normalizedThreatType === "phishing" || normalizedThreatType === "impersonation") {
    return "Flag";
  }

  if (riskScore >= 40) {
    return "Flag";
  }
  return "Allow";
}

function buildAnalysisSummary({
  senderEmail,
  senderDomain,
  organizationDomain,
  domainSignals,
  heuristicSignals,
  aiAssessment,
}) {
  const parts = [];

  if (senderEmail) {
    parts.push(`Sender observed: ${senderEmail}.`);
  }

  if (senderDomain && organizationDomain) {
    parts.push(
      `Domain comparison ${senderDomain} vs ${organizationDomain} similarity=${Number(
        domainSignals?.similarity ?? 0
      ).toFixed(2)}.`
    );
  }

  if (Array.isArray(domainSignals?.flags) && domainSignals.flags.length > 0) {
    parts.push(`Domain intelligence flags: ${domainSignals.flags.join(", ")}.`);
  }

  if (Array.isArray(heuristicSignals?.flags) && heuristicSignals.flags.length > 0) {
    parts.push(`Heuristic flags: ${heuristicSignals.flags.join(", ")}.`);
  }

  if (aiAssessment?.analysis) {
    parts.push(`AI assessment: ${aiAssessment.analysis}`);
  }

  if (parts.length === 0) {
    return "No strong phishing indicators were detected from domain, heuristic, or AI signals.";
  }

  return parts.join(" ").slice(0, 2200);
}

async function evaluateDomainSignals({ senderDomain, organization, whoisLookup }) {
  const organizationDomain = normalizeDomain(organization?.domain);

  if (!senderDomain || !organizationDomain) {
    return {
      score: 0,
      flags: [],
      similarity: 0,
      organizationDomain,
      senderDomain,
    };
  }

  const similarity = calculateDomainSimilarity(senderDomain, organizationDomain);

  if (isSubdomainOf(senderDomain, organizationDomain)) {
    return {
      score: 0,
      flags: [],
      similarity,
      organizationDomain,
      senderDomain,
    };
  }

  let registeredAt = null;
  try {
    const whoisResult = await whoisLookup(senderDomain);
    registeredAt = whoisResult?.creationDate ?? null;
  } catch (error) {
    console.error("[email-intelligence] WHOIS lookup failed:", error);
  }

  const domainRisk = calculateDomainRisk({
    domain: senderDomain,
    organizationDomain,
    keywords: uniqueValues([...(organization?.keywords ?? []), ...(organization?.seedKeywords ?? [])]),
    registeredAt,
    social: {
      mentions: 0,
      phishingPosts: 0,
    },
  });

  const flags = uniqueValues([
    ...(Array.isArray(domainRisk.flags) ? domainRisk.flags : []),
    similarity >= 0.88 ? "brand_lookalike_sender" : "",
  ]);

  return {
    score: clamp(Math.round(Number(domainRisk.score ?? 0)), 0, 100),
    flags,
    similarity,
    organizationDomain,
    senderDomain,
  };
}

export async function resolveOrganizationByAlias(organizationAlias) {
  const normalizedAlias = normalizeAlias(organizationAlias);
  if (!normalizedAlias) {
    return null;
  }

  const cache = await loadOrganizationAliasCache();
  const fromCache = cache.get(normalizedAlias);
  if (fromCache) {
    return fromCache;
  }

  // Retry once with a forced reload so newly onboarded organizations resolve immediately.
  const refreshedCache = await loadOrganizationAliasCache({ force: true });
  return refreshedCache.get(normalizedAlias) ?? null;
}

export async function resolveOrganizationByUserId(userId) {
  const normalizedUserId = String(userId ?? "").trim();
  if (!normalizedUserId) {
    return null;
  }

  const organization = await Organization.findOne({ clerkUserId: normalizedUserId })
    .select("_id clerkUserId orgName domain sector keywords seedKeywords")
    .lean();

  return mapOrganizationForLookup(organization);
}

function normalizeLimit(value, fallback = 30) {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(100, Math.max(1, Math.floor(parsed)));
}

export async function saveEmailIntelligenceResult(payload = {}) {
  const orgId = String(payload?.organizationId ?? "").trim();
  if (!orgId) {
    return null;
  }

  const document = await EmailIntelligenceResult.create({
    orgId,
    organizationAlias: String(payload?.organizationAlias ?? "").trim().toLowerCase() || orgId,
    recipient: String(payload?.recipient ?? "").trim().slice(0, 320),
    inboundSubject: String(payload?.inboundSubject ?? "").trim().slice(0, 400),
    originalSender: String(payload?.originalSender ?? "").trim().toLowerCase().slice(0, 320),
    originalSubject: String(payload?.originalSubject ?? "").trim().slice(0, 400),
    cleanContent: String(payload?.cleanContent ?? "").trim().slice(0, 16000),
    extractedLinks: (Array.isArray(payload?.extractedLinks) ? payload.extractedLinks : [])
      .map((link) => String(link ?? "").trim())
      .filter(Boolean)
      .slice(0, 80),
    riskScore: clamp(Math.round(Number(payload?.riskScore ?? 0)), 0, 100),
    threatType: String(payload?.threatType ?? "Suspicious"),
    flags: (Array.isArray(payload?.flags) ? payload.flags : [])
      .map((flag) => String(flag ?? "").trim())
      .filter(Boolean)
      .slice(0, 80),
    analysis: String(payload?.analysis ?? "").trim().slice(0, 3000),
    recommendedAction: String(payload?.recommendedAction ?? "Flag"),
    signalBreakdown: payload?.signalBreakdown ?? null,
  });

  return {
    id: String(document._id),
    createdAt: document.createdAt,
  };
}

export async function listEmailIntelligenceResults({ organizationId, limit = 30 }) {
  const orgId = String(organizationId ?? "").trim();
  if (!orgId) {
    return [];
  }

  const safeLimit = normalizeLimit(limit, 30);

  const records = await EmailIntelligenceResult.find({ orgId })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  return records.map((record) => ({
    id: String(record?._id ?? ""),
    organizationId: String(record?.organizationAlias ?? ""),
    riskScore: clamp(Math.round(Number(record?.riskScore ?? 0)), 0, 100),
    threatType: String(record?.threatType ?? "Suspicious"),
    flags: Array.isArray(record?.flags) ? record.flags : [],
    analysis: String(record?.analysis ?? ""),
    recommendedAction: String(record?.recommendedAction ?? "Flag"),
    originalSender: String(record?.originalSender ?? ""),
    originalSubject: String(record?.originalSubject ?? ""),
    extractedLinks: Array.isArray(record?.extractedLinks) ? record.extractedLinks : [],
    recipient: String(record?.recipient ?? ""),
    signalBreakdown: record?.signalBreakdown ?? null,
    createdAt: record?.createdAt ?? null,
  }));
}

export async function analyzeEmailThreat(input, options = {}) {
  const organization = input?.organization;
  const organizationId = String(input?.organizationId ?? "").trim();
  const organizationAlias = String(input?.organizationAlias ?? "").trim().toLowerCase();
  const originalSender = String(input?.originalSender ?? "").trim().toLowerCase();
  const originalSubject = String(input?.originalSubject ?? "").trim();
  const cleanContent = String(input?.cleanContent ?? "").trim();

  const senderDomain = extractSenderDomain(originalSender);
  const links = extractLinks(cleanContent);

  const domainSignals = await evaluateDomainSignals({
    senderDomain,
    organization,
    whoisLookup: options.whoisLookup ?? checkWhois,
  });

  const heuristicSignals = runHeuristicChecks({
    subject: originalSubject,
    content: cleanContent,
    links,
    senderDomain,
    organizationDomain: domainSignals.organizationDomain,
    organizationName: organization?.orgName,
  });

  const prompt = buildEmailThreatPrompt({
    organizationId: organizationAlias || organizationId,
    organizationName: organization?.orgName,
    organizationDomain: domainSignals.organizationDomain,
    organizationSector: organization?.sector,
    senderEmail: originalSender,
    senderDomain,
    subject: originalSubject,
    content: cleanContent,
    links,
    domainFlags: domainSignals.flags,
    heuristicFlags: heuristicSignals.flags,
    domainSimilarity: domainSignals.similarity,
  });

  const aiAssessment = await runAiAnalysis(
    {
      prompt,
      senderEmail: originalSender,
      subject: originalSubject,
      cleanContent,
      links,
    },
    options
  );

  const aiRiskScore = calculateAiRiskScore(aiAssessment);

  let riskScore = weightedAverage([
    { value: domainSignals.score, weight: 0.4 },
    { value: heuristicSignals.score, weight: 0.3 },
    { value: aiRiskScore, weight: 0.3 },
  ]);

  const mergedFlags = uniqueValues([
    ...(Array.isArray(domainSignals.flags) ? domainSignals.flags : []),
    ...(Array.isArray(heuristicSignals.flags) ? heuristicSignals.flags : []),
    ...(Array.isArray(aiAssessment?.flags) ? aiAssessment.flags : []),
  ]);

  if (mergedFlags.includes("credential_harvest") && mergedFlags.includes("financial_request")) {
    riskScore += 10;
  }

  if (mergedFlags.includes("typosquatting") && mergedFlags.includes("link_domain_mismatch")) {
    riskScore += 8;
  }

  const normalizedRiskScore = clamp(Math.round(riskScore), 0, 100);
  const threatType = deriveThreatType({
    riskScore: normalizedRiskScore,
    flags: mergedFlags,
    aiAssessment,
  });

  const recommendedAction = deriveRecommendedAction(normalizedRiskScore, threatType);
  const analysis = buildAnalysisSummary({
    senderEmail: originalSender,
    senderDomain,
    organizationDomain: domainSignals.organizationDomain,
    domainSignals,
    heuristicSignals,
    aiAssessment,
  });

  return {
    organizationId: organizationAlias || organizationId,
    organizationRef: organizationId,
    riskScore: normalizedRiskScore,
    threatType,
    flags: mergedFlags,
    analysis,
    recommendedAction,
    originalSender,
    originalSubject,
    extractedLinks: links,
    signalBreakdown: {
      domain: {
        score: domainSignals.score,
        similarity: Number(domainSignals.similarity?.toFixed(4) ?? 0),
        flags: domainSignals.flags,
      },
      heuristics: {
        score: heuristicSignals.score,
        flags: heuristicSignals.flags,
      },
      ai: aiAssessment
        ? {
            score: aiRiskScore,
            phishingIntent: aiAssessment.phishingIntent,
            urgencyScore: aiAssessment.urgencyScore,
            impersonationScore: aiAssessment.impersonationScore,
            socialEngineeringScore: aiAssessment.socialEngineeringScore,
            threatType: aiAssessment.threatType,
          }
        : null,
    },
  };
}
