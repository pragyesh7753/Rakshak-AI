import { DomainIntelligenceAlert } from "../models/DomainIntelligenceAlert.js";

function normalizeLimit(limit) {
  return Math.min(Math.max(Number(limit) || 20, 1), 200);
}

export async function fetchDomainIntelligenceAlertRecords({
  organizationId,
  limit = 100,
}) {
  if (!organizationId) {
    return [];
  }

  const safeLimit = normalizeLimit(limit);

  return DomainIntelligenceAlert.find({ orgId: organizationId })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .populate({
      path: "domainId",
      select: "domain riskScore severity",
      options: { lean: true },
    })
    .lean();
}

export async function listDomainIntelligenceAlerts({
  organizationId,
  limit = 100,
}) {
  const alerts = await fetchDomainIntelligenceAlertRecords({
    organizationId,
    limit,
  });

  return alerts.map((alert) => ({
    domain: String(alert?.domainId?.domain ?? ""),
    riskScore: Number(alert?.riskScore ?? alert?.domainId?.riskScore ?? 0),
    severity: String(alert?.severity ?? alert?.domainId?.severity ?? "low"),
    message: String(alert?.message ?? ""),
    timestamp: alert?.createdAt ?? null,
  }));
}
