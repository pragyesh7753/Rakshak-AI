import mongoose from "mongoose";
import {
  fetchDomainIntelligenceAlertRecords,
  listDomainIntelligenceAlerts,
} from "../features/domain-intelligence/services/domainAlertQuery.service.js";
import { Alert } from "../models/Alert.js";
import { Organization } from "../models/Organization.js";
import { mapAlert } from "../shared/mappers/entityMappers.js";
import { getUserId } from "../shared/auth/clerkAuth.js";

async function resolveOrganizationId(userId) {
  const organization = await Organization.findOne({ clerkUserId: userId }).select("_id").lean();
  return organization?._id ?? null;
}

function normalizeScope(query) {
  return String(query?.scope ?? query?.type ?? "threat")
    .trim()
    .toLowerCase();
}

function isDomainAlertScope(query) {
  const scope = normalizeScope(query);

  return scope === "domain" || scope === "domain-intelligence" || scope === "domain_intelligence";
}

function isCombinedAlertScope(query) {
  const scope = normalizeScope(query);

  return scope === "all" || scope === "combined" || scope === "unified";
}

function normalizeLimit(value, fallback = 100) {
  const numeric = Number(value ?? fallback);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback;
  }

  return Math.min(Math.floor(numeric), 200);
}

function normalizeTimestamp(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return 0;
  }
  return date.getTime();
}

function normalizeThreatSeverity(alertDoc) {
  const priority = String(alertDoc?.priority ?? alertDoc?.threat?.priority ?? "").toLowerCase();
  if (priority === "critical" || priority === "high") {
    return "high";
  }
  if (priority === "medium") {
    return "medium";
  }

  const severityScore = Number(alertDoc?.threat?.severityScore ?? 0);
  if (severityScore >= 7) return "high";
  if (severityScore >= 4) return "medium";
  return "low";
}

function mapThreatAlertForUnified(alertDoc) {
  const threat = alertDoc?.threat;
  const severityScore = Number(threat?.severityScore ?? 0);
  const normalizedRiskScore = Math.max(0, Math.min(100, Math.round(severityScore * 10)));
  const threatType = String(threat?.threatType ?? "Potential cyber threat");

  return {
    id: `threat:${String(alertDoc?._id ?? "")}`,
    type: "threat",
    source: "post-analysis",
    title: threatType,
    message:
      String(alertDoc?.routeReason ?? "").trim() ||
      `Threat alert detected for ${String(threat?.sector ?? "unknown sector")}`,
    severity: normalizeThreatSeverity(alertDoc),
    risk_score: normalizedRiskScore,
    is_read: Boolean(alertDoc?.isRead),
    timestamp: alertDoc?.createdAt ?? null,
    details: {
      alert_id: String(alertDoc?._id ?? ""),
      threat_id: String(threat?._id ?? ""),
      threat_type: threatType,
      sector: String(threat?.sector ?? ""),
      priority: String(alertDoc?.priority ?? threat?.priority ?? "medium"),
      route_channel: String(alertDoc?.routeChannel ?? "dashboard-digest"),
    },
  };
}

function mapDomainAlertForUnified(alertDoc) {
  const severity = String(alertDoc?.severity ?? alertDoc?.domainId?.severity ?? "low").toLowerCase();
  const domain = String(alertDoc?.domainId?.domain ?? "");

  return {
    id: `domain:${String(alertDoc?._id ?? "")}`,
    type: "domain",
    source: "domain-intelligence",
    title: domain || "Suspicious domain detected",
    message: String(alertDoc?.message ?? ""),
    severity: ["low", "medium", "high"].includes(severity) ? severity : "low",
    risk_score: Math.max(
      0,
      Math.min(100, Math.round(Number(alertDoc?.riskScore ?? alertDoc?.domainId?.riskScore ?? 0)))
    ),
    is_read: false,
    timestamp: alertDoc?.createdAt ?? null,
    details: {
      alert_id: String(alertDoc?._id ?? ""),
      domain_id: String(alertDoc?.domainId?._id ?? ""),
      domain,
      flags: Array.isArray(alertDoc?.flags) ? alertDoc.flags : [],
    },
  };
}

function sortAlertsByTimestampDesc(left, right) {
  return normalizeTimestamp(right?.timestamp) - normalizeTimestamp(left?.timestamp);
}

async function fetchThreatAlerts({ organizationId, limit }) {
  let query = Alert.find({ organization: organizationId })
    .sort({ createdAt: -1 })
    .populate({
      path: "threat",
      select: "threatType sector severityScore priority",
      options: { lean: true },
    });

  if (Number.isFinite(limit)) {
    query = query.limit(limit);
  }

  return query.lean();
}

export async function getAlerts(req, res) {
  try {
    const userId = getUserId(req);
    const organizationId = await resolveOrganizationId(userId);

    if (!organizationId) {
      return res.json([]);
    }

    const limit = normalizeLimit(req.query.limit, 100);

    if (isDomainAlertScope(req.query)) {
      const domainAlerts = await listDomainIntelligenceAlerts({
        organizationId,
        limit,
      });
      return res.json(domainAlerts);
    }

    if (isCombinedAlertScope(req.query)) {
      const [threatAlerts, domainAlerts] = await Promise.all([
        fetchThreatAlerts({ organizationId, limit }),
        fetchDomainIntelligenceAlertRecords({ organizationId, limit }),
      ]);

      const unifiedAlerts = [
        ...threatAlerts.map((item) => mapThreatAlertForUnified(item)),
        ...domainAlerts.map((item) => mapDomainAlertForUnified(item)),
      ]
        .sort(sortAlertsByTimestampDesc)
        .slice(0, limit);

      return res.json(unifiedAlerts);
    }

    const alerts = await fetchThreatAlerts({ organizationId });

    res.json(alerts.map((item) => mapAlert(item)));
  } catch (error) {
    console.error("[alerts.controller] getAlerts:", error);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
}

export async function markAlertAsRead(req, res) {
  try {
    const { alertId } = req.params;
    if (!mongoose.isValidObjectId(alertId)) {
      return res.status(400).json({ error: "Invalid alert id" });
    }

    const userId = getUserId(req);
    const organizationId = await resolveOrganizationId(userId);
    if (!organizationId) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const result = await Alert.updateOne(
      { _id: alertId, organization: organizationId },
      { $set: { isRead: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Alert not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("[alerts.controller] markAlertAsRead:", error);
    res.status(500).json({ error: "Failed to update alert" });
  }
}