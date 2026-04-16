import mongoose from "mongoose";

function normalizeKeywordList(value) {
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

const organizationSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    orgName: { type: String, required: true, trim: true },
    sector: { type: String, required: true, trim: true },
    domain: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true, maxlength: 1200 },
    seedKeywords: { type: [String], default: [], set: normalizeKeywordList },
    keywords: { type: [String], default: [], set: normalizeKeywordList },
  },
  { timestamps: true }
);

export const Organization = mongoose.model("Organization", organizationSchema);