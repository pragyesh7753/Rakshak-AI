import {
  threatKeywords,
  indiaKeywords,
  sectorKeywords
} from "./threadDictonary.js";

export function calculateThreatScore(text) {
  const lower = text.toLowerCase();
  let score = 0;

  // threat keywords → +3
  threatKeywords.forEach(word => {
    if (lower.includes(word)) score += 3;
  });

  // india keywords → +4
  indiaKeywords.forEach(word => {
    if (lower.includes(word)) score += 4;
  });

  // sector keywords → +5
  sectorKeywords.forEach(word => {
    if (lower.includes(word)) score += 5;
  });

  return score;
}

export function isHighRisk(text) {
  const score = calculateThreatScore(text);
  return score >= 6; // threshold
}
