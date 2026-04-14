import { Alert } from "../../models/Alert.js";
import { Organization } from "../../models/Organization.js";
import { ProcessingLog } from "../../models/ProcessingLog.js";
import { RawPost } from "../../models/RawPost.js";
import { Threat } from "../../models/Threat.js";
import { generateLlamaResponse, isSambaNovaConfigured } from "../clients/sambanovaClient.js";
import { evaluateThreatCandidate } from "./filterThread.js";
import { calculateThreatAssessment, isHighRisk } from "./scoring.js";

function normalizeImpactLevel(value) {
  const lower = String(value ?? "medium").toLowerCase();
  if (["low", "medium", "high", "critical"].includes(lower)) {
    return lower;
  }
  return "medium";
}

function escapeRegex(text) {
  return String(text ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function uniqueMentionTokens(values) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map((value) => String(value ?? "").trim())
    .filter((value) => value.length >= 3)
    .map((value) => value.slice(0, 80)))];
}

function normalizeScore(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.min(10, Math.max(1, Math.round(numeric)));
}

function normalizeConfidence(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

function derivePriority({ severity, credibility, impact, threatScore }) {
  if (impact === "critical" || (severity >= 8 && credibility >= 7) || threatScore >= 8.5) {
    return "critical";
  }
  if (impact === "high" || severity >= 6 || threatScore >= 6) {
    return "high";
  }
  return "medium";
}

function deriveRouting(priority, confidence) {
  if (priority === "critical") {
    if (confidence < 55) {
      return {
        routeChannel: "analyst-review",
        routeReason: "Critical score but confidence below 55, routed to analyst review",
      };
    }
    return {
      routeChannel: "immediate-response",
      routeReason: "Critical tier threat routed for immediate response",
    };
  }
  if (priority === "high") {
    if (confidence < 45) {
      return {
        routeChannel: "dashboard-digest",
        routeReason: "High score but confidence below 45, routed to digest",
      };
    }
    return {
      routeChannel: "analyst-review",
      routeReason: "High tier threat routed for analyst triage",
    };
  }
  return {
    routeChannel: "dashboard-digest",
    routeReason:
      confidence >= 30
        ? "Medium tier threat routed to digest workflow"
        : "Medium score and low confidence, routed to low-priority digest",
  };
}

async function resolveTargetOrganizations({ analysisSector, organizationsMentioned, priority }) {
  const normalizedSector = String(analysisSector ?? "").trim();

  if (normalizedSector) {
    const sectorRegex = new RegExp(`^${escapeRegex(normalizedSector)}$`, "i");
    const bySector = await Organization.find({ sector: sectorRegex }).select("_id").lean();
    if (bySector.length > 0) {
      return {
        organizations: bySector,
        fallbackReason: null,
        routeChannelOverride: null,
      };
    }
  }

  const mentionTokens = uniqueMentionTokens(organizationsMentioned);
  if (mentionTokens.length > 0) {
    const mentionRegex = mentionTokens.map((token) => new RegExp(escapeRegex(token), "i"));
    const byMention = await Organization.find({
      $or: [
        { orgName: { $in: mentionRegex } },
        { domain: { $in: mentionRegex } },
        { keywords: { $in: mentionRegex } },
      ],
    })
      .select("_id")
      .lean();

    if (byMention.length > 0) {
      return {
        organizations: byMention,
        fallbackReason: `No sector match for '${normalizedSector || "unknown"}', routed via organization mentions`,
        routeChannelOverride: null,
      };
    }
  }

  const allOrganizations = await Organization.find({}).select("_id").lean();
  if (allOrganizations.length === 0) {
    return {
      organizations: [],
      fallbackReason: "No organizations configured for alert routing",
      routeChannelOverride: null,
    };
  }

  const fallbackChannel = priority === "critical" ? "analyst-review" : "dashboard-digest";
  return {
    organizations: allOrganizations,
    fallbackReason: `No sector or mention match for '${normalizedSector || "unknown"}', broadcast fallback routing applied`,
    routeChannelOverride: fallbackChannel,
  };
}

function extractJsonPayload(text) {
  const cleanText = String(text ?? "").replace(/```json|```/g, "").trim();

  if (cleanText.startsWith("{") && cleanText.endsWith("}")) {
    return JSON.parse(cleanText);
  }

  const firstBrace = cleanText.indexOf("{");
  const lastBrace = cleanText.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON payload found in model response");
  }
  return JSON.parse(cleanText.slice(firstBrace, lastBrace + 1));
}

async function logProcessing(status, message) {
  await ProcessingLog.create({
    jobType: "ai_analysis",
    status,
    message,
  });
}

export async function analyzePosts() {
  const llamaEnabled = isSambaNovaConfigured();

  await logProcessing("running", "[LIVE] Starting AI analysis pipeline");

  const posts = await RawPost.find({ processed: false }).sort({ createdAt: 1 }).limit(150);

  if (posts.length === 0) {
    await logProcessing("success", "[COMPLETED] No new posts to analyze");
    return;
  }

  for (const post of posts) {
    try {
      const candidate = evaluateThreatCandidate(post.content, post.title);
      if (!candidate.shouldAnalyze) {
        post.processed = true;
        await post.save();
        continue;
      }

      const assessment = calculateThreatAssessment(`${post.title || ""}\n${post.content || ""}`);
      post.keywordScore = candidate.maliciousSignals;
      post.threatScore = assessment.score;
      await post.save();

      if (!isHighRisk(assessment, 5.5) || assessment.confidence < 25) {
        post.processed = true;
        await post.save();
        continue;
      }

      let analysis = {
        is_threat: true,
        threat_type: "Potential cyber threat",
        sector: "Technology",
        severity_score: Math.min(10, Math.max(5, Math.round(assessment.score))),
        credibility_score: 6,
        impact_level: "high",
        organizations_mentioned: [],
        summary: post.content.slice(0, 300),
        confidence_score: assessment.confidence,
        indicators: [],
        recommended_action: "Investigate and monitor for related indicators.",
        likely_timeframe: "unknown",
      };

      if (llamaEnabled) {
        const prompt = `
Analyze this forum post for cyber threat intelligence.

POST TITLE:
"${post.title || ""}"

POST:
"${post.content}"

RISK SNAPSHOT:
- Weighted risk score: ${assessment.score}/10
- Confidence: ${assessment.confidence}/100
- Malicious indicators matched: ${candidate.maliciousSignals}
- Noise indicators matched: ${candidate.noiseSignals}

Return STRICT JSON ONLY:
{
  "is_threat": true/false,
  "threat_type": "",
  "sector": "",
  "severity_score": 1-10,
  "credibility_score": 1-10,
  "confidence_score": 0-100,
  "impact_level": "low|medium|high|critical",
  "organizations_mentioned": [],
  "indicators": [],
  "recommended_action": "",
  "likely_timeframe": "immediate|days|weeks|unknown",
  "summary": ""
}

Rules:
- If content is educational, hypothetical, or help-seeking, set is_threat=false.
- Output valid JSON only. Do not include markdown or comments.
`;

        const responseText = await generateLlamaResponse(prompt);
        analysis = extractJsonPayload(responseText);
      }

      if (!analysis.is_threat) {
        post.processed = true;
        await post.save();
        continue;
      }

      const impactLevel = normalizeImpactLevel(analysis.impact_level);
      const severityScore = normalizeScore(analysis.severity_score, Math.round(assessment.score));
      const credibilityScore = normalizeScore(analysis.credibility_score, 6);
      const confidenceScore = normalizeConfidence(analysis.confidence_score, assessment.confidence);
      const priority = derivePriority({
        severity: severityScore,
        credibility: credibilityScore,
        impact: impactLevel,
        threatScore: assessment.score,
      });
      const routing = deriveRouting(priority, confidenceScore);

      const threat = await Threat.create({
        rawPost: post._id,
        threatType: analysis.threat_type || "Potential cyber threat",
        sector: analysis.sector || "Technology",
        severityScore,
        credibilityScore,
        impactLevel,
        priority,
        organizationsMentioned: Array.isArray(analysis.organizations_mentioned)
          ? analysis.organizations_mentioned
          : [],
        summary: analysis.summary || post.content.slice(0, 300),
        indicators: Array.isArray(analysis.indicators) ? analysis.indicators : [],
        recommendedAction: String(analysis.recommended_action || "Investigate and monitor"),
        likelyTimeframe: String(analysis.likely_timeframe || "unknown"),
        aiConfidence: Math.min(1, Math.max(0, confidenceScore / 100)),
      });

      const targetResolution = await resolveTargetOrganizations({
        analysisSector: analysis.sector,
        organizationsMentioned: analysis.organizations_mentioned,
        priority,
      });

      const organizations = targetResolution.organizations;
      const finalRouteChannel = targetResolution.routeChannelOverride ?? routing.routeChannel;
      const baseRouteReason = finalRouteChannel === routing.routeChannel
        ? routing.routeReason
        : `Fallback channel override to ${finalRouteChannel}`;
      const finalRouteReason = targetResolution.fallbackReason
        ? `${baseRouteReason} | ${targetResolution.fallbackReason}`
        : baseRouteReason;

      for (const org of organizations) {
        await Alert.findOneAndUpdate(
          { organization: org._id, threat: threat._id },
          {
            $setOnInsert: {
              organization: org._id,
              threat: threat._id,
              isRead: false,
              priority,
              routeChannel: finalRouteChannel,
              routeReason: finalRouteReason,
              routedAt: new Date(),
            },
          },
          { upsert: true }
        );
      }

      post.processed = true;
      await post.save();
    } catch (error) {
      await logProcessing("failed", `[ERROR] Post processing failed ${post._id}: ${error.message}`);
    }
  }

  await logProcessing("success", `[COMPLETED] AI analysis completed | processed: ${posts.length}`);
}