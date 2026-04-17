import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectMongo } from "../../../shared/config/mongodb.js";
import { ProcessingLog } from "../../../models/ProcessingLog.js";
import { runDomainIntelligenceCycle } from "../services/domainIntelligenceEngine.service.js";
import { getOrganizationsForDomainIntelligence } from "../services/organizationDomainSource.service.js";

let domainIntelligenceRunning = false;

async function writeProcessingLog(status, message, options = {}) {
  const organizationId = options?.organizationId ?? null;

  try {
    await ProcessingLog.create({
      organization: organizationId,
      jobType: "domain-intelligence",
      status,
      message,
    });
  } catch (error) {
    console.error("[domain-intelligence] processing log failed:", error);
  }
}

function buildSummaryMessage(summary) {
  return [
    `trigger=${summary.trigger}`,
    `orgs=${summary.organizations}`,
    `candidates=${summary.processedCandidates}/${summary.generatedCandidates}`,
    `detected=${summary.detectedDomains}`,
    `highRisk=${summary.highRiskDomains}`,
    `alertsCreated=${summary.alertsCreated}`,
    `errors=${summary.errors}`,
  ].join(" | ");
}

function buildOrganizationSummaryMessage(summary, organizationSummary) {
  const organizationLabel =
    String(
      organizationSummary?.organizationName ??
        organizationSummary?.domain ??
        organizationSummary?.organizationId ??
        "unknown-organization"
    ).trim() || "unknown-organization";

  return [
    `trigger=${summary.trigger}`,
    `org=${organizationLabel}`,
    `candidates=${organizationSummary?.processedCandidates ?? 0}/${organizationSummary?.generatedCandidates ?? 0}`,
    `detected=${organizationSummary?.detectedDomains ?? 0}`,
    `highRisk=${organizationSummary?.highRiskDomains ?? 0}`,
    `alertsCreated=${organizationSummary?.alertsCreated ?? 0}`,
    `errors=${organizationSummary?.errors ?? 0}`,
  ].join(" | ");
}

function organizationLabel(organization) {
  return String(organization?.name ?? organization?.domain ?? organization?.id ?? "unknown-organization").trim();
}

export function isDomainIntelligenceRunning() {
  return domainIntelligenceRunning;
}

export function triggerDomainIntelligenceRun(trigger = "manual") {
  if (domainIntelligenceRunning) {
    return false;
  }

  domainIntelligenceRunning = true;

  (async () => {
    let scopedOrganizations = [];

    try {
      scopedOrganizations = await getOrganizationsForDomainIntelligence();

      if (scopedOrganizations.length === 0) {
        await writeProcessingLog("running", `Domain intelligence started (${trigger})`);
      } else {
        await Promise.all(
          scopedOrganizations.map((organization) =>
            writeProcessingLog(
              "running",
              `Domain intelligence started (${trigger}) | org=${organizationLabel(organization)}`,
              { organizationId: organization.id }
            )
          )
        );
      }

      console.log(`[domain-intelligence] started (${trigger})`);

      const summary = await runDomainIntelligenceCycle({ trigger });
      const summaryMessage = buildSummaryMessage(summary);

      if (Array.isArray(summary?.organizationSummaries) && summary.organizationSummaries.length > 0) {
        await Promise.all(
          summary.organizationSummaries.map((organizationSummary) =>
            writeProcessingLog(
              "success",
              buildOrganizationSummaryMessage(summary, organizationSummary),
              { organizationId: organizationSummary.organizationId }
            )
          )
        );
      } else if (Array.isArray(summary?.organizationIds) && summary.organizationIds.length > 0) {
        await Promise.all(
          summary.organizationIds.map((organizationId) =>
            writeProcessingLog("success", summaryMessage, { organizationId })
          )
        );
      } else {
        await writeProcessingLog("success", summaryMessage);
      }
      console.log(`[domain-intelligence] completed (${trigger}) ${summaryMessage}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (scopedOrganizations.length === 0) {
        await writeProcessingLog("failed", `Domain intelligence failed (${trigger}): ${errorMessage}`);
      } else {
        await Promise.all(
          scopedOrganizations.map((organization) =>
            writeProcessingLog(
              "failed",
              `Domain intelligence failed (${trigger}) | org=${organizationLabel(organization)} | error=${errorMessage}`,
              { organizationId: organization.id }
            )
          )
        );
      }

      console.error(`[domain-intelligence] failed (${trigger})`, error);
    } finally {
      domainIntelligenceRunning = false;
    }
  })();

  return true;
}

export async function runDomainIntelligence() {
  return runDomainIntelligenceCycle({ trigger: "direct" });
}

const isDirectRun =
  typeof process.argv[1] === "string" &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  connectMongo()
    .then(async () => {
      const summary = await runDomainIntelligence();
      console.log("Domain intelligence completed", buildSummaryMessage(summary));
      process.exit(0);
    })
    .catch((error) => {
      console.error("Domain intelligence failed", error);
      process.exit(1);
    });
}
