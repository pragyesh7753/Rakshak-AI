import {
  DOMAIN_INTELLIGENCE_MAX_CANDIDATES_PER_ORG,
} from "../config/domainIntelligence.config.js";
import { DomainIntelligenceAlert } from "../models/DomainIntelligenceAlert.js";
import { DomainIntelligenceDomain } from "../models/DomainIntelligenceDomain.js";
import { generateDomains } from "./domainGeneration.service.js";
import { monitorDomain } from "./domainMonitoring.service.js";
import { getOrganizationsForDomainIntelligence } from "./organizationDomainSource.service.js";
import { calculateRisk } from "./riskScoring.service.js";
import { scanSocialMedia } from "./socialCorrelation.service.js";
import { normalizeDomain } from "../utils/domainNormalization.js";

function toConcurrency(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.min(10, Math.floor(parsed));
}

async function runWithConcurrency(items, concurrency, handler) {
  if (!Array.isArray(items) || items.length === 0) {
    return;
  }

  const queue = [...items];
  const workerCount = Math.max(1, Math.min(concurrency, queue.length));

  const workers = Array.from({ length: workerCount }, async () => {
    while (queue.length > 0) {
      const current = queue.shift();
      if (typeof current === "undefined") {
        break;
      }
      await handler(current);
    }
  });

  await Promise.all(workers);
}

function buildAlertMessage({ organizationName, domain, risk }) {
  const readableOrgName = String(organizationName ?? "organization").trim() || "organization";
  const riskScore = Number(risk?.score ?? 0);
  const flags = Array.isArray(risk?.flags) ? risk.flags : [];

  if (flags.length > 0) {
    return `High-risk suspicious domain detected for ${readableOrgName}: ${domain} (score ${riskScore}) [${flags.join(
      ", "
    )}]`;
  }

  return `High-risk suspicious domain detected for ${readableOrgName}: ${domain} (score ${riskScore})`;
}

function mapSamplePosts(samplePosts) {
  return (Array.isArray(samplePosts) ? samplePosts : []).map((post) => ({
    postId: String(post?.postId ?? ""),
    title: String(post?.title ?? "").slice(0, 240),
    url: String(post?.url ?? ""),
    classification: String(post?.classification ?? "neutral"),
    timestamp: post?.timestamp ?? null,
  }));
}

async function upsertDetectedDomain({
  organization,
  domain,
  monitorResult,
  socialResult,
  risk,
}) {
  return DomainIntelligenceDomain.findOneAndUpdate(
    { orgId: organization.id, domain },
    {
      $set: {
        domain,
        orgId: organization.id,
        riskScore: risk.score,
        severity: risk.severity,
        flags: risk.flags,
        similarityScore: risk.similarity,
        domainAgeDays: risk.domainAgeDays,
        registeredAt: monitorResult.registeredAt,
        sources: {
          whoisExists: Boolean(monitorResult?.whois?.exists),
          whoisCreationDate: monitorResult?.whois?.creationDate ?? null,
          crtMatches: (monitorResult?.crt?.entries ?? []).map((entry) => ({
            domain: String(entry?.domain ?? ""),
            timestamp: entry?.timestamp ?? null,
          })),
          socialMentions: Number(socialResult?.mentions ?? 0),
          phishingPosts: Number(socialResult?.phishingPosts ?? 0),
          samplePosts: mapSamplePosts(socialResult?.samplePosts),
        },
        lastCheckedAt: new Date(),
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    }
  );
}

async function upsertHighRiskAlert({ organization, domainRecord, risk }) {
  const existingAlert = await DomainIntelligenceAlert.findOne({
    domainId: domainRecord._id,
  })
    .select("_id")
    .lean();

  await DomainIntelligenceAlert.findOneAndUpdate(
    { domainId: domainRecord._id },
    {
      $set: {
        orgId: organization.id,
        domainId: domainRecord._id,
        severity: risk.severity,
        riskScore: risk.score,
        flags: risk.flags,
        message: buildAlertMessage({
          organizationName: organization.name,
          domain: domainRecord.domain,
          risk,
        }),
        lastEvaluatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    }
  );

  return !existingAlert;
}

async function processCandidate(organization, candidateDomain) {
  const monitorResult = await monitorDomain(candidateDomain);
  if (!monitorResult.exists) {
    return {
      detected: false,
      highRisk: false,
      alertCreated: false,
      risk: null,
    };
  }

  const socialResult = await scanSocialMedia(candidateDomain);

  const risk = calculateRisk({
    domain: candidateDomain,
    organizationDomain: organization.domain,
    keywords: organization.keywords,
    registeredAt: monitorResult.registeredAt,
    social: socialResult,
  });

  const domainRecord = await upsertDetectedDomain({
    organization,
    domain: candidateDomain,
    monitorResult,
    socialResult,
    risk,
  });

  let alertCreated = false;
  if (risk.severity === "high") {
    alertCreated = await upsertHighRiskAlert({
      organization,
      domainRecord,
      risk,
    });
  }

  return {
    detected: true,
    highRisk: risk.severity === "high",
    alertCreated,
    risk,
  };
}

export async function runDomainIntelligenceCycle(options = {}) {
  const trigger = String(options.trigger ?? "manual");
  const startedAt = new Date();
  const organizations = await getOrganizationsForDomainIntelligence();

  const summary = {
    trigger,
    startedAt,
    finishedAt: null,
    organizations: organizations.length,
    organizationIds: organizations.map((org) => org.id),
    organizationSummaries: [],
    generatedCandidates: 0,
    processedCandidates: 0,
    detectedDomains: 0,
    highRiskDomains: 0,
    alertsCreated: 0,
    errors: 0,
  };

  if (organizations.length === 0) {
    summary.finishedAt = new Date();
    return summary;
  }

  const maxCandidatesPerOrg = Math.max(10, DOMAIN_INTELLIGENCE_MAX_CANDIDATES_PER_ORG);
  const perOrgConcurrency = toConcurrency(process.env.DOMAIN_INTELLIGENCE_CONCURRENCY, 3);

  for (const organization of organizations) {
    const baseDomain = normalizeDomain(organization.domain);
    if (!baseDomain) {
      continue;
    }

    const generated = generateDomains(baseDomain, organization.keywords);
    const candidates = generated
      .filter((candidate) => candidate !== baseDomain)
      .slice(0, maxCandidatesPerOrg);

    const organizationSummary = {
      organizationId: organization.id,
      organizationName: organization.name,
      domain: organization.domain,
      generatedCandidates: candidates.length,
      processedCandidates: 0,
      detectedDomains: 0,
      highRiskDomains: 0,
      alertsCreated: 0,
      errors: 0,
    };
    summary.organizationSummaries.push(organizationSummary);

    summary.generatedCandidates += candidates.length;

    await runWithConcurrency(candidates, perOrgConcurrency, async (candidateDomain) => {
      summary.processedCandidates += 1;
      organizationSummary.processedCandidates += 1;

      try {
        const result = await processCandidate(organization, candidateDomain);
        if (result.detected) {
          summary.detectedDomains += 1;
          organizationSummary.detectedDomains += 1;
        }
        if (result.highRisk) {
          summary.highRiskDomains += 1;
          organizationSummary.highRiskDomains += 1;
        }
        if (result.alertCreated) {
          summary.alertsCreated += 1;
          organizationSummary.alertsCreated += 1;
        }
      } catch (error) {
        summary.errors += 1;
        organizationSummary.errors += 1;
        console.error(
          `[domain-intelligence] candidate processing failed for ${candidateDomain}:`,
          error
        );
      }
    });
  }

  summary.finishedAt = new Date();
  return summary;
}
