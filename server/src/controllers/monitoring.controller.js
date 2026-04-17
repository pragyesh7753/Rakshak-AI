import { SecurityThreatLog } from "../models/SecurityThreatLog.js";
import { Organization } from "../models/Organization.js";
import { getUserId } from "../shared/auth/clerkAuth.js";

const TRAFFIC_MARKERS = [0, 4, 8, 12, 16, 20, 24];
const TRAFFIC_LABELS = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"];

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function riskWeight(risk) {
  const level = normalize(risk);
  if (level === "critical") return 4;
  if (level === "high") return 3;
  if (level === "medium") return 2;
  return 1;
}

function riskLabel(weight) {
  if (weight >= 4) return "Critical";
  if (weight >= 3) return "High";
  if (weight >= 2) return "Medium";
  return "Low";
}

async function resolveOrganizationId(req) {
  const userId = getUserId(req);
  const organization = await Organization.findOne({ clerkUserId: userId }).select("_id").lean();
  return organization?._id ?? null;
}

function buildTrafficTrend(logs) {
  const buckets = Array.from({ length: 7 }, () => 0);

  for (const item of logs) {
    const timestamp = new Date(item.timestamp);
    const hour = Number.isFinite(timestamp.getHours()) ? timestamp.getHours() : 0;

    for (let i = 0; i < TRAFFIC_MARKERS.length - 1; i += 1) {
      const start = TRAFFIC_MARKERS[i];
      const end = TRAFFIC_MARKERS[i + 1];
      if (hour >= start && hour < end) {
        buckets[i] += 1;
        break;
      }
    }
  }

  return TRAFFIC_LABELS.map((label, index) => ({ time: label, value: buckets[index] }));
}

function buildSuspiciousIps(logs) {
  const grouped = new Map();

  for (const item of logs) {
    const ip = String(item.ip ?? "").trim();
    if (!ip) continue;

    const existing = grouped.get(ip) ?? { attempts: 0, maxRiskWeight: 1 };
    existing.attempts += 1;
    existing.maxRiskWeight = Math.max(existing.maxRiskWeight, riskWeight(item.risk));
    grouped.set(ip, existing);
  }

  return Array.from(grouped.entries())
    .map(([ip, data]) => ({
      ip,
      attempts: data.attempts,
      location: "Unknown",
      risk: riskLabel(data.maxRiskWeight),
    }))
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 6);
}

export async function getSystemSecurityStatus(req, res) {
  try {
    const organizationId = await resolveOrganizationId(req);
    if (!organizationId) {
      return res.json({
        status: "Safe",
        score: 100,
        metrics: {
          activeThreats: 0,
          blockedIPs: 0,
          failedLogins: 0,
          apiAnomalies: 0,
        },
        trafficTrend: TRAFFIC_LABELS.map((time) => ({ time, value: 0 })),
        suspiciousIPs: [],
      });
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const logs = await SecurityThreatLog.find({ organization: organizationId, timestamp: { $gte: since } })
      .select("timestamp ip type resource risk status")
      .lean();

    const activeThreats = logs.filter((item) => normalize(item.status) === "active").length;
    const critical = logs.filter((item) => normalize(item.risk) === "critical").length;
    const high = logs.filter((item) => normalize(item.risk) === "high").length;
    const blockedIPs = new Set(
      logs
        .filter((item) => normalize(item.status) === "blocked")
        .map((item) => String(item.ip ?? "").trim())
        .filter(Boolean)
    ).size;

    const failedLogins = logs.filter((item) => {
      const type = normalize(item.type);
      return type.includes("failed login") || type.includes("brute force");
    }).length;

    const apiAnomalies = logs.filter((item) => {
      const type = normalize(item.type);
      const resource = normalize(item.resource);
      return type.includes("api") || resource.includes("/api");
    }).length;

    const score = Math.max(10, 100 - critical * 6 - high * 3);
    const status = critical > 5 ? "Critical" : high > 3 ? "Warning" : "Safe";

    res.json({
      status,
      score,
      metrics: {
        activeThreats,
        blockedIPs,
        failedLogins,
        apiAnomalies,
      },
      trafficTrend: buildTrafficTrend(logs),
      suspiciousIPs: buildSuspiciousIps(logs),
    });
  } catch (error) {
    console.error("[monitoring.controller] getSystemSecurityStatus:", error);
    res.status(500).json({ error: "Failed to fetch security status" });
  }
}

export async function getSecurityThreatLogs(req, res) {
  try {
    const organizationId = await resolveOrganizationId(req);
    if (!organizationId) {
      return res.json([]);
    }

    const limit = Math.min(Number(req.query.limit ?? 20), 100);

    const logs = await SecurityThreatLog.find({ organization: organizationId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    res.json(
      logs.map((item) => ({
        id: String(item._id),
        timestamp: item.timestamp,
        ip: item.ip,
        type: item.type,
        resource: item.resource,
        risk: item.risk,
        status: item.status,
      }))
    );
  } catch (error) {
    console.error("[monitoring.controller] getSecurityThreatLogs:", error);
    res.status(500).json({ error: "Failed to fetch security logs" });
  }
}