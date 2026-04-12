import { SecurityThreatLog } from "../models/SecurityThreatLog.js";

const fallbackStatus = {
  status: "Warning",
  score: 84,
  metrics: {
    activeThreats: 12,
    blockedIPs: 154,
    failedLogins: 423,
    apiAnomalies: 5,
  },
  trafficTrend: [
    { time: "00:00", value: 45 },
    { time: "04:00", value: 30 },
    { time: "08:00", value: 85 },
    { time: "12:00", value: 120 },
    { time: "16:00", value: 160 },
    { time: "20:00", value: 95 },
    { time: "23:59", value: 70 },
  ],
  suspiciousIPs: [
    { ip: "192.168.1.105", attempts: 45, location: "Russia", risk: "High" },
    { ip: "45.12.33.10", attempts: 23, location: "China", risk: "Medium" },
    { ip: "103.25.11.2", attempts: 120, location: "India", risk: "Critical" },
    { ip: "88.16.0.4", attempts: 12, location: "Germany", risk: "Low" },
  ],
};

const fallbackLogs = [
  {
    id: "sl1",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    ip: "103.25.11.2",
    type: "SQL Injection",
    resource: "/api/v1/users",
    risk: "Critical",
    status: "Active",
  },
  {
    id: "sl2",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    ip: "192.168.1.105",
    type: "Brute Force",
    resource: "/login",
    risk: "High",
    status: "Blocked",
  },
];

export async function getSystemSecurityStatus(_req, res) {
  try {
    const [critical, high, total] = await Promise.all([
      SecurityThreatLog.countDocuments({ risk: "Critical" }),
      SecurityThreatLog.countDocuments({ risk: "High" }),
      SecurityThreatLog.countDocuments({ status: "Active" }),
    ]);

    if (critical === 0 && high === 0 && total === 0) {
      return res.json(fallbackStatus);
    }

    const score = Math.max(10, 100 - critical * 6 - high * 3);
    const status = critical > 5 ? "Critical" : high > 3 ? "Warning" : "Safe";

    res.json({
      ...fallbackStatus,
      status,
      score,
      metrics: {
        ...fallbackStatus.metrics,
        activeThreats: total,
      },
    });
  } catch (error) {
    console.error("[monitoring.controller] getSystemSecurityStatus:", error);
    res.status(500).json({ error: "Failed to fetch security status" });
  }
}

export async function getSecurityThreatLogs(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit ?? 20), 100);

    const logs = await SecurityThreatLog.find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    if (logs.length === 0) {
      return res.json(fallbackLogs);
    }

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