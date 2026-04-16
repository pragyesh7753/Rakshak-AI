import { createHash } from "node:crypto";
import { Organization } from "../../models/Organization.js";
import { OrganizationKeywordBank } from "../../models/OrganizationKeywordBank.js";
import {
  getMiniLMContextSimilarities,
  isHuggingFaceConfigured,
} from "../clients/huggingfaceClient.js";
import {
  generateGeminiKeywordDraft,
  getGeminiModel,
  isGeminiConfigured,
} from "../clients/geminiClient.js";
import { redditQueries } from "../scrapers/redditThreadQueries.js";
import { threatKeywords } from "./threadDictionary.js";

const ORG_KEYWORD_MAX_CANDIDATES = Math.max(20, Number(process.env.ORG_KEYWORD_MAX_CANDIDATES ?? 120));
const ORG_KEYWORD_MAX_FINAL = Math.max(10, Number(process.env.ORG_KEYWORD_MAX_FINAL ?? 45));
const ORG_KEYWORD_MIN_SIMILARITY = Number(process.env.ORG_KEYWORD_MIN_SIMILARITY ?? 0.18);
const ORG_QUERY_MAX_PER_ORG = Math.max(5, Number(process.env.ORG_QUERY_MAX_PER_ORG ?? 14));
const REDDIT_QUERY_MAX_PER_CYCLE = Math.max(20, Number(process.env.REDDIT_QUERY_MAX_PER_CYCLE ?? 140));
const ORG_EMBEDDING_MIN_SIMILARITY = Number(process.env.ORG_EMBEDDING_MIN_SIMILARITY ?? 0.21);
const ORG_EMBEDDING_MAX_MATCHES = Math.max(1, Number(process.env.ORG_EMBEDDING_MAX_MATCHES ?? 8));

const COMMON_NOISE_TERMS = new Set([
  "security",
  "technology",
  "tech",
  "company",
  "organization",
  "service",
  "services",
  "startup",
  "private",
  "limited",
  "official",
  "website",
  "portal",
  "support",
  "system",
  "systems",
  "india",
]);

function normalizeKeyword(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/^[-_.,]+|[-_.,]+$/g, "")
    .slice(0, 80);

  if (normalized.length < 3) {
    return "";
  }

  if (/^\d+$/.test(normalized)) {
    return "";
  }

  if (COMMON_NOISE_TERMS.has(normalized)) {
    return "";
  }

  return normalized;
}

function uniqueKeywords(values) {
  const seen = new Set();
  const normalized = [];

  for (const value of values) {
    const token = normalizeKeyword(value);
    if (!token || seen.has(token)) {
      continue;
    }
    seen.add(token);
    normalized.push(token);
  }

  return normalized;
}

function extractDomainTokens(domain) {
  const lower = String(domain ?? "").toLowerCase();
  if (!lower) {
    return [];
  }

  return uniqueKeywords(
    lower
      .split(/[^a-z0-9]+/g)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length >= 3 && !["www", "com", "org", "net", "in", "gov", "edu"].includes(entry))
  );
}

function getSeedKeywords(org) {
  if (Array.isArray(org?.seedKeywords)) {
    return org.seedKeywords;
  }
  if (Array.isArray(org?.keywords)) {
    return org.keywords;
  }
  return [];
}

function buildProfileText(org) {
  const orgName = String(org?.orgName ?? "");
  const sector = String(org?.sector ?? "");
  const domain = String(org?.domain ?? "");
  const description = String(org?.description ?? "");
  const seedKeywords = getSeedKeywords(org);

  return [orgName, sector, domain, description, ...seedKeywords]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(" | ")
    .slice(0, 1500);
}

function buildProfileSignature(profileText, userKeywords) {
  return createHash("sha1")
    .update(String(profileText ?? ""))
    .update("\n")
    .update(Array.isArray(userKeywords) ? userKeywords.join("|") : "")
    .digest("hex");
}

function buildStaticBaseline(org) {
  const sector = String(org?.sector ?? "");
  const domainTokens = extractDomainTokens(org?.domain);
  const seedKeywords = getSeedKeywords(org);

  return uniqueKeywords([
    ...threatKeywords,
    ...seedKeywords,
    sector,
    `${sector} breach`,
    `${sector} ransomware`,
    ...domainTokens,
    ...domainTokens.map((token) => `${token} leak`),
  ]).slice(0, 30);
}

function flattenGeminiDraft(draft) {
  const merged = [
    ...(Array.isArray(draft?.baseKeywords) ? draft.baseKeywords : []),
    ...(Array.isArray(draft?.synonyms) ? draft.synonyms : []),
    ...(Array.isArray(draft?.slang) ? draft.slang : []),
    ...(Array.isArray(draft?.multilingual) ? draft.multilingual : []),
  ];

  return uniqueKeywords(merged);
}

function buildFallbackKeywordDraft(org) {
  const orgName = String(org?.orgName ?? "");
  const sector = String(org?.sector ?? "");
  const domainTokens = extractDomainTokens(org?.domain);
  const seedKeywords = getSeedKeywords(org);

  return uniqueKeywords([
    ...seedKeywords,
    ...domainTokens,
    orgName,
    sector,
    `${sector} cyber attack`,
    `${sector} data leak`,
    `${sector} credential leak`,
    `${sector} account takeover`,
    ...domainTokens.map((token) => `${token} data breach`),
    ...domainTokens.map((token) => `${token} credentials`),
  ]);
}

function buildExpandedVariants(baseKeywords) {
  const expansionSource = baseKeywords.slice(0, 18);
  const expanded = [];

  for (const keyword of expansionSource) {
    expanded.push(keyword);
    expanded.push(`${keyword} leak`);
    expanded.push(`${keyword} breach`);
    expanded.push(`${keyword} exposed`);
    expanded.push(`${keyword} credentials`);
  }

  return uniqueKeywords(expanded);
}

async function scoreKeywordCandidates(profileText, candidateKeywords) {
  const candidates = uniqueKeywords(candidateKeywords).slice(0, ORG_KEYWORD_MAX_CANDIDATES);
  if (candidates.length === 0) {
    return [];
  }

  if (!isHuggingFaceConfigured()) {
    return candidates.map((keyword) => ({
      keyword,
      similarity: profileText.toLowerCase().includes(keyword) ? 0.62 : 0.3,
    }));
  }

  const similarities = await getMiniLMContextSimilarities(profileText, candidates);
  return candidates.map((keyword, index) => ({
    keyword,
    similarity: Number.isFinite(Number(similarities[index])) ? Number(similarities[index]) : 0,
  }));
}

function mergeFinalKeywords({ baselineKeywords, scoredCandidates, fallbackCandidates }) {
  const sorted = [...scoredCandidates].sort((left, right) => right.similarity - left.similarity);
  const accepted = sorted
    .filter((item) => item.similarity >= ORG_KEYWORD_MIN_SIMILARITY)
    .map((item) => item.keyword);

  const backfill = sorted.slice(0, 12).map((item) => item.keyword);

  return uniqueKeywords([
    ...baselineKeywords,
    ...accepted,
    ...fallbackCandidates,
    ...backfill,
  ]).slice(0, ORG_KEYWORD_MAX_FINAL);
}

function toLeanBankView(doc) {
  if (!doc) {
    return null;
  }

  return {
    organization: doc.organization,
    profileSignature: doc.profileSignature,
    finalKeywords: Array.isArray(doc.finalKeywords) ? doc.finalKeywords : [],
    generatedAt: doc.generatedAt,
    provider: doc.provider,
    model: doc.model,
    fallbackUsed: Boolean(doc.fallbackUsed),
  };
}

export async function refreshOrganizationKeywordBank(organizationDoc, options = {}) {
  const force = Boolean(options?.force);
  const allowGemini = options?.allowGemini ?? true;

  if (!organizationDoc?._id) {
    return null;
  }

  const profileText = buildProfileText(organizationDoc);
  const seedKeywords = getSeedKeywords(organizationDoc);
  const profileSignature = buildProfileSignature(profileText, seedKeywords);

  const existing = await OrganizationKeywordBank.findOne({ organization: organizationDoc._id }).lean();
  if (
    !force &&
    existing?.profileSignature === profileSignature &&
    Array.isArray(existing?.finalKeywords) &&
    existing.finalKeywords.length > 0
  ) {
    await Organization.updateOne(
      { _id: organizationDoc._id },
      {
        $set: {
          seedKeywords,
          keywords: existing.finalKeywords,
        },
      }
    );
    return toLeanBankView(existing);
  }

  const baselineKeywords = buildStaticBaseline(organizationDoc);

  let generatedKeywords = [];
  let expandedKeywords = [];
  let provider = "fallback";
  let model = "";
  let fallbackUsed = true;
  let lastError = "";

  if (allowGemini && isGeminiConfigured()) {
    try {
      const keywordDraft = await generateGeminiKeywordDraft({
        orgName: organizationDoc.orgName,
        sector: organizationDoc.sector,
        domain: organizationDoc.domain,
        description: organizationDoc.description,
        userKeywords: seedKeywords,
      });

      generatedKeywords = flattenGeminiDraft(keywordDraft);
      expandedKeywords = buildExpandedVariants(generatedKeywords);
      provider = "gemini";
      model = getGeminiModel();
      fallbackUsed = false;
    } catch (error) {
      lastError = String(error?.message ?? error);
      generatedKeywords = [];
      expandedKeywords = [];
    }
  }

  if (generatedKeywords.length === 0) {
    generatedKeywords = buildFallbackKeywordDraft(organizationDoc);
  }

  if (expandedKeywords.length === 0) {
    expandedKeywords = buildExpandedVariants(generatedKeywords);
  }

  const candidateKeywords = uniqueKeywords([
    ...generatedKeywords,
    ...expandedKeywords,
    ...seedKeywords,
  ]).slice(0, ORG_KEYWORD_MAX_CANDIDATES);

  const scoredCandidates = await scoreKeywordCandidates(profileText, candidateKeywords);
  const finalKeywords = mergeFinalKeywords({
    baselineKeywords,
    scoredCandidates,
    fallbackCandidates: buildFallbackKeywordDraft(organizationDoc),
  });

  const embeddingScores = scoredCandidates
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, 30)
    .map((entry) => ({ keyword: entry.keyword, similarity: Number(entry.similarity.toFixed(4)) }));

  const updated = await OrganizationKeywordBank.findOneAndUpdate(
    { organization: organizationDoc._id },
    {
      $set: {
        profileText,
        profileSignature,
        baselineKeywords,
        generatedKeywords,
        expandedKeywords,
        finalKeywords,
        embeddingScores,
        provider,
        model,
        fallbackUsed,
        generatedAt: new Date(),
        lastError,
      },
    },
    {
      upsert: true,
      setDefaultsOnInsert: true,
      returnDocument: "after",
    }
  ).lean();

  await Organization.updateOne(
    { _id: organizationDoc._id },
    {
      $set: {
        seedKeywords,
        keywords: finalKeywords,
      },
    }
  );

  return toLeanBankView(updated);
}

async function ensureKeywordBankMap(organizations, options = {}) {
  const ids = organizations.map((org) => org._id);
  const existingBanks = await OrganizationKeywordBank.find({ organization: { $in: ids } }).lean();
  const map = new Map(existingBanks.map((bank) => [String(bank.organization), bank]));

  for (const organization of organizations) {
    const profileText = buildProfileText(organization);
    const signature = buildProfileSignature(profileText, getSeedKeywords(organization));
    const current = map.get(String(organization._id));

    const stale =
      !current ||
      current.profileSignature !== signature ||
      !Array.isArray(current.finalKeywords) ||
      current.finalKeywords.length === 0;

    if (!stale) {
      continue;
    }

    try {
      const refreshed = await refreshOrganizationKeywordBank(organization, {
        force: true,
        allowGemini: options.allowGemini ?? false,
      });
      if (refreshed) {
        map.set(String(organization._id), {
          organization: organization._id,
          profileSignature: refreshed.profileSignature,
          finalKeywords: refreshed.finalKeywords,
          generatedAt: refreshed.generatedAt,
        });
      }
    } catch {
      // Keep pipeline resilient: one bad org profile should not block global scrape.
    }
  }

  return map;
}

export async function getDynamicRedditQueries() {
  const baselineQueries = uniqueKeywords(redditQueries);
  const organizations = await Organization.find({})
    .select("_id orgName sector domain description seedKeywords keywords")
    .lean();

  if (organizations.length === 0) {
    return {
      queries: baselineQueries.slice(0, REDDIT_QUERY_MAX_PER_CYCLE),
      metadata: {
        baselineCount: baselineQueries.length,
        dynamicCount: 0,
        organizationCount: 0,
      },
    };
  }

  const keywordBankMap = await ensureKeywordBankMap(organizations, { allowGemini: false });
  const querySet = new Set(baselineQueries);
  let dynamicCount = 0;

  for (const organization of organizations) {
    if (querySet.size >= REDDIT_QUERY_MAX_PER_CYCLE) {
      break;
    }

    const bank = keywordBankMap.get(String(organization._id));
    const perOrgKeywords = uniqueKeywords([
      ...getSeedKeywords(organization),
      ...(Array.isArray(bank?.finalKeywords) ? bank.finalKeywords : []),
    ]).slice(0, ORG_QUERY_MAX_PER_ORG);

    for (const keyword of perOrgKeywords) {
      if (querySet.size >= REDDIT_QUERY_MAX_PER_CYCLE) {
        break;
      }

      if (!querySet.has(keyword)) {
        dynamicCount += 1;
      }
      querySet.add(keyword);
    }
  }

  return {
    queries: Array.from(querySet).slice(0, REDDIT_QUERY_MAX_PER_CYCLE),
    metadata: {
      baselineCount: baselineQueries.length,
      dynamicCount,
      organizationCount: organizations.length,
    },
  };
}

function buildOrganizationProfileText(organization, bankKeywords) {
  const seedKeywords = getSeedKeywords(organization);

  return [
    String(organization.orgName ?? ""),
    String(organization.sector ?? ""),
    String(organization.domain ?? ""),
    String(organization.description ?? ""),
    ...seedKeywords,
    ...bankKeywords.slice(0, 25),
  ]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(" | ")
    .slice(0, 2000);
}

function buildMentionText(organization, bankKeywords) {
  const seedKeywords = getSeedKeywords(organization);

  return [
    String(organization.orgName ?? ""),
    String(organization.domain ?? ""),
    ...seedKeywords,
    ...bankKeywords,
  ]
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ");
}

export async function loadOrganizationRelevanceProfiles() {
  const organizations = await Organization.find({})
    .select("_id orgName sector domain description seedKeywords keywords")
    .lean();

  if (organizations.length === 0) {
    return [];
  }

  const keywordBankMap = await ensureKeywordBankMap(organizations, { allowGemini: false });

  return organizations.map((organization) => {
    const bankKeywords = uniqueKeywords(keywordBankMap.get(String(organization._id))?.finalKeywords ?? []);

    return {
      organizationId: organization._id,
      sector: String(organization.sector ?? ""),
      sectorLower: String(organization.sector ?? "").trim().toLowerCase(),
      mentionText: buildMentionText(organization, bankKeywords),
      profileText: buildOrganizationProfileText(organization, bankKeywords),
    };
  });
}

export async function rankOrganizationsByEmbedding(postText, profiles, options = {}) {
  const minSimilarity = Number(options?.minSimilarity ?? ORG_EMBEDDING_MIN_SIMILARITY);
  const maxMatches = Math.max(1, Number(options?.maxMatches ?? ORG_EMBEDDING_MAX_MATCHES));

  if (!isHuggingFaceConfigured() || !Array.isArray(profiles) || profiles.length === 0) {
    return [];
  }

  const candidateSentences = profiles.map((entry) => entry.profileText);
  const similarities = await getMiniLMContextSimilarities(postText, candidateSentences);

  return profiles
    .map((profile, index) => ({
      organizationId: profile.organizationId,
      similarity: Number.isFinite(Number(similarities[index])) ? Number(similarities[index]) : 0,
    }))
    .filter((entry) => entry.similarity >= minSimilarity)
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, maxMatches);
}
