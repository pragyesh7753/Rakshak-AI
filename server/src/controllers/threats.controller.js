import mongoose from "mongoose";
import { Alert } from "../models/Alert.js";
import { Organization } from "../models/Organization.js";
import { Threat } from "../models/Threat.js";
import { ThreatSource } from "../models/ThreatSource.js";
import { mapThreat } from "../lib/mappers.js";
import { getUserId } from "../middleware/auth.js";

export async function getSummaryStats(req, res) {
  try {
    const userId = getUserId(req);
    const organization = await Organization.findOne({ clerkUserId: userId }).select("_id").lean();

    const unreadFilter = organization
      ? { organization: organization._id, isRead: false }
      : { isRead: false };

    const [totalThreats, highSeverity, unreadAlerts, activeSources] = await Promise.all([
      Threat.countDocuments(),
      Threat.countDocuments({ severityScore: { $gte: 7 } }),
      Alert.countDocuments(unreadFilter),
      ThreatSource.countDocuments({ isActive: true }),
    ]);

    res.json({ totalThreats, highSeverity, unreadAlerts, activeSources });
  } catch (error) {
    console.error("[threats.controller] getSummaryStats:", error);
    res.status(500).json({ error: "Failed to fetch summary stats" });
  }
}

export async function getRecentThreats(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit ?? 10), 50);
    const offset = Math.max(Number(req.query.offset ?? 0), 0);

    const threats = await Threat.find({})
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate({ path: "rawPost", options: { lean: true } })
      .lean();

    const response = threats.map((threat) => mapThreat(threat));
    res.json(response);
  } catch (error) {
    console.error("[threats.controller] getRecentThreats:", error);
    res.status(500).json({ error: "Failed to fetch recent threats" });
  }
}

export async function getThreatDetails(req, res) {
  try {
    const { threatId } = req.params;
    if (!mongoose.isValidObjectId(threatId)) {
      return res.status(400).json({ error: "Invalid threat id" });
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