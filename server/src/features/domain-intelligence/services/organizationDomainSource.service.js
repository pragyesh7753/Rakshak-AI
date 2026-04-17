import { Organization } from "../../../models/Organization.js";
import {
  DOMAIN_INTELLIGENCE_BASE_KEYWORDS,
} from "../config/domainIntelligence.config.js";
import { extractDomainTokens, sanitizeKeyword } from "../utils/domainNormalization.js";

function uniqueKeywords(values) {
  return [
    ...new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => sanitizeKeyword(value))
        .filter((token) => token.length >= 3)
    ),
  ].sort((left, right) => left.localeCompare(right));
}

export async function getOrganizationsForDomainIntelligence() {
  const organizations = await Organization.find({})
    .select("_id orgName domain keywords seedKeywords")
    .lean();

  return organizations
    .map((organization) => {
      const domain = String(organization.domain ?? "").trim().toLowerCase();
      if (!domain) {
        return null;
      }

      const keywords = uniqueKeywords([
        ...(organization.keywords ?? []),
        ...(organization.seedKeywords ?? []),
        ...extractDomainTokens(domain),
        ...DOMAIN_INTELLIGENCE_BASE_KEYWORDS,
      ]);

      return {
        id: organization._id,
        name: String(organization.orgName ?? "").trim(),
        domain,
        keywords,
      };
    })
    .filter(Boolean);
}
