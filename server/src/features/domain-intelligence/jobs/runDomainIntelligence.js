import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectMongo } from "../../../shared/config/mongodb.js";
import { ProcessingLog } from "../../../models/ProcessingLog.js";
import { runDomainIntelligenceCycle } from "../services/domainIntelligenceEngine.service.js";

let domainIntelligenceRunning = false;

async function writeProcessingLog(status, message) {
  try {
    await ProcessingLog.create({
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

export function isDomainIntelligenceRunning() {
  return domainIntelligenceRunning;
}

export function triggerDomainIntelligenceRun(trigger = "manual") {
  if (domainIntelligenceRunning) {
    return false;
  }

  domainIntelligenceRunning = true;

  (async () => {
    try {
      await writeProcessingLog("running", `Domain intelligence started (${trigger})`);
      console.log(`[domain-intelligence] started (${trigger})`);

      const summary = await runDomainIntelligenceCycle({ trigger });
      const summaryMessage = buildSummaryMessage(summary);

      await writeProcessingLog("success", summaryMessage);
      console.log(`[domain-intelligence] completed (${trigger}) ${summaryMessage}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await writeProcessingLog("failed", `Domain intelligence failed (${trigger}): ${errorMessage}`);
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
