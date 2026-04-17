import mongoose from "mongoose";

const threatSchema = new mongoose.Schema(
  {
    rawPost: { type: mongoose.Schema.Types.ObjectId, ref: "RawPost", required: true, index: true },
    threatType: { type: String, required: true, trim: true },
    sector: { type: String, trim: true },
    severityScore: { type: Number, min: 0, max: 10, default: 0 },
    credibilityScore: { type: Number, min: 0, max: 10, default: 0 },
    impactLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    priority: {
      type: String,
      enum: ["medium", "high", "critical"],
      default: "medium",
      index: true,
    },
    organizationsMentioned: { type: [String], default: [] },
    indicators: { type: [String], default: [] },
    summary: { type: String, default: "" },
    recommendedAction: { type: String, default: "" },
    likelyTimeframe: {
      type: String,
      enum: ["immediate", "days", "weeks", "unknown"],
      default: "unknown",
    },
    aiConfidence: { type: Number, min: 0, max: 1, default: 0.5 },
  },
  { timestamps: true }
);

export const Threat = mongoose.model("Threat", threatSchema);