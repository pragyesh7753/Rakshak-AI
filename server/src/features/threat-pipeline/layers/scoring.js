import { threatKeywords, indiaKeywords, sectorKeywords } from "./threadDictionary.js";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function countKeywordHits(text, keywords) {
  return keywords.reduce((total, token) => total + (text.includes(token) ? 1 : 0), 0);
}

function countRegexHits(text, patterns) {
  return patterns.reduce((total, pattern) => total + (pattern.test(text) ? 1 : 0), 0);
}

const exploitationPatterns = [
  /\bcve-\d{4}-\d{4,7}\b/i,
  /\b(?:rce|xss|csrf|sqli|sql injection|auth bypass|privilege escalation)\b/i,
  /\b(?:zero[ -]?day|0day|n-day)\b/i,
  /\b(?:payload|persistence|lateral movement)\b/i,
];

const criminalIntentPatterns = [
  /\b(?:selling|for sale|wts|access for sale|initial access)\b/i,
  /\b(?:dump|leak(ed)?|combo list|logs for sale|breach data)\b/i,
  /\b(?:stealer|infostealer|ransomware|botnet|ddos)\b/i,
];

const evidencePatterns = [
  /\bhttps?:\/\//i,
  /\b(?:onion|pastebin|mega\.nz|anonfiles|telegram)\b/i,
  /\b(?:sha256|md5|ioc|indicator|sample hash)\b/i,
  /\b\d{1,3}(?:\.\d{1,3}){3}\b/i,
];

const deRiskPatterns = [
  /\b(?:ctf|capture the flag|writeup|tutorial|guide|for learning|homework|course)\b/i,
  /\b(?:job|hiring|resume|internship|career)\b/i,
  /\b(?:help me|how to|newbie|beginner)\b/i,
  /\b(?:demo|proof of concept|poc only|lab environment)\b/i,
];

export function calculateThreatAssessment(text) {
  if (!text) {
    return {
      score: 0,
      confidence: 0,
      matchedSignals: {
        threatTerms: 0,
        geographyTerms: 0,
        sectorTerms: 0,
        exploitationSignals: 0,
        criminalIntentSignals: 0,
        evidenceSignals: 0,
        deRiskSignals: 0,
      },
    };
  }

  const lower = text.toLowerCase();
  const matchedSignals = {
    threatTerms: countKeywordHits(lower, threatKeywords),
    geographyTerms: countKeywordHits(lower, indiaKeywords),
    sectorTerms: countKeywordHits(lower, sectorKeywords),
    exploitationSignals: countRegexHits(lower, exploitationPatterns),
    criminalIntentSignals: countRegexHits(lower, criminalIntentPatterns),
    evidenceSignals: countRegexHits(lower, evidencePatterns),
    deRiskSignals: countRegexHits(lower, deRiskPatterns),
  };

  const weightedRawScore =
    matchedSignals.threatTerms * 2 +
    matchedSignals.geographyTerms * 1.5 +
    matchedSignals.sectorTerms * 1.5 +
    matchedSignals.exploitationSignals * 3 +
    matchedSignals.criminalIntentSignals * 3 +
    matchedSignals.evidenceSignals * 1.25 -
    matchedSignals.deRiskSignals * 2.5;

  const normalizedScore = clamp(Math.round(weightedRawScore) / 2, 0, 10);

  const confidenceRaw =
    (matchedSignals.exploitationSignals + matchedSignals.criminalIntentSignals) * 18 +
    matchedSignals.evidenceSignals * 10 +
    matchedSignals.threatTerms * 6 -
    matchedSignals.deRiskSignals * 15;

  const confidence = clamp(Math.round(confidenceRaw), 0, 100);

  return {
    score: normalizedScore,
    confidence,
    matchedSignals,
  };
}

export function calculateThreatScore(text) {
  return calculateThreatAssessment(text).score;
}

export function isHighRisk(input, threshold = 6) {
  if (typeof input === "number") {
    return input >= threshold;
  }
  if (typeof input === "object" && input !== null && typeof input.score === "number") {
    return input.score >= threshold;
  }
  return calculateThreatScore(input) >= threshold;
}
