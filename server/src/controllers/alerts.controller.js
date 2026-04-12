import mongoose from "mongoose";
import { Alert } from "../models/Alert.js";
import { Organization } from "../models/Organization.js";
import { mapAlert } from "../lib/mappers.js";
import { getUserId } from "../middleware/auth.js";

async function resolveOrganizationId(userId) {
  const organization = await Organization.findOne({ clerkUserId: userId }).select("_id").lean();
  return organization?._id ?? null;
}

export async function getAlerts(req, res) {
  try {
    const userId = getUserId(req);
    const organizationId = await resolveOrganizationId(userId);

    if (!organizationId) {
      return res.json([]);
    }

    const alerts = await Alert.find({ organization: organizationId })
      .sort({ createdAt: -1 })
      .populate({
        path: "threat",
        select: "threatType sector severityScore",
        options: { lean: true },
      })
      .lean();

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