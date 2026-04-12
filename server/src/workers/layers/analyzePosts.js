import { Alert } from "../../models/Alert.js";
import { Organization } from "../../models/Organization.js";
import { ProcessingLog } from "../../models/ProcessingLog.js";
import { RawPost } from "../../models/RawPost.js";
import { Threat } from "../../models/Threat.js";
import { model } from "../clients/geminiClient.js";
import { containsThreatWords } from "./filterThread.js";
import { calculateThreatScore, isHighRisk } from "./scoring.js";

function normalizeImpactLevel(value) {
  const lower = String(value ?? "medium").toLowerCase();
  if (["low", "medium", "high", "critical"].includes(lower)) {
    return lower;
  }
  return "medium";
}

function extractJsonPayload(text) {
  const cleanText = text.replace(/```json|```/g, "").trim();
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
  await logProcessing("running", "[LIVE] Starting AI analysis pipeline");

  const posts = await RawPost.find({ processed: false }).sort({ createdAt: 1 }).limit(150);

  if (posts.length === 0) {
    await logProcessing("success", "[COMPLETED] No new posts to analyze");
    return;
  }

  for (const post of posts) {
    try {
      if (!containsThreatWords(post.content)) {
        post.processed = true;
        await post.save();
        continue;
      }

      const score = calculateThreatScore(post.content);
      post.threatScore = score;
      await post.save();

      if (!isHighRisk(post.content)) {
        post.processed = true;
        await post.save();
        continue;
      }

      let analysis = {
        is_threat: true,
        threat_type: "Potential cyber threat",
        sector: "Technology",
        severity_score: Math.min(10, Math.max(6, Math.round(score / 2))),
        credibility_score: 6,
        impact_level: "high",
        organizations_mentioned: [],
        summary: post.content.slice(0, 300),
      };

      if (model) {
        const prompt = `
Analyze this forum post for cyber threat intelligence.

POST:
"${post.content}"

Return STRICT JSON ONLY:
{
  "is_threat": true/false,
  "threat_type": "",
  "sector": "",
  "severity_score": 1-10,
  "credibility_score": 1-10,
  "impact_level": "low|medium|high|critical",
  "organizations_mentioned": [],
  "summary": ""
}
`;

        const result = await model.generateContent(prompt);
        analysis = extractJsonPayload(result.response.text());
      }

      if (!analysis.is_threat) {
        post.processed = true;
        await post.save();
        continue;
      }

      const threat = await Threat.create({
        rawPost: post._id,
        threatType: analysis.threat_type || "Potential cyber threat",
        sector: analysis.sector || "Technology",
        severityScore: Number(analysis.severity_score ?? 6),
        credibilityScore: Number(analysis.credibility_score ?? 6),
        impactLevel: normalizeImpactLevel(analysis.impact_level),
        organizationsMentioned: Array.isArray(analysis.organizations_mentioned)
          ? analysis.organizations_mentioned
          : [],
        summary: analysis.summary || post.content.slice(0, 300),
        aiConfidence: model ? 0.9 : 0.6,
      });

      const sectorRegex = new RegExp(`^${(analysis.sector ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
      const organizations = await Organization.find(
        analysis.sector ? { sector: sectorRegex } : {}
      ).select("_id");

      for (const org of organizations) {
        await Alert.findOneAndUpdate(
          { organization: org._id, threat: threat._id },
          { $setOnInsert: { organization: org._id, threat: threat._id, isRead: false } },
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