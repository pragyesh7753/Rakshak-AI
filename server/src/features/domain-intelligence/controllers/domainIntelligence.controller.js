import { Organization } from "../../../models/Organization.js";
import { getUserId } from "../../../shared/auth/clerkAuth.js";
import {
  isDomainIntelligenceRunning,
  triggerDomainIntelligenceRun,
} from "../jobs/runDomainIntelligence.js";
import { listDomainIntelligenceAlerts } from "../services/domainAlertQuery.service.js";

async function resolveOrganizationId(userId) {
  const organization = await Organization.findOne({ clerkUserId: userId })
    .select("_id")
    .lean();

  return organization?._id ?? null;
}

export async function getDomainIntelligenceAlerts(req, res) {
  try {
    const userId = getUserId(req);
    const organizationId = await resolveOrganizationId(userId);

    if (!organizationId) {
      return res.json([]);
    }

    const limit = Number(req.query.limit ?? 100);
    const alerts = await listDomainIntelligenceAlerts({
      organizationId,
      limit,
    });

    return res.json(alerts);
  } catch (error) {
    console.error("[domain-intelligence.controller] getDomainIntelligenceAlerts:", error);
    return res.status(500).json({ error: "Failed to fetch domain intelligence alerts" });
  }
}

export async function triggerDomainIntelligence(req, res) {
  try {
    const started = triggerDomainIntelligenceRun("manual-api");

    if (!started) {
      return res.status(409).json({
        started: false,
        domain_intelligence_running: true,
        message: "Domain intelligence job is already running",
      });
    }

    return res.status(202).json({
      started: true,
      domain_intelligence_running: true,
      message: "Domain intelligence job started",
      triggered_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[domain-intelligence.controller] triggerDomainIntelligence:", error);
    return res.status(500).json({
      started: false,
      domain_intelligence_running: isDomainIntelligenceRunning(),
      error: "Failed to start domain intelligence job",
    });
  }
}
