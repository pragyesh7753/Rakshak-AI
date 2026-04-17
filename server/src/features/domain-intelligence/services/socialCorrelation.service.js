import { RawPost } from "../../../models/RawPost.js";
import { Threat } from "../../../models/Threat.js";
import { evaluateThreatCandidate } from "../../threat-pipeline/layers/filterThread.js";
import {
  DOMAIN_INTELLIGENCE_SOCIAL_SAMPLE_LIMIT,
  DOMAIN_INTELLIGENCE_SOCIAL_SCAN_LIMIT,
} from "../config/domainIntelligence.config.js";
import { escapeRegex, normalizeDomain } from "../utils/domainNormalization.js";

const PHISHING_TERMS = [
  "phish",
  "credential",
  "otp",
  "verify",
  "login",
  "signin",
  "account",
  "bank",
  "wallet",
  "suspended",
];

function hasPhishingSignals(text) {
  const lower = String(text ?? "").toLowerCase();
  return PHISHING_TERMS.some((token) => lower.includes(token));
}

function classifyPost(post, threat) {
  const postText = `${String(post?.title ?? "")} ${String(post?.content ?? "")}`;
  const threatText = `${String(threat?.threatType ?? "")} ${String(threat?.summary ?? "")} ${
    Array.isArray(threat?.indicators) ? threat.indicators.join(" ") : ""
  }`;

  if (hasPhishingSignals(threatText) || (threat && hasPhishingSignals(postText))) {
    return "phishing";
  }

  if (threat) {
    if (threat.priority === "critical" || threat.priority === "high") {
      return "warning";
    }
    if (Number(threat.severityScore ?? 0) >= 5) {
      return "warning";
    }
  }

  const candidate = evaluateThreatCandidate(String(post?.content ?? ""), String(post?.title ?? ""));
  if (candidate.shouldAnalyze || candidate.maliciousSignals > 0) {
    return hasPhishingSignals(postText) ? "phishing" : "warning";
  }

  return "neutral";
}

export async function scanSocialMedia(domain) {
  const normalizedDomain = normalizeDomain(domain);
  if (!normalizedDomain) {
    return {
      mentions: 0,
      phishingPosts: 0,
      samplePosts: [],
    };
  }

  const pattern = new RegExp(escapeRegex(normalizedDomain), "i");

  const posts = await RawPost.find({
    $or: [{ title: pattern }, { content: pattern }, { url: pattern }],
  })
    .select("_id title content url postedAt createdAt")
    .sort({ createdAt: -1 })
    .limit(DOMAIN_INTELLIGENCE_SOCIAL_SCAN_LIMIT)
    .lean();

  if (posts.length === 0) {
    return {
      mentions: 0,
      phishingPosts: 0,
      samplePosts: [],
    };
  }

  const postIds = posts.map((post) => post._id);
  const threatDocs = await Threat.find({ rawPost: { $in: postIds } })
    .select("rawPost threatType summary indicators priority severityScore")
    .lean();

  const threatByRawPost = new Map(
    threatDocs.map((item) => [String(item.rawPost), item])
  );

  let phishingPosts = 0;
  const samplePosts = [];

  for (const post of posts) {
    const threat = threatByRawPost.get(String(post._id));
    const classification = classifyPost(post, threat);

    if (classification === "phishing") {
      phishingPosts += 1;
    }

    if (samplePosts.length < DOMAIN_INTELLIGENCE_SOCIAL_SAMPLE_LIMIT) {
      samplePosts.push({
        postId: String(post._id),
        title: String(post.title ?? ""),
        url: String(post.url ?? ""),
        classification,
        timestamp: post.postedAt ?? post.createdAt ?? null,
      });
    }
  }

  return {
    mentions: posts.length,
    phishingPosts,
    samplePosts,
  };
}
