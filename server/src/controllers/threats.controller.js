import mongoose from "mongoose";
import { Alert } from "../models/Alert.js";
import { Organization } from "../models/Organization.js";
import { Threat } from "../models/Threat.js";
import { ThreatSource } from "../models/ThreatSource.js";
import { mapThreat } from "../shared/mappers/entityMappers.js";
import { getUserId } from "../shared/auth/clerkAuth.js";

async function resolveOrganizationId(userId) {
  const organization = await Organization.findOne({ clerkUserId: userId }).select("_id").lean();
  return organization?._id ?? null;
}

export async function getSummaryStats(req, res) {
  try {
    const userId = getUserId(req);
    const organizationId = await resolveOrganizationId(userId);

    if (!organizationId) {
      return res.json({ totalThreats: 0, highSeverity: 0, unreadAlerts: 0, activeSources: 0 });
    }

    const unreadFilter = { organization: organizationId, isRead: false };

    const [totalThreats, highSeverityRows, unreadAlerts, activeSources] = await Promise.all([
      Alert.countDocuments({ organization: organizationId }),
      Alert.aggregate([
        { $match: { organization: organizationId } },
        {
          $lookup: {
            from: Threat.collection.name,
            localField: "threat",
            foreignField: "_id",
            as: "threatDoc",
          },
        },
        { $unwind: "$threatDoc" },
        { $match: { "threatDoc.severityScore": { $gte: 7 } } },
        { $count: "count" },
      ]),
      Alert.countDocuments(unreadFilter),
      ThreatSource.countDocuments({ isActive: true }),
    ]);

    const highSeverity = Number(highSeverityRows?.[0]?.count ?? 0);

    res.json({ totalThreats, highSeverity, unreadAlerts, activeSources });
  } catch (error) {
    console.error("[threats.controller] getSummaryStats:", error);
    res.status(500).json({ error: "Failed to fetch summary stats" });
  }
}

export async function getRecentThreats(req, res) {
  try {
    const userId = getUserId(req);
    const organizationId = await resolveOrganizationId(userId);

    if (!organizationId) {
      return res.json([]);
    }

    const limit = Math.min(Number(req.query.limit ?? 10), 50);
    const offset = Math.max(Number(req.query.offset ?? 0), 0);

    const alerts = await Alert.find({ organization: organizationId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate({
        path: "threat",
        options: { lean: true },
        populate: {
          path: "rawPost",
          options: { lean: true },
        },
      })
      .lean();

    const threats = alerts.map((item) => item?.threat).filter(Boolean);

    const response = threats.map((threat) => mapThreat(threat));
    res.json(response);
  } catch (error) {
    console.error("[threats.controller] getRecentThreats:", error);
    res.status(500).json({ error: "Failed to fetch recent threats" });
  }
}

export async function getThreatDetails(req, res) {
  try {
    const userId = getUserId(req);
    const organizationId = await resolveOrganizationId(userId);

    if (!organizationId) {
      return res.status(404).json({ error: "Threat not found" });
    }

    const { threatId } = req.params;
    if (!mongoose.isValidObjectId(threatId)) {
      return res.status(400).json({ error: "Invalid threat id" });
    }

    const hasAccess = await Alert.findOne({ organization: organizationId, threat: threatId })
      .select("_id")
      .lean();

    if (!hasAccess) {
      return res.status(404).json({ error: "Threat not found" });
    }

    const threat = await Threat.findById(threatId)
      .populate({ path: "rawPost", options: { lean: true } })
      .lean();

    if (!threat) {
      return res.status(404).json({ error: "Threat not found" });
    }

    if (threat.rawPost?.sourceId) {
      const source = await ThreatSource.findOne({ sourceId: threat.rawPost.sourceId }).lean();
      threat.rawPost.threatSource = source ?? null;
    }

    res.json(mapThreat(threat));
  } catch (error) {
    console.error("[threats.controller] getThreatDetails:", error);
    res.status(500).json({ error: "Failed to fetch threat details" });
  }
}