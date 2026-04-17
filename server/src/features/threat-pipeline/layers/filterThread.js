import { threatKeywords } from "./threadDictionary.js";

export function containsThreatWords(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return threatKeywords.some((keyword) => lowerText.includes(keyword));
}

const maliciousIntentIndicators = [
  "selling access",
  "access for sale",
  "admin access",
  "dump",
  "database leak",
  "data breach",
  "credentials leak",
  "api key exposed",
  "rce",
  "sql injection",
  "exploit",
  "vulnerability",
  "breach",
  "bypass login",
  "stealer",
  "ransomware",
  "0day",
  "zero-day",
  "botnet",
  "ddos",
];

const noiseIndicators = [
  "ctf",
  "capture the flag",
  "tutorial",
  "guide",
  "for learning",
  "for class",
  "course",
  "bootcamp",
  "homework",
  "practice lab",
  "demo",
  "proof of concept",
  "poc only",
  "hiring",
  "job",
  "resume",
  "internship",
  "meme",
  "joke",
  "gaming",
  "help me",
  "how do i",
  "how to",
  "any tips",
  "newbie",
  "beginner",
];

function countMatches(text, dictionary) {
  return dictionary.reduce((count, token) => count + (text.includes(token) ? 1 : 0), 0);
}

export function evaluateThreatCandidate(content, title = "") {
  const merged = `${title || ""}\n${content || ""}`.toLowerCase();
  const hasThreatTerms = containsThreatWords(merged);

  if (!hasThreatTerms) {
    return {
      hasThreatTerms,
      shouldAnalyze: false,
      isLikelyNoise: false,
      reason: "No threat vocabulary",
      maliciousSignals: 0,
      noiseSignals: 0,
    };
  }

  const maliciousSignals = countMatches(merged, maliciousIntentIndicators);
  const noiseSignals = countMatches(merged, noiseIndicators);
  const textLength = merged.replace(/\s+/g, " ").trim().length;

  const tooShortAndWeak = textLength < 40 && maliciousSignals === 0;
  const likelyQuestionOnly =
    (merged.includes("?") || merged.includes("help me") || merged.includes("how to")) &&
    maliciousSignals === 0;

  const isLikelyNoise = (noiseSignals >= 2 && maliciousSignals === 0) || tooShortAndWeak || likelyQuestionOnly;

  return {
    hasThreatTerms,
    shouldAnalyze: !isLikelyNoise,
    isLikelyNoise,
    reason: isLikelyNoise ? "Noise/benign educational chatter" : "Candidate retained",
    maliciousSignals,
    noiseSignals,
  };
}
