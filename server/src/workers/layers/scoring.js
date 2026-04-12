import { threatKeywords, indiaKeywords, sectorKeywords } from "./threadDictionary.js";

export function calculateThreatScore(text) {
  if (!text) return 0;
  const lower = text.toLowerCase();
  let score = 0;

  threatKeywords.forEach((word) => {
    if (lower.includes(word)) score += 3;
  });

  indiaKeywords.forEach((word) => {
    if (lower.includes(word)) score += 4;
  });

  sectorKeywords.forEach((word) => {
    if (lower.includes(word)) score += 5;
  });

  return score;
}

export function isHighRisk(text) {
  return calculateThreatScore(text) >= 6;
}