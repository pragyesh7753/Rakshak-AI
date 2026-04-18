import mongoose from "mongoose";
import { DomainActivity } from "../models/DomainActivity.js";
import { Organization } from "../models/Organization.js";
import { SimilarDomain } from "../models/SimilarDomain.js";
import { mapDomain, mapDomainActivity } from "../shared/mappers/entityMappers.js";
import { getUserId } from "../shared/auth/clerkAuth.js";
import { DomainIntelligenceAlert } from "../features/domain-intelligence/models/DomainIntelligenceAlert.js";
import { DomainIntelligenceDomain } from "../features/domain-intelligence/models/DomainIntelligenceDomain.js";

const FLAG_DESCRIPTIONS = {
  typosquatting: "Potential typosquatting pattern detected",
  keyword_attack: "Suspicious keyword-based lookalike detected",
  new_domain: "Recently registered domain identified",
  social_spread: "Suspicious social chatter includes this domain",
  active_phishing: "Potential active phishing indicators detected",
};

async function resolveOrganization(userId) {
  return Organization.findOne({ clerkUserId: userId }).select("_id").lean();
}

function toIsoDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().split("T")[0];
}

function toTimestamp(value) {
  if (!value) {
    return 0;
  }

  const date = new Date(value);
  const timestamp = date.getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function normalizeSeverity(value) {
  const lowered = String(value ?? "low").toLowerCase();
  if (lowered === "high" || lowered === "medium") {
    return lowered;
  }
  return "low";
}

function normalizeLimit(value, fallback = 20, max = 100) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(Math.floor(parsed), 1), max);
}

function mapDomainIntelligenceDomain(domainDoc) {
  const crtMatches = Array.isArray(domainDoc?.sources?.crtMatches) ? domainDoc.sources.crtMatches : [];
  const registrationDate =
    domainDoc?.registeredAt ?? domainDoc?.sources?.whoisCreationDate ?? null;

  return {
    id: String(domainDoc._id),
    domain_name: String(domainDoc?.domain ?? ""),
    similarity_score: Number(domainDoc?.similarityScore ?? 0),
    registration_date: toIsoDate(registrationDate),
    domain_age_days:
      Number.isFinite(domainDoc?.domainAgeDays) && domainDoc.domainAgeDays >= 0
        ? Number(domainDoc.domainAgeDays)
        : null,
    ssl_detected: crtMatches.length > 0,
    status: "active",
    severity: normalizeSeverity(domainDoc?.severity),
    risk_score: Number(domainDoc?.riskScore ?? 0),
  };
}

function mapAlertAsActivity(alertDoc) {
  if (!alertDoc) {
    return null;
  }

  const severity = normalizeSeverity(alertDoc?.severity);
  return {
    id: String(alertDoc._id),
    activity_type: "Domain Alert",
    description: String(alertDoc?.message ?? "Suspicious domain behavior detected"),
    severity,
    is_suspicious: severity !== "low",
    detected_at: alertDoc?.createdAt ?? alertDoc?.lastEvaluatedAt ?? null,
  };
}

function mapFlagAsActivity(flag, domainDoc, index) {
  const key = String(flag ?? "").trim();
  if (!key) {
    return null;
  }

  return {
    id: `${String(domainDoc._id)}-flag-${index}`,
    activity_type: "Risk Signal",
    description: FLAG_DESCRIPTIONS[key] ?? `Risk signal: ${key.replaceAll("_", " ")}`,
    severity: normalizeSeverity(domainDoc?.severity),
    is_suspicious: true,
    detected_at: domainDoc?.lastCheckedAt ?? domainDoc?.updatedAt ?? domainDoc?.createdAt ?? null,
  };
}

function mapSamplePostAsActivity(post, domainDoc, index) {
  const classification = String(post?.classification ?? "neutral").toLowerCase();
  const isSuspicious = ["phishing", "malicious", "suspicious"].includes(classification);
  const severity =
    classification === "phishing" || classification === "malicious"
      ? "high"
      : isSuspicious
        ? "medium"
        : "low";

  const title = String(post?.title ?? "").trim();
  const url = String(post?.url ?? "").trim();
  const descriptionParts = [];

  if (title) {
    descriptionParts.push(title);
  }
  if (url) {
    descriptionParts.push(url);
  }

  return {
    id: `${String(domainDoc._id)}-post-${index}`,
    activity_type: "Social Signal",
    description: descriptionParts.join(" | ") || "Suspicious social mention detected",
    severity,
    is_suspicious: isSuspicious,
    detected_at: post?.timestamp ?? domainDoc?.lastCheckedAt ?? domainDoc?.updatedAt ?? null,
  };
}

function buildDomainIntelligenceActivities(domainDoc, alertDoc) {
  const activities = [];

  const alertActivity = mapAlertAsActivity(alertDoc);
  if (alertActivity) {
    activities.push(alertActivity);
  }

  const flags = Array.isArray(domainDoc?.flags) ? domainDoc.flags : [];
  for (let index = 0; index < flags.length; index += 1) {
    const activity = mapFlagAsActivity(flags[index], domainDoc, index);
    if (activity) {
      activities.push(activity);
    }
  }

  const samplePosts = Array.isArray(domainDoc?.sources?.samplePosts)
    ? domainDoc.sources.samplePosts
    : [];
  const postCount = Math.min(samplePosts.length, 5);
  for (let index = 0; index < postCount; index += 1) {
    activities.push(mapSamplePostAsActivity(samplePosts[index], domainDoc, index));
  }

  if (activities.length === 0) {
    activities.push({
      id: `${String(domainDoc._id)}-scan`,
      activity_type: "Domain Scan",
      description: `Domain intelligence scan completed for ${String(domainDoc?.domain ?? "domain")}`,
      severity: normalizeSeverity(domainDoc?.severity),
      is_suspicious: normalizeSeverity(domainDoc?.severity) !== "low",
      detected_at: domainDoc?.lastCheckedAt ?? domainDoc?.updatedAt ?? domainDoc?.createdAt ?? null,
    });
  }

  return activities.sort((left, right) => toTimestamp(right.detected_at) - toTimestamp(left.detected_at));
}

function mapAlertAsGlobalActivity(alertDoc) {
  const severity = normalizeSeverity(alertDoc?.severity);
  const domainName = String(alertDoc?.domainId?.domain ?? "unknown");

  return {
    id: String(alertDoc._id),
    activity_type: "Domain Alert",
    description: String(alertDoc?.message ?? `Suspicious domain detected: ${domainName}`),
    severity,
    is_suspicious: severity !== "low",
    detected_at: alertDoc?.createdAt ?? alertDoc?.lastEvaluatedAt ?? null,
    domain_name: domainName,
  };
}

export async function getSimilarDomains(req, res) {
  try {
    const userId = getUserId(req);
    const organization = await resolveOrganization(userId);

    if (!organization) {
      return res.json([]);
    }

    const modernDomains = await DomainIntelligenceDomain.find({ orgId: organization._id })
      .sort({ riskScore: -1, similarityScore: -1, updatedAt: -1 })
      .lean();

    if (modernDomains.length > 0) {
      return res.json(modernDomains.map((domain) => mapDomainIntelligenceDomain(domain)));
    }

    const domains = await SimilarDomain.find({ organization: organization._id })
      .sort({ similarityScore: -1 })
      .lean();

    res.json(domains.map((domain) => mapDomain(domain)));
  } catch (error) {
    console.error("[domains.controller] getSimilarDomains:", error);
    res.status(500).json({ error: "Failed to fetch similar domains" });
  }
}

export async function getDomainActivities(req, res) {
  try {
    const userId = getUserId(req);
    const organization = await resolveOrganization(userId);

    if (!organization) {
      return res.json([]);
    }

    const { domainId } = req.params;
    if (!mongoose.isValidObjectId(domainId)) {
      return res.status(400).json({ error: "Invalid domain id" });
    }

    const modernDomain = await DomainIntelligenceDomain.findOne({
      _id: domainId,
      orgId: organization._id,
    }).lean();

    if (modernDomain) {
      const latestAlert = await DomainIntelligenceAlert.findOne({
        orgId: organization._id,
        domainId: modernDomain._id,
      })
        .sort({ createdAt: -1 })
        .lean();

      return res.json(buildDomainIntelligenceActivities(modernDomain, latestAlert));
    }

    const isDomainOwned = await SimilarDomain.findOne({
      _id: domainId,
      organization: organization._id,
    })
      .select("_id")
      .lean();

    if (!isDomainOwned) {
      return res.status(404).json({ error: "Domain not found" });
    }

    const activities = await DomainActivity.find({ domain: domainId })
      .sort({ detectedAt: -1 })
      .lean();

    res.json(activities.map((item) => mapDomainActivity(item)));
  } catch (error) {
    console.error("[domains.controller] getDomainActivities:", error);
    res.status(500).json({ error: "Failed to fetch domain activities" });
  }
}

export async function getGlobalDomainActivities(req, res) {
  try {
    const userId = getUserId(req);
    const organization = await resolveOrganization(userId);

    if (!organization) {
      return res.json([]);
    }

    const limit = normalizeLimit(req.query.limit ?? 20, 20, 100);

    const modernAlerts = await DomainIntelligenceAlert.find({ orgId: organization._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({ path: "domainId", select: "domain", options: { lean: true } })
      .lean();

    if (modernAlerts.length > 0) {
      return res.json(modernAlerts.map((item) => mapAlertAsGlobalActivity(item)));
    }

    const ownedDomains = await SimilarDomain.find({ organization: organization._id })
      .select("_id")
      .lean();
    const domainIds = ownedDomains.map((item) => item._id);

    if (domainIds.length === 0) {
      return res.json([]);
    }

    const activities = await DomainActivity.find({ domain: { $in: domainIds } })
      .sort({ detectedAt: -1 })
      .limit(limit)
      .populate({ path: "domain", select: "domainName", options: { lean: true } })
      .lean();

    res.json(
      activities.map((item) => ({
        ...mapDomainActivity(item),
        domain_name: item.domain?.domainName ?? "unknown",
      }))
    );
  } catch (error) {
    console.error("[domains.controller] getGlobalDomainActivities:", error);
    res.status(500).json({ error: "Failed to fetch global domain activities" });
  }
}