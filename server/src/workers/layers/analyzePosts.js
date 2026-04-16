import { Alert } from "../../models/Alert.js";
import { Organization } from "../../models/Organization.js";
import { ProcessingLog } from "../../models/ProcessingLog.js";
import { RawPost } from "../../models/RawPost.js";
import { Threat } from "../../models/Threat.js";
import {
  getHuggingFaceModelConfig,
  getMiniLMContextSimilarities,
  getXLMRSentimentBatch,
  isHuggingFaceConfigured,
} from "../clients/huggingfaceClient.js";
import {
  generateGroqReasoning,
  getGroqModel,
  isGroqConfigured,
} from "../clients/groqClient.js";
import { evaluateThreatCandidate } from "./filterThread.js";
import { calculateThreatAssessment, isHighRisk } from "./scoring.js";

const CONTEXT_PROFILES = [
  {
    threatType: "Credential leak",
    sector: "Technology",
    contextText:
      "Credential dumps, exposed passwords, leaked tokens, and account takeover attempts against digital platforms.",
    indicators: ["credential dump", "password leak", "token exposed", "account takeover"],
    recommendedAction:
      "Rotate credentials immediately, invalidate sessions, and monitor suspicious authentications.",
    likelyTimeframe: "immediate",
  },
  {
    threatType: "Ransomware intrusion",
    sector: "Healthcare",
    contextText:
      "Ransomware deployment, encrypted systems, extortion demands, and unauthorized access to critical care infrastructure.",
    indicators: ["ransomware", "encryption", "extortion", "lateral movement"],
    recommendedAction:
      "Isolate affected hosts, activate incident response, and initiate controlled recovery from clean backups.",
    likelyTimeframe: "immediate",
  },
  {
    threatType: "Financial fraud campaign",
    sector: "Finance",
    contextText:
      "Banking fraud operations, payment abuse, phishing against customers, and account compromise in fintech systems.",
    indicators: ["phishing", "payment fraud", "upi abuse", "bank credential theft"],
    recommendedAction:
      "Enable transaction anomaly monitoring, revoke suspicious access, and enforce MFA for targeted accounts.",
    likelyTimeframe: "days",
  },
  {
    threatType: "Government data exposure",
    sector: "Government",
    contextText:
      "Leaks involving public-sector records, identity systems, and unauthorized sharing of citizen or agency data.",
    indicators: ["citizen data leak", "gov records", "identity exposure", "public-sector breach"],
    recommendedAction:
      "Validate leak scope, rotate privileged credentials, and harden exposed services.",
    likelyTimeframe: "days",
  },
  {
    threatType: "Telecom infrastructure abuse",
    sector: "Telecom",
    contextText:
      "SIM swap operations, telecom backend abuse, and attacks against core networking services.",
    indicators: ["sim swap", "telecom breach", "ss7 abuse", "network compromise"],
    recommendedAction:
      "Escalate to telecom SOC, tighten identity verification, and inspect unusual account changes.",
    likelyTimeframe: "days",
  },
  {
    threatType: "Supply chain compromise",
    sector: "Technology",
    contextText:
      "Malicious packages, dependency poisoning, stolen CI/CD tokens, and software supply chain attacks.",
    indicators: ["dependency poisoning", "malicious package", "ci token leak", "backdoored build"],
    recommendedAction:
      "Freeze release pipeline, verify package integrity, and rotate build secrets.",
    likelyTimeframe: "weeks",
  },
  {
    threatType: "Educational institution breach",
    sector: "Education",
    contextText:
      "Compromise of university systems, student data leaks, and credential abuse across campus platforms.",
    indicators: ["student data leak", "campus breach", "university credentials", "academic portal access"],
    recommendedAction:
      "Contain affected systems, reset impacted identities, and enforce additional access controls.",
    likelyTimeframe: "days",
  },
];

const INDICATOR_PATTERNS = [
  /\bcve-\d{4}-\d{4,7}\b/gi,
  /\b(?:sql injection|sqli|rce|xss|csrf|auth bypass|privilege escalation|zero[ -]?day|0day)\b/gi,
  /\b(?:ransomware|infostealer|botnet|ddos|phishing|credential stuffing)\b/gi,
  /\b\d{1,3}(?:\.\d{1,3}){3}\b/g,
  /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi,
  /\bhttps?:\/\/[^\s]+/gi,
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeImpactLevel(value) {
  const lower = String(value ?? "medium").toLowerCase();
  if (["low", "medium", "high", "critical"].includes(lower)) {
    return lower;
  }
  return "medium";
}

function normalizeTimeframe(value) {
  const lower = String(value ?? "unknown").toLowerCase();
  if (["immediate", "days", "weeks", "unknown"].includes(lower)) {
    return lower;
  }
  return "unknown";
}

function escapeRegex(text) {
  return String(text ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function uniqueMentionTokens(values) {
  return [
    ...new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => String(value ?? "").trim())
        .filter((value) => value.length >= 3)
        .map((value) => value.slice(0, 80))
    ),
  ];
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
      $or: [{ orgName: { $in: mentionRegex } }, { domain: { $in: mentionRegex } }, { keywords: { $in: mentionRegex } }],
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

function chunkArray(items, chunkSize) {
  const size = Math.max(1, Number(chunkSize) || 1);
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function buildPostBody(post) {
  return `${String(post?.title ?? "")}\n${String(post?.content ?? "")}`.trim();
}

function detectLikelyTimeframe(text) {
  const lower = String(text ?? "").toLowerCase();

  if (/\b(now|ongoing|active|currently|today|urgent|immediately)\b/.test(lower)) {
    return "immediate";
  }
  if (/\b(within|next|soon|tomorrow|day|days|48 hours|72 hours)\b/.test(lower)) {
    return "days";
  }
  if (/\b(week|weeks|monthly|later|long term)\b/.test(lower)) {
    return "weeks";
  }

  return "unknown";
}

function extractInlineIndicators(text) {
  const collected = [];
  const sourceText = String(text ?? "");

  for (const pattern of INDICATOR_PATTERNS) {
    const matches = sourceText.match(pattern) ?? [];
    for (const item of matches) {
      collected.push(String(item));
    }
  }

  return uniqueMentionTokens(collected).slice(0, 12);
}

function extractOrganizationMentions(post) {
  const combined = `${String(post?.title ?? "")} ${String(post?.content ?? "")}`;
  const domainMatches = combined.match(/\b[a-z0-9.-]+\.(?:com|in|org|net|gov|edu)\b/gi) ?? [];
  const entityMatches =
    combined.match(/\b(?:bank|hospital|university|college|telecom|ministry|agency|portal)\s+[a-z0-9&.-]{2,40}/gi) ?? [];

  return uniqueMentionTokens([...domainMatches, ...entityMatches]);
}

function buildFallbackContext(assessment) {
  return {
    threatType: "Potential cyber threat",
    sector: "Technology",
    confidence: normalizeConfidence(assessment?.confidence, 45),
    similarity: 0,
    similarityGap: 0,
    fromModel: false,
    profile: null,
  };
}

function deriveContextFromSimilarityScores(similarityScores, profiles, assessment) {
  if (!Array.isArray(similarityScores) || similarityScores.length === 0 || profiles.length === 0) {
    return buildFallbackContext(assessment);
  }

  const scoredProfiles = profiles
    .map((profile, index) => ({
      profile,
      similarity: Number.isFinite(Number(similarityScores[index]))
        ? Number(similarityScores[index])
        : 0,
    }))
    .sort((left, right) => right.similarity - left.similarity);

  const top = scoredProfiles[0];
  const second = scoredProfiles[1] ?? { similarity: -1 };
  const confidence = Math.round(clamp(((top.similarity + 1) / 2) * 100, 0, 100));

  return {
    threatType: top.profile.threatType,
    sector: top.profile.sector,
    confidence,
    similarity: top.similarity,
    similarityGap: Math.max(0, top.similarity - second.similarity),
    fromModel: true,
    profile: top.profile,
  };
}

function buildFallbackSentiment() {
  return {
    label: "neutral",
    confidence: 0.4,
    score: 0,
    fromModel: false,
    distribution: {
      negative: 0,
      neutral: 1,
      positive: 0,
    },
  };
}

function buildDefaultAnalysis(post, assessment) {
  return {
    is_threat: true,
    threat_type: "Potential cyber threat",
    sector: "Technology",
    severity_score: Math.min(10, Math.max(5, Math.round(assessment.score))),
    credibility_score: 6,
    impact_level: "high",
    organizations_mentioned: [],
    summary: String(post?.content ?? "").slice(0, 300),
    confidence_score: assessment.confidence,
    indicators: [],
    recommended_action: "Investigate and monitor for related indicators.",
    likely_timeframe: "unknown",
  };
}

function buildHeuristicAnalysis(entry, contextAnalysis, sentimentAnalysis) {
  const { post, assessment, candidate } = entry;
  const postBody = buildPostBody(post);
  const sentimentConfidence = normalizeConfidence(Number(sentimentAnalysis?.confidence ?? 0) * 100, 40);

  const sentimentAdjustment =
    sentimentAnalysis?.label === "negative"
      ? 0.75
      : sentimentAnalysis?.label === "positive"
        ? -0.35
        : 0;

  const severityScore = normalizeScore(
    assessment.score + candidate.maliciousSignals * 0.35 - candidate.noiseSignals * 0.35 + sentimentAdjustment,
    Math.round(assessment.score)
  );

  const credibilityScore = normalizeScore(
    assessment.confidence / 12 + contextAnalysis.confidence / 25 + sentimentConfidence / 30,
    6
  );

  const confidenceScore = normalizeConfidence(
    assessment.confidence * 0.5 + contextAnalysis.confidence * 0.35 + sentimentConfidence * 0.15,
    assessment.confidence
  );

  const impactLevel =
    severityScore >= 9 ? "critical" : severityScore >= 7 ? "high" : severityScore >= 5 ? "medium" : "low";

  const likelyTimeframe = normalizeTimeframe(
    contextAnalysis.profile?.likelyTimeframe ?? detectLikelyTimeframe(postBody)
  );

  const organizationsMentioned = extractOrganizationMentions(post);
  const indicators = uniqueMentionTokens([
    ...(contextAnalysis.profile?.indicators ?? []),
    ...extractInlineIndicators(postBody),
  ]).slice(0, 12);

  const benignSignal =
    /\b(ctf|capture the flag|tutorial|guide|for learning|homework|practice lab)\b/i.test(postBody) &&
    candidate.maliciousSignals === 0;

  return {
    is_threat: !benignSignal && severityScore >= 5,
    threat_type: contextAnalysis.threatType || "Potential cyber threat",
    sector: contextAnalysis.sector || "Technology",
    severity_score: severityScore,
    credibility_score: credibilityScore,
    impact_level: impactLevel,
    organizations_mentioned: organizationsMentioned,
    summary: `${contextAnalysis.threatType || "Potential cyber threat"} pattern with ${sentimentAnalysis?.label || "neutral"} sentiment confidence ${sentimentConfidence}%`,
    confidence_score: confidenceScore,
    indicators,
    recommended_action:
      contextAnalysis.profile?.recommendedAction || "Investigate and monitor for related indicators.",
    likely_timeframe: likelyTimeframe,
  };
}

function isBorderlineCase(assessment) {
  const minScore = Number(process.env.BORDERLINE_MIN_SCORE ?? 5.5);
  const maxScore = Number(process.env.BORDERLINE_MAX_SCORE ?? 7.2);
  return assessment.score >= minScore && assessment.score <= maxScore;
}

function isAmbiguousCase(entry, contextAnalysis, sentimentAnalysis) {
  const contextThreshold = Number(process.env.CONTEXT_AMBIGUITY_CONFIDENCE ?? 58);
  const similarityGapThreshold = Number(process.env.MINILM_SIMILARITY_GAP_THRESHOLD ?? 0.035);
  const sentimentThreshold = Number(process.env.SENTIMENT_AMBIGUITY_CONFIDENCE ?? 0.55);

  if (contextAnalysis.confidence < contextThreshold) {
    return true;
  }
  if (contextAnalysis.similarityGap < similarityGapThreshold) {
    return true;
  }
  if (Number(sentimentAnalysis?.confidence ?? 0) < sentimentThreshold) {
    return true;
  }

  return sentimentAnalysis?.label === "neutral" && entry.assessment.confidence < 45;
}

function buildGroqReasoningPrompt(entry, heuristicAnalysis, contextAnalysis, sentimentAnalysis) {
  const post = entry.post;
  const payload = {
    post_id: String(post?._id ?? ""),
    title: String(post?.title ?? "").slice(0, 300),
    content: String(post?.content ?? "").slice(0, 3_000),
    risk_score: entry.assessment.score,
    confidence_score: entry.assessment.confidence,
    malicious_signals: entry.candidate.maliciousSignals,
    noise_signals: entry.candidate.noiseSignals,
    minilm_context: {
      threat_type: contextAnalysis.threatType,
      sector: contextAnalysis.sector,
      confidence_score: contextAnalysis.confidence,
      similarity_gap: Number(contextAnalysis.similarityGap.toFixed(4)),
    },
    xlmr_sentiment: {
      label: sentimentAnalysis.label,
      confidence: Number((Number(sentimentAnalysis.confidence) || 0).toFixed(4)),
      score: Number((Number(sentimentAnalysis.score) || 0).toFixed(4)),
    },
    heuristic_analysis: heuristicAnalysis,
  };

  return `
You are validating an ambiguous cyber threat post. Use the provided MiniLM context and XLM-R sentiment signals.

INPUT JSON:
${JSON.stringify(payload, null, 2)}

Return STRICT JSON ONLY in this exact shape:
{
  "is_threat": true,
  "threat_type": "",
  "sector": "",
  "severity_score": 1,
  "credibility_score": 1,
  "confidence_score": 0,
  "impact_level": "low|medium|high|critical",
  "organizations_mentioned": [],
  "indicators": [],
  "recommended_action": "",
  "likely_timeframe": "immediate|days|weeks|unknown",
  "summary": ""
}

Rules:
- If this is educational, hypothetical, or a harmless support question, set is_threat=false.
- Keep numeric values in range.
- Output valid JSON only and nothing else.
`;
}

function normalizeReasoningAnalysis(parsedPayload, fallbackAnalysis) {
  const candidate = Array.isArray(parsedPayload?.results)
    ? parsedPayload.results[0]
    : parsedPayload?.result && typeof parsedPayload.result === "object"
      ? parsedPayload.result
      : parsedPayload;

  if (!candidate || typeof candidate !== "object") {
    return fallbackAnalysis;
  }

  return {
    ...fallbackAnalysis,
    ...candidate,
  };
}

async function logProcessing(status, message) {
  await ProcessingLog.create({
    jobType: "ai_analysis",
    status,
    message,
  });
}

export async function analyzePosts() {
  const huggingFaceEnabled = isHuggingFaceConfigured();
  const groqEnabled = isGroqConfigured();
  const groqReasoningCapPerCycle = Math.max(
    0,
    Number(process.env.GROQ_REASONING_CAP_PER_CYCLE ?? process.env.LLM_ANALYSIS_CAP_PER_CYCLE ?? 20)
  );
  const inferenceBatchSize = Math.max(
    1,
    Number(process.env.HF_INFERENCE_BATCH_SIZE ?? process.env.LLM_BATCH_SIZE ?? 5)
  );

  let minilmCallsUsed = 0;
  let xlmrCallsUsed = 0;
  let groqCallsUsed = 0;
  let ambiguousCases = 0;
  let borderlineCases = 0;
  let groqSkippedByCap = 0;

  await logProcessing("running", "[LIVE] Starting AI analysis pipeline");

  if (!huggingFaceEnabled) {
    await logProcessing(
      "running",
      "[INFO] HUGGINGFACE_API_KEY not configured, using heuristic-only context/sentiment fallback"
    );
  }

  if (!groqEnabled) {
    await logProcessing(
      "running",
      "[INFO] GROQ_API_KEY not configured, Llama reasoning will be skipped"
    );
  }

  const posts = await RawPost.find({ processed: false }).sort({ createdAt: 1 }).limit(150);

  if (posts.length === 0) {
    await logProcessing("success", "[COMPLETED] No new posts to analyze");
    return;
  }

  const queuedForThreatAnalysis = [];

  async function persistAnalysisResult(entry, analysis, usedSignals) {
    const { post, assessment } = entry;

    if (!analysis.is_threat) {
      post.processed = true;
      await post.save();
      return;
    }

    const impactLevel = normalizeImpactLevel(analysis.impact_level);
    const likelyTimeframe = normalizeTimeframe(analysis.likely_timeframe);
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

    const usedAnyModel =
      Boolean(usedSignals?.context) || Boolean(usedSignals?.sentiment) || Boolean(usedSignals?.reasoning);
    const baselineConfidence = clamp(confidenceScore / 100, 0, 1);
    const confidenceBoost = usedSignals?.reasoning ? 0.08 : usedSignals?.context && usedSignals?.sentiment ? 0.04 : 0;
    const aiConfidence = usedAnyModel
      ? clamp(baselineConfidence + confidenceBoost, 0, 1)
      : Math.min(0.85, Math.max(0.3, baselineConfidence));

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
      summary: String(analysis.summary || post.content || "").slice(0, 300),
      indicators: Array.isArray(analysis.indicators) ? analysis.indicators : [],
      recommendedAction: String(analysis.recommended_action || "Investigate and monitor"),
      likelyTimeframe,
      aiConfidence,
    });

    const targetResolution = await resolveTargetOrganizations({
      analysisSector: analysis.sector,
      organizationsMentioned: analysis.organizations_mentioned,
      priority,
    });

    const organizations = targetResolution.organizations;
    const finalRouteChannel = targetResolution.routeChannelOverride ?? routing.routeChannel;
    const baseRouteReason =
      finalRouteChannel === routing.routeChannel
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

      queuedForThreatAnalysis.push({ post, assessment, candidate });
    } catch (error) {
      await logProcessing("failed", `[ERROR] Post processing failed ${post._id}: ${error.message}`);
    }
  }

  const contextByPostId = new Map();
  const sentimentByPostId = new Map();
  const contextProfiles = CONTEXT_PROFILES;
  const contextProfileTexts = CONTEXT_PROFILES.map((profile) => profile.contextText);

  if (huggingFaceEnabled && queuedForThreatAnalysis.length > 0) {
    const modelConfig = getHuggingFaceModelConfig();
    await logProcessing(
      "running",
      `[INFO] Hugging Face models active | minilm=${modelConfig.minilm} | xlmr=${modelConfig.xlmr}`
    );

    const entryBatches = chunkArray(queuedForThreatAnalysis, inferenceBatchSize);

    for (const batch of entryBatches) {
      const batchTexts = batch.map((entry) => buildPostBody(entry.post));

      for (const entry of batch) {
        try {
          const similarities = await getMiniLMContextSimilarities(
            buildPostBody(entry.post),
            contextProfileTexts
          );
          minilmCallsUsed += 1;

          contextByPostId.set(
            String(entry.post._id),
            deriveContextFromSimilarityScores(similarities, contextProfiles, entry.assessment)
          );
        } catch (error) {
          contextByPostId.set(String(entry.post._id), buildFallbackContext(entry.assessment));
          await logProcessing(
            "failed",
            `[ERROR] MiniLM context failed ${entry.post._id}: ${error.message}`
          );
        }
      }

      try {
        const sentiments = await getXLMRSentimentBatch(batchTexts);
        xlmrCallsUsed += 1;

        for (let index = 0; index < batch.length; index += 1) {
          const entry = batch[index];
          const modelSentiment = sentiments[index]
            ? { ...sentiments[index], fromModel: true }
            : buildFallbackSentiment();
          sentimentByPostId.set(String(entry.post._id), modelSentiment);
        }
      } catch (error) {
        for (const entry of batch) {
          sentimentByPostId.set(String(entry.post._id), buildFallbackSentiment());
        }
        await logProcessing(
          "failed",
          `[ERROR] XLM-R sentiment batch failed (${batch.length} posts): ${error.message}`
        );
      }
    }
  }

  for (const entry of queuedForThreatAnalysis) {
    const postId = String(entry.post._id);

    const contextAnalysis = contextByPostId.get(postId) ?? buildFallbackContext(entry.assessment);
    const sentimentAnalysis = sentimentByPostId.get(postId) ?? buildFallbackSentiment();

    const fallbackAnalysis = buildDefaultAnalysis(entry.post, entry.assessment);
    const heuristicAnalysis = {
      ...fallbackAnalysis,
      ...buildHeuristicAnalysis(entry, contextAnalysis, sentimentAnalysis),
    };

    const borderline = isBorderlineCase(entry.assessment);
    const ambiguous = isAmbiguousCase(entry, contextAnalysis, sentimentAnalysis);

    if (borderline) {
      borderlineCases += 1;
    }
    if (ambiguous) {
      ambiguousCases += 1;
    }

    let finalAnalysis = heuristicAnalysis;
    let usedReasoning = false;

    const shouldInvokeGroq = groqEnabled && (borderline || ambiguous);
    if (shouldInvokeGroq) {
      if (groqCallsUsed >= groqReasoningCapPerCycle) {
        groqSkippedByCap += 1;
      } else {
        try {
          const prompt = buildGroqReasoningPrompt(
            entry,
            heuristicAnalysis,
            contextAnalysis,
            sentimentAnalysis
          );
          const responseText = await generateGroqReasoning(prompt);
          const parsed = extractJsonPayload(responseText);
          finalAnalysis = normalizeReasoningAnalysis(parsed, heuristicAnalysis);
          groqCallsUsed += 1;
          usedReasoning = true;
        } catch (error) {
          await logProcessing(
            "failed",
            `[ERROR] Groq reasoning failed ${entry.post._id}: ${error.message}`
          );
        }
      }
    }

    try {
      await persistAnalysisResult(entry, finalAnalysis, {
        context: Boolean(contextAnalysis?.fromModel),
        sentiment: Boolean(sentimentAnalysis?.fromModel),
        reasoning: usedReasoning,
      });
    } catch (error) {
      await logProcessing(
        "failed",
        `[ERROR] Post processing failed ${entry.post._id}: ${error.message}`
      );
    }
  }

  if (groqSkippedByCap > 0) {
    await logProcessing(
      "success",
      `[INFO] Skipped Groq reasoning for ${groqSkippedByCap} ambiguous/borderline posts due to GROQ_REASONING_CAP_PER_CYCLE=${groqReasoningCapPerCycle}`
    );
  }

  if (groqEnabled) {
    await logProcessing("running", `[INFO] Groq model active | model=${getGroqModel()}`);
  }

  await logProcessing(
    "success",
    `[COMPLETED] AI analysis completed | scanned: ${posts.length} | queued: ${queuedForThreatAnalysis.length} | minilm_calls: ${minilmCallsUsed} | xlmr_calls: ${xlmrCallsUsed} | groq_calls: ${groqCallsUsed} | ambiguous: ${ambiguousCases} | borderline: ${borderlineCases} | reasoning_skipped: ${groqSkippedByCap}`
  );
}
