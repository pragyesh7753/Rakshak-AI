import { mapOrganization } from "../lib/mappers.js";
import { Organization } from "../models/Organization.js";
import { getUserId } from "../middleware/auth.js";

export async function upsertMyOrganization(req, res) {
  try {
    const userId = getUserId(req);
    const { org_name, sector, domain, keywords = [] } = req.body ?? {};

    if (!org_name || !sector || !domain) {
      return res.status(400).json({ error: "org_name, sector, and domain are required" });
    }

    const org = await Organization.findOneAndUpdate(
      { clerkUserId: userId },
      {
        $set: {
          orgName: org_name,
          sector,
          domain,
          keywords: Array.isArray(keywords) ? keywords : [],
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({ success: true, organization: mapOrganization(org) });
  } catch (error) {
    console.error("[organizations.controller] upsertMyOrganization:", error);
    res.status(500).json({ error: "Failed to save organization" });
  }
}

export async function getMyOrganization(req, res) {
  try {
    const userId = getUserId(req);
    const org = await Organization.findOne({ clerkUserId: userId }).lean();

    if (!org) {
      return res.json(null);
    }

    res.json(mapOrganization(org));
  } catch (error) {
    console.error("[organizations.controller] getMyOrganization:", error);
    res.status(500).json({ error: "Failed to fetch organization" });
  }
}

export async function getOrganizationByUserId(req, res) {
  try {
    const { userId } = req.params;
    const org = await Organization.findOne({ clerkUserId: userId }).lean();

    if (!org) {
      return res.json(null);
    }

    res.json(mapOrganization(org));
  } catch (error) {
    console.error("[organizations.controller] getOrganizationByUserId:", error);
    res.status(500).json({ error: "Failed to fetch organization" });
  }
}