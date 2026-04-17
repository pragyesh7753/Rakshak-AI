import mongoose from "mongoose";

function normalizeKeywords(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set();
  const normalized = [];

  for (const entry of value) {
    const token = String(entry ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .slice(0, 80);

    if (token.length < 3 || seen.has(token)) {
      continue;
    }

    seen.add(token);
    normalized.push(token);
  }

  return normalized;
}

const keywordScoreSchema = new mongoose.Schema(
  {
    keyword: { type: String, required: true, trim: true },
    similarity: { type: Number, default: 0 },
  },
  { _id: false }
);

const organizationKeywordBankSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      unique: true,
      index: true,
    },
    profileText: { type: String, default: "" },
    profileSignature: { type: String, required: true, trim: true, index: true },
    baselineKeywords: { type: [String], default: [], set: normalizeKeywords },
    generatedKeywords: { type: [String], default: [], set: normalizeKeywords },
    expandedKeywords: { type: [String], default: [], set: normalizeKeywords },
    finalKeywords: { type: [String], default: [], set: normalizeKeywords },
    embeddingScores: { type: [keywordScoreSchema], default: [] },
    provider: { type: String, default: "fallback", trim: true },
    model: { type: String, default: "", trim: true },
    fallbackUsed: { type: Boolean, default: false },
    generatedAt: { type: Date },
    lastError: { type: String, default: "" },
  },
  { timestamps: true }
);

export const OrganizationKeywordBank = mongoose.model(
  "OrganizationKeywordBank",
  organizationKeywordBankSchema
);
