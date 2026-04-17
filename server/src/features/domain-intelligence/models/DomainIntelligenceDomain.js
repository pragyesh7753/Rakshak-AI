import mongoose from "mongoose";
import { DOMAIN_INTELLIGENCE_FLAG_VALUES } from "../config/domainIntelligence.config.js";

const domainIntelligenceDomainSchema = new mongoose.Schema(
  {
    domain: { type: String, required: true, trim: true, index: true },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    riskScore: { type: Number, min: 0, max: 100, default: 0, index: true },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
      index: true,
    },
    flags: {
      type: [String],
      enum: DOMAIN_INTELLIGENCE_FLAG_VALUES,
      default: [],
    },
    similarityScore: { type: Number, min: 0, max: 1, default: 0 },
    domainAgeDays: { type: Number, min: 0, default: null },
    registeredAt: { type: Date, default: null },
    sources: {
      whoisExists: { type: Boolean, default: false },
      whoisCreationDate: { type: Date, default: null },
      crtMatches: {
        type: [
          {
            domain: { type: String, default: "" },
            timestamp: { type: Date, default: null },
          },
        ],
        default: [],
      },
      socialMentions: { type: Number, min: 0, default: 0 },
      phishingPosts: { type: Number, min: 0, default: 0 },
      samplePosts: {
        type: [
          {
            postId: { type: String, default: "" },
            title: { type: String, default: "" },
            url: { type: String, default: "" },
            classification: { type: String, default: "neutral" },
            timestamp: { type: Date, default: null },
          },
        ],
        default: [],
      },
    },
    lastCheckedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

domainIntelligenceDomainSchema.index({ orgId: 1, domain: 1 }, { unique: true });

export const DomainIntelligenceDomain = mongoose.model(
  "DomainIntelligenceDomain",
  domainIntelligenceDomainSchema
);
