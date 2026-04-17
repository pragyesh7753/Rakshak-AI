import {
  analyzeEmailThreat,
  listEmailIntelligenceResults,
  resolveOrganizationByAlias,
  resolveOrganizationByUserId,
  saveEmailIntelligenceResult,
} from "../services/emailAnalysisService.js";
import { parseForwardedEmail } from "../utils/emailParser.js";
import { getUserId } from "../../../shared/auth/clerkAuth.js";

const EMAIL_LOCAL_PART_PREFIX = String(
  process.env.EMAIL_INTELLIGENCE_LOCAL_PART_PREFIX ?? "security-rakshakai"
)
  .trim()
  .toLowerCase();
const EMAIL_DOMAIN = String(process.env.EMAIL_INTELLIGENCE_DOMAIN ?? "pragyesh.in")
  .trim()
  .toLowerCase();
const WEBHOOK_SECRET = String(process.env.EMAIL_WEBHOOK_SECRET ?? "").trim();

function escapeRegex(value) {
  return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function flattenToStrings(value) {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenToStrings(entry));
  }

  if (value === null || typeof value === "undefined") {
    return [];
  }

  if (typeof value === "object") {
    return Object.values(value).flatMap((entry) => flattenToStrings(entry));
  }

  return [String(value)];
}

function firstNonEmptyString(values) {
  for (const value of Array.isArray(values) ? values : []) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function extractOrganizationIdFromRecipient(recipientValue) {
  const candidates = flattenToStrings(recipientValue)
    .join(",")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (candidates.length === 0) {
    return "";
  }

  const localPrefix = escapeRegex(EMAIL_LOCAL_PART_PREFIX);
  const emailDomain = escapeRegex(EMAIL_DOMAIN);
  const pattern = new RegExp(`${localPrefix}\\+([a-z0-9_-]+)@${emailDomain}`, "i");

  for (const candidate of candidates) {
    const match = candidate.match(pattern);
    if (!match) {
      continue;
    }

    return String(match[1] ?? "")
      .trim()
      .toLowerCase();
  }

  return "";
}

function extractIncomingSubject(body) {
  return firstNonEmptyString([
    body?.subject,
    body?.Subject,
    body?.headers?.subject,
    body?.headers?.Subject,
  ]);
}

function extractIncomingBodyText(body) {
  return firstNonEmptyString([
    body?.body,
    body?.text,
    body?.["stripped-text"],
    body?.["TextBody"],
    body?.html,
    body?.["HtmlBody"],
    body?.content,
  ]);
}

function extractIncomingRecipient(body) {
  return firstNonEmptyString([
    body?.to,
    body?.recipient,
    body?.envelope?.to,
    body?.headers?.to,
    body?.["To"],
  ]);
}

function isWebhookAuthorized(req) {
  if (!WEBHOOK_SECRET) {
    return true;
  }

  const headerSecret = String(req.headers["x-email-webhook-secret"] ?? "").trim();
  return headerSecret.length > 0 && headerSecret === WEBHOOK_SECRET;
}

export async function emailWebhookController(req, res) {
  try {
    if (!isWebhookAuthorized(req)) {
      return res.status(401).json({ error: "Unauthorized email webhook" });
    }

    const to = extractIncomingRecipient(req.body ?? {});
    const subject = extractIncomingSubject(req.body ?? {});
    const body = extractIncomingBodyText(req.body ?? {});

    if (!to || !body) {
      return res.status(400).json({ error: "Missing required email payload fields: to/body" });
    }

    const organizationId = extractOrganizationIdFromRecipient(to);
    if (!organizationId) {
      return res
        .status(400)
        .json({ error: "Unable to extract organizationId from recipient address" });
    }

    const organization = await resolveOrganizationByAlias(organizationId);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found for recipient alias" });
    }

    // Forwarded mail sender is embedded in body headers. Never trust req.body.from as attacker identity.
    const parsedEmail = parseForwardedEmail({
      subject,
      body,
    });

    if (!parsedEmail.originalSender) {
      return res.status(422).json({
        error: "Could not extract original sender from forwarded email content",
      });
    }

    const result = await analyzeEmailThreat({
      organizationId: organization.id,
      organizationAlias: organizationId,
      organization,
      originalSender: parsedEmail.originalSender,
      originalSubject: parsedEmail.originalSubject || subject,
      cleanContent: parsedEmail.cleanContent,
    });

    let savedRecord = null;
    try {
      savedRecord = await saveEmailIntelligenceResult({
        organizationId: organization.id,
        organizationAlias: organizationId,
        recipient: to,
        inboundSubject: subject,
        originalSender: result.originalSender,
        originalSubject: result.originalSubject,
        cleanContent: parsedEmail.cleanContent,
        extractedLinks: result.extractedLinks,
        riskScore: result.riskScore,
        threatType: result.threatType,
        flags: result.flags,
        analysis: result.analysis,
        recommendedAction: result.recommendedAction,
        signalBreakdown: result.signalBreakdown,
      });
    } catch (persistError) {
      console.error("[email-intelligence.controller] saveEmailIntelligenceResult:", persistError);
    }

    return res.status(200).json({
      ...result,
      recordId: savedRecord?.id ?? null,
      recordedAt: savedRecord?.createdAt ?? null,
    });
  } catch (error) {
    console.error("[email-intelligence.controller] emailWebhookController:", error);
    return res.status(500).json({ error: "Failed to process forwarded email intelligence" });
  }
}

export async function getEmailIntelligenceResultsController(req, res) {
  try {
    const userId = getUserId(req);
    const organization = await resolveOrganizationByUserId(userId);

    if (!organization?.id) {
      return res.json([]);
    }

    const limit = Number(req.query.limit ?? 30);
    const results = await listEmailIntelligenceResults({
      organizationId: organization.id,
      limit,
    });

    return res.json(results);
  } catch (error) {
    console.error("[email-intelligence.controller] getEmailIntelligenceResultsController:", error);
    return res.status(500).json({ error: "Failed to fetch email intelligence results" });
  }
}

export { extractOrganizationIdFromRecipient };
