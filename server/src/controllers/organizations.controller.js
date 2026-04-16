import { mapOrganization } from "../lib/mappers.js";
import { Organization } from "../models/Organization.js";
import { OrganizationKeywordBank } from "../models/OrganizationKeywordBank.js";
import { getUserId } from "../middleware/auth.js";
import { refreshOrganizationKeywordBank } from "../workers/layers/keywordBank.js";

function mapKeywordBank(bankDoc) {
  if (!bankDoc) {
    return null;
  }

  return {
    final_keywords: Array.isArray(bankDoc.finalKeywords) ? bankDoc.finalKeywords : [],
    generated_at: bankDoc.generatedAt ?? null,
    provider: bankDoc.provider ?? "fallback",
    model: bankDoc.model ?? "",
    fallback_used: Boolean(bankDoc.fallbackUsed),
  };
}

async function getKeywordBankForOrganization(organizationId) {
  if (!organizationId) {
    return null;
  }

  return OrganizationKeywordBank.findOne({ organization: organizationId })
    .select("finalKeywords generatedAt provider model fallbackUsed")
    .lean();
}

export async function upsertMyOrganization(req, res) {
  try {
    const userId = getUserId(req);
    const { org_name, sector, domain, description = "", keywords = [] } = req.body ?? {};
    const seedKeywords = Array.isArray(keywords) ? keywords : [];

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
          description: String(description ?? "").trim().slice(0, 1200),
          seedKeywords,
          keywords: seedKeywords,
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
    ).lean();

    let keywordBank = null;
    try {
      keywordBank = await refreshOrganizationKeywordBank(org, { force: true, allowGemini: true });
    } catch (keywordError) {
      console.error("[organizations.controller] keyword-bank refresh failed:", keywordError);
      keywordBank = await getKeywordBankForOrganization(org?._id);
    }

    const latestOrg = await Organization.findOne({ clerkUserId: userId }).lean();

    res.json({
      success: true,
      organization: mapOrganization(latestOrg ?? org),
      keyword_bank: mapKeywordBank(keywordBank),
    });
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

    const keywordBank = await getKeywordBankForOrganization(org._id);
    res.json({
      ...mapOrganization(org),
      keyword_bank: mapKeywordBank(keywordBank),
    });
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

    const keywordBank = await getKeywordBankForOrganization(org._id);
    res.json({
      ...mapOrganization(org),
      keyword_bank: mapKeywordBank(keywordBank),
    });
  } catch (error) {
    console.error("[organizations.controller] getOrganizationByUserId:", error);
    res.status(500).json({ error: "Failed to fetch organization" });
  }
}