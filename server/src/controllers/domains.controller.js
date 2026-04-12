import mongoose from "mongoose";
import { DomainActivity } from "../models/DomainActivity.js";
import { Organization } from "../models/Organization.js";
import { SimilarDomain } from "../models/SimilarDomain.js";
import { mapDomain, mapDomainActivity } from "../lib/mappers.js";
import { getUserId } from "../middleware/auth.js";

async function resolveOrganization(userId) {
  return Organization.findOne({ clerkUserId: userId }).select("_id").lean();
}

export async function getSimilarDomains(req, res) {
  try {
    const userId = getUserId(req);
    const organization = await resolveOrganization(userId);

    if (!organization) {
      return res.json([]);
    }

    const domains = await SimilarDomain.find({ organization: organization._id })
      .sort({ similarityScore: -1 })
      .lean();

    res.json(domains.map((domain) => mapDomain(domain)));
  } catch (error) {
    console.error("[domains.controller] getSimilarDomains:", error);
    res.status(500).json({ error: "Failed to fetch similar domains" });
  }
}

export async function getDomainActivities(req, res) {
  try {
    const { domainId } = req.params;
    if (!mongoose.isValidObjectId(domainId)) {
      return res.status(400).json({ error: "Invalid domain id" });
    }

    const activities = await DomainActivity.find({ domain: domainId })
      .sort({ detectedAt: -1 })
      .lean();

    res.json(activities.map((item) => mapDomainActivity(item)));
  } catch (error) {
    console.error("[domains.controller] getDomainActivities:", error);
    res.status(500).json({ error: "Failed to fetch domain activities" });
  }
}

export async function getGlobalDomainActivities(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit ?? 20), 100);

    const activities = await DomainActivity.find({})
      .sort({ detectedAt: -1 })
      .limit(limit)
      .populate({ path: "domain", select: "domainName", options: { lean: true } })
      .lean();

    res.json(
      activities.map((item) => ({
        ...mapDomainActivity(item),
        domain_name: item.domain?.domainName ?? "unknown",
      }))
    );
  } catch (error) {
    console.error("[domains.controller] getGlobalDomainActivities:", error);
    res.status(500).json({ error: "Failed to fetch global domain activities" });
  }
}