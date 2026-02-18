import { threatKeywords } from "./threadDictonary.js";

export function containsThreatWords(text) {
  if (!text) return false;

  const lowerText = text.toLowerCase();

  return threatKeywords.some(keyword =>
    lowerText.includes(keyword)
  );
}
